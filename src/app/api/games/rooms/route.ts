import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { getCurrentUser } from '@/lib/get-current-user'
import { generateShortSlug, hashRoomPassword } from '@/lib/games-room'
import { isRateLimited, getClientIp } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { normalizePagination, buildPaginatedMeta } from '@/lib/pagination'
import { stripHtml } from '@/lib/sanitize'

const MAX_SLUG_ATTEMPTS = 5

/** P3-62 / P2-310：GET ?host=me&limit=&offset= — 需登入，回傳當前用戶為 host 的房間列表（分頁） */
export async function GET(request: Request) {
  const url = new URL(request.url)
  if (url.searchParams.get('host') !== 'me') {
    return errorResponse(400, 'Bad request', { message: 'Use host=me to list your rooms' })
  }
  const user = await getCurrentUser()
  if (!user?.id) {
    return errorResponse(401, 'Unauthorized', { message: '請先登入' })
  }
  const { limit, offset } = normalizePagination({
    limit: url.searchParams.get('limit') ?? undefined,
    offset: url.searchParams.get('offset') ?? undefined,
  })
  try {
    const supabase = createServerClient()
    const { data: rooms, error } = await supabase
      .from('game_rooms')
      .select('id, slug, created_at, expires_at')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return serverErrorResponse(error)
    const list = rooms ?? []
    const meta = buildPaginatedMeta(limit, offset, list.length, undefined, list.length >= limit ? String(offset + limit) : null)
    return NextResponse.json({ rooms: list, meta })
  } catch (e) {
    logger.error('Games rooms GET failed', { error: e instanceof Error ? e.message : 'Unknown' })
    return serverErrorResponse(e)
  }
}

function getBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'http://localhost:3000'
  return base.replace(/\/+$/, '')
}

/** POST: 建立遊戲房間，回傳 roomId、slug、inviteUrl；T060 P1：rate limit 10/分/IP */
export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  if (isRateLimited(ip, 'create')) {
    return NextResponse.json(
      { error: '操作過於頻繁，請稍後再試', retryAfter: 60 },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }
  /** BE-21：body 驗證 — 僅接受可選 4 位數字密碼、P0-004 匿名模式、Killer 派對房、#14 劇本殺 scriptId */
  let bodyPassword: string | undefined
  let anonymousMode = false
  let partyRoom = false
  let scriptId: string | undefined
  try {
    const body = (await request.json().catch(() => null)) as import('@/types/api-bodies').GamesRoomsPostBody | null
    if (body && typeof body === 'object') {
      if (typeof body.password === 'string' && /^\d{4}$/.test(body.password)) bodyPassword = body.password
      if (body.anonymousMode === true) anonymousMode = true
      if (body.partyRoom === true) partyRoom = true
      if (typeof body.scriptId === 'string' && body.scriptId.trim()) scriptId = stripHtml(body.scriptId.trim().slice(0, 64))
    }
  } catch {
    return errorResponse(400, 'Invalid JSON', { message: '請提供有效的 JSON body' })
  }
  try {
    const supabase = createServerClient()
    let slug = generateShortSlug()
    let slugFree = false
    for (let i = 0; i < MAX_SLUG_ATTEMPTS; i++) {
      const { data: existing } = await supabase.from('game_rooms').select('id').eq('slug', slug).single()
      if (!existing) {
        slugFree = true
        break
      }
      slug = generateShortSlug()
    }
    if (!slugFree) {
      logger.warn('Game room slug collision: all attempts taken', { attempts: MAX_SLUG_ATTEMPTS })
      return NextResponse.json(
        { error: '暫時無法建立房間，請稍後再試' },
        { status: 503 }
      )
    }
    const user = await getCurrentUser()
    // 劇本殺房：#14 綁定 script_id，人數與過期時間依劇本
    let expiresAt: string
    let maxPlayers: number
    const settings: { anonymousMode?: boolean; max_players?: number; partyRoom?: boolean; scriptId?: string; scriptRoom?: boolean } = {}
    if (anonymousMode) settings.anonymousMode = true

    if (scriptId) {
      const { data: scriptRow, error: scriptErr } = await supabase
        .from('scripts')
        .select('id, min_players, max_players')
        .eq('id', scriptId)
        .single()
      if (scriptErr || !scriptRow) {
        return errorResponse(400, 'Invalid script', { message: '劇本不存在或無法使用' })
      }
      const minP = (scriptRow as { min_players: number | null }).min_players ?? 4
      const maxP = (scriptRow as { max_players: number | null }).max_players ?? 8
      maxPlayers = Math.min(12, Math.max(minP, maxP))
      expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
      settings.scriptId = scriptId
      settings.scriptRoom = true
      settings.max_players = maxPlayers
    } else if (partyRoom && user?.id) {
      const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single()
      const tier = (profile?.subscription_tier as string) ?? 'free'
      const isPaid = tier === 'basic' || tier === 'premium'
      maxPlayers = isPaid ? 12 : 4
      const expiresMs = isPaid ? 24 * 60 * 60 * 1000 : 30 * 60 * 1000
      expiresAt = new Date(Date.now() + expiresMs).toISOString()
      settings.max_players = maxPlayers
      settings.partyRoom = true
    } else {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      maxPlayers = 12
    }

    const insertPayload: {
      slug: string
      password_hash?: string
      expires_at: string
      host_id?: string
      settings?: { anonymousMode?: boolean; max_players?: number; partyRoom?: boolean; scriptId?: string; scriptRoom?: boolean }
    } = { slug, expires_at: expiresAt }
    if (bodyPassword) insertPayload.password_hash = hashRoomPassword(bodyPassword)
    if (user?.id) insertPayload.host_id = user.id
    if (Object.keys(settings).length > 0) insertPayload.settings = settings
    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .insert(insertPayload)
      .select('id, slug, created_at')
      .single()
    if (roomError || !room) return serverErrorResponse(roomError)
    logger.info('Game room created', { slug: room.slug, roomId: room.id, partyRoom, scriptId })
    let invitePath = '/games?room=' + room.slug
    if (scriptId) invitePath = `/script-murder?room=${room.slug}`
    else if (partyRoom) invitePath = `/party-room?room=${room.slug}`
    const res: { roomId: string; slug: string; inviteUrl: string; createdAt: string; maxPlayers?: number; scriptId?: string } = {
      roomId: room.id,
      slug: room.slug,
      inviteUrl: `${getBaseUrl()}${invitePath}`,
      createdAt: room.created_at,
    }
    if (partyRoom || scriptId) res.maxPlayers = maxPlayers
    if (scriptId) res.scriptId = scriptId
    return NextResponse.json(res)
  } catch (e: unknown) {
    return serverErrorResponse(e)
  }
}
