import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { getCurrentUser } from '@/lib/get-current-user'
import { generateShortSlug, hashRoomPassword } from '@/lib/games-room'
import { getMockStore, mockCreateRoom } from '@/lib/games-room-mock'
import { isRateLimited, getClientIp } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { normalizePagination, buildPaginatedMeta } from '@/lib/pagination'

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
  /** BE-21：body 驗證 — 僅接受可選 4 位數字密碼、P0-004 匿名模式；解析失敗不視為必填 */
  let bodyPassword: string | undefined
  let anonymousMode = false
  try {
    const body = (await request.json().catch(() => null)) as import('@/types/api-bodies').GamesRoomsPostBody | null
    if (body && typeof body === 'object') {
      if (typeof body.password === 'string' && /^\d{4}$/.test(body.password)) bodyPassword = body.password
      if (body.anonymousMode === true) anonymousMode = true
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
    // P1-20：建立房間時預設 expires_at = now + 24h，供 cleanup-expired-rooms 清理
    // P3-43：若已登入則寫入 host_id，供 RLS 房主可修改
    const user = await getCurrentUser()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const insertPayload: { slug: string; password_hash?: string; expires_at: string; host_id?: string; settings?: { anonymousMode?: boolean } } = { slug, expires_at: expiresAt }
    if (bodyPassword) insertPayload.password_hash = hashRoomPassword(bodyPassword)
    if (user?.id) insertPayload.host_id = user.id
    if (anonymousMode) insertPayload.settings = { anonymousMode: true }
    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .insert(insertPayload)
      .select('id, slug, created_at')
      .single()
    if (roomError || !room) {
      if (getMockStore()) {
        const mockRoom = mockCreateRoom(slug, bodyPassword)
        return NextResponse.json({
          roomId: mockRoom.id,
          slug: mockRoom.slug,
          inviteUrl: `${getBaseUrl()}/games?room=${mockRoom.slug}`,
          createdAt: mockRoom.created_at,
        })
      }
      return serverErrorResponse(roomError)
    }
    logger.info('Game room created', { slug: room.slug, roomId: room.id })
    return NextResponse.json({
      roomId: room.id,
      slug: room.slug,
      inviteUrl: `${getBaseUrl()}/games?room=${room.slug}`,
      createdAt: room.created_at,
    })
  } catch (e: unknown) {
    if (getMockStore()) {
      const slug = generateShortSlug()
      const room = mockCreateRoom(slug, bodyPassword)
      return NextResponse.json({
        roomId: room.id,
        slug: room.slug,
        inviteUrl: `${getBaseUrl()}/games?room=${room.slug}`,
        createdAt: room.created_at,
      })
    }
    return serverErrorResponse(e)
  }
}
