/**
 * GET/POST /api/games/rooms/[slug]/game-state
 * 房間內特定遊戲的狀態：讀取（GET）與更新（POST）；P1-15：POST 限流 60/分/IP；P2-29：payload 大小與 key 數限制；PR-32：party-room payload Zod 校驗
 */
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { isRateLimitedAsync, getClientIp } from '@/lib/rate-limit'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'
import { SLUG_PATTERN } from '@/lib/games-room'
import { parsePartyStatePayload } from '@/lib/games/party-state-schema'

const PAYLOAD_MAX_BYTES = 50_000
const PAYLOAD_MAX_KEYS = 100

const GAME_ID_UP_DOWN_STAIRS = 'up-down-stairs'
const GAME_ID_PARTY_ROOM = 'party-room'

/** GET: 查詢該房間指定 game_id 的 state（query: game_id） */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug || !SLUG_PATTERN.test(slug)) return errorResponse(400, 'Invalid slug', { message: '房間代碼格式不正確' })
    const url = new URL(request.url)
    const gameId = url.searchParams.get('game_id') || GAME_ID_UP_DOWN_STAIRS

    try {
      const supabase = createServerClient()
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select('id')
        .eq('slug', slug)
        .single()
      if (roomError || !room) throw roomError || new Error('Room not found')

      const { data: row, error: stateError } = await supabase
        .from('game_states')
        .select('payload, updated_at')
        .eq('room_id', room.id)
        .eq('game_id', gameId)
        .maybeSingle()
      if (stateError) throw stateError

      if (!row) {
        return NextResponse.json({ state: null, updatedAt: null })
      }
      return NextResponse.json({ state: row.payload, updatedAt: row.updated_at })
    } catch (supabaseErr) {
      throw supabaseErr
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    if (message === 'Room not found' || (e as { code?: string })?.code === 'PGRST116') {
      return errorResponse(404, 'Room not found', { message: '找不到該房間' })
    }
    logger.error('Game state GET failed', { error: message })
    return serverErrorResponse(e)
  }
}

/** POST: 更新該房間指定 game_id 的 state（body: game_id, payload） */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const ip = getClientIp(request.headers)
    if (await isRateLimitedAsync(ip, 'game_state')) {
      return NextResponse.json(
        { error: '操作過於頻繁，請稍後再試' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }
    const { slug } = await params
    if (!slug || !SLUG_PATTERN.test(slug)) return errorResponse(400, 'Invalid slug', { message: '房間代碼格式不正確' })
    const body = (await request.json().catch(() => ({}))) as import('@/types/api-bodies').GameStatePostBody
    const gameId = typeof body.game_id === 'string' ? body.game_id : GAME_ID_UP_DOWN_STAIRS
    const rawPayload = body.payload
    if (rawPayload != null && (typeof rawPayload !== 'object' || Array.isArray(rawPayload))) {
      return errorResponse(400, 'payload must be a JSON object', { message: 'Invalid payload type' })
    }
    let payload: Record<string, unknown> = rawPayload != null && typeof rawPayload === 'object' && !Array.isArray(rawPayload) ? rawPayload as Record<string, unknown> : {}
    if (gameId === GAME_ID_PARTY_ROOM) {
      const parsed = parsePartyStatePayload(payload)
      if (!parsed.success) return errorResponse(400, 'INVALID_PARTY_STATE', { message: parsed.error })
      payload = parsed.data as unknown as Record<string, unknown>
    }
    const payloadKeys = Object.keys(payload)
    if (payloadKeys.length > PAYLOAD_MAX_KEYS) {
      return errorResponse(400, 'PAYLOAD_TOO_MANY_KEYS', {
        message: `Maximum ${PAYLOAD_MAX_KEYS} keys allowed`,
      })
    }
    const payloadSize = new TextEncoder().encode(JSON.stringify(payload)).length
    if (payloadSize > PAYLOAD_MAX_BYTES) {
      return errorResponse(400, 'PAYLOAD_TOO_LARGE', {
        message: `Maximum ${PAYLOAD_MAX_BYTES} bytes allowed`,
      })
    }

    try {
      const supabase = createServerClient()
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select('id')
        .eq('slug', slug)
        .single()
      if (roomError || !room) throw roomError || new Error('Room not found')

      /** P3-53：updated_at 由 DB default / trigger 填寫，不傳入 */
      const { data: row, error: upsertError } = await supabase
        .from('game_states')
        .upsert(
          { room_id: room.id, game_id: gameId, payload },
          { onConflict: 'room_id,game_id' }
        )
        .select('payload, updated_at')
        .single()
      if (upsertError) throw upsertError

      return NextResponse.json({ state: row?.payload ?? payload, updatedAt: row?.updated_at })
    } catch (supabaseErr) {
      throw supabaseErr
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    if (message === 'Room not found' || (e as { code?: string })?.code === 'PGRST116') {
      return errorResponse(404, 'Room not found', { message: '找不到該房間' })
    }
    logger.error('Game state POST failed', { error: message })
    return serverErrorResponse(e)
  }
}
