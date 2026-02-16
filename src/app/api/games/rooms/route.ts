import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { getCurrentUser } from '@/lib/get-current-user'
import { generateShortSlug, hashRoomPassword } from '@/modules/games/room'
import { isRateLimitedAsync, getClientIp } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { normalizePagination, buildPaginatedMeta } from '@/lib/pagination'
import { stripHtml } from '@/lib/sanitize'
import { GamesRoomsPostBodySchema } from '@/lib/api-body-schemas'
import { zodParseBody } from '@/lib/parse-body'
import { ROOM_ERROR, ROOM_MESSAGE, RATE_LIMIT_MESSAGE } from '@/lib/api-error-codes'
import { isPaidTier } from '@/lib/subscription'

const MAX_SLUG_ATTEMPTS = 5

/** P3-62 / P2-310：GET ?host=me 或 ?list=active — host=me 需登入回傳我的房間；list=active 回傳進行中派對房（PR-34） */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const listActive = url.searchParams.get('list') === 'active'

  if (listActive) {
    const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 50)
    const now = new Date().toISOString()
    try {
      const supabase = createServerClient()
      const { data: rows, error } = await supabase
        .from('game_rooms')
        .select('id, slug, created_at, expires_at, settings, game_room_players(id)')
        .not('expires_at', 'is', null)
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(limit * 2)
      if (error) return serverErrorResponse(error)
      const partyRooms = (rows ?? []).filter((r) => (r.settings as { partyRoom?: boolean } | null)?.partyRoom === true).slice(0, limit)
      const list = partyRooms.map((r) => ({
        slug: r.slug,
        expiresAt: r.expires_at,
        createdAt: r.created_at,
        playerCount: Array.isArray(r.game_room_players) ? r.game_room_players.length : 0,
      }))
      return NextResponse.json(
        { rooms: list, meta: { limit, total: list.length } },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
      )
    } catch (e) {
      logger.error('Games rooms list=active failed', { error: e instanceof Error ? e.message : 'Unknown' })
      return serverErrorResponse(e)
    }
  }

  if (url.searchParams.get('host') !== 'me') {
    return errorResponse(400, ROOM_ERROR.BAD_REQUEST, { message: ROOM_MESSAGE.BAD_REQUEST_HOST_OR_LIST })
  }
  const user = await getCurrentUser()
  if (!user?.id) {
    return errorResponse(401, ROOM_ERROR.UNAUTHORIZED, { message: ROOM_MESSAGE.LOGIN_REQUIRED })
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
    return NextResponse.json(
      { rooms: list, meta },
      { headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' } }
    )
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
  if (await isRateLimitedAsync(ip, 'create')) {
    return NextResponse.json(
      { error: RATE_LIMIT_MESSAGE, retryAfter: 60 },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }
  /** BE-21 / PR-31：body 驗證 — 密碼、匿名、派對房、劇本殺 scriptId、maxPlayers；SEC-003 Zod */
  let bodyPassword: string | undefined
  let anonymousMode = false
  let partyRoom = false
  let scriptId: string | undefined
  let bodyMaxPlayers: 4 | 8 | 12 | undefined
  const parsed = await zodParseBody(request, GamesRoomsPostBodySchema, {
    defaultRaw: {},
    invalidJsonMessage: '請提供有效的 JSON body',
    invalidBodyMessage: '請提供有效的 JSON body',
  })
  if (!parsed.success) return parsed.response
  const body = parsed.data
  if (body.password !== undefined) bodyPassword = body.password
  try {
    if (body.anonymousMode === true) anonymousMode = true
    if (body.partyRoom === true) partyRoom = true
    if (body.maxPlayers !== undefined) bodyMaxPlayers = body.maxPlayers
    if (body.scriptId !== undefined && body.scriptId.trim()) scriptId = stripHtml(body.scriptId.trim().slice(0, 64))
  } catch {
    return errorResponse(400, ROOM_ERROR.INVALID_BODY, { message: ROOM_MESSAGE.INVALID_JSON_BODY })
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
      return errorResponse(503, ROOM_ERROR.ROOM_CREATE_LIMIT, { message: ROOM_MESSAGE.ROOM_CREATE_LIMIT })
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
        return errorResponse(400, ROOM_ERROR.INVALID_SCRIPT, { message: ROOM_MESSAGE.INVALID_SCRIPT })
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
      const isPaid = isPaidTier(tier)
      const defaultMax = isPaid ? 12 : 4
      if (bodyMaxPlayers !== undefined) {
        if (!isPaid && bodyMaxPlayers > 4) {
          return errorResponse(400, ROOM_ERROR.UPGRADE_REQUIRED, { message: ROOM_MESSAGE.UPGRADE_REQUIRED })
        }
        maxPlayers = bodyMaxPlayers
      } else {
        maxPlayers = defaultMax
      }
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
    /** SEC-013：房間密碼僅存 hash，不明文儲存 */
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
