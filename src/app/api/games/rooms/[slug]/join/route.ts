import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { getRoomBySlug, hashRoomPassword, secureComparePasswordHash, SLUG_PATTERN } from '@/lib/games-room'
import { ROOM_ERROR, ROOM_MESSAGE, RATE_LIMIT_MESSAGE } from '@/lib/api-error-codes'
import { sanitizeUserInput } from '@/lib/sanitize'
import { isRateLimitedAsync, getClientIp } from '@/lib/rate-limit'
import { JoinRoomBodySchema } from '@/lib/api-body-schemas'
import { zodParseBody } from '@/lib/parse-body'

const MAX_PLAYERS = 12

/** POST: 加入房間（body: displayName, password?, isSpectator?）；T060 P1：rate limit 30/分/IP；SEC-003 Zod 校驗 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const ip = getClientIp(request.headers)
    if (await isRateLimitedAsync(ip, 'join')) {
      const res = errorResponse(429, 'RATE_LIMITED', { message: RATE_LIMIT_MESSAGE })
      res.headers.set('Retry-After', '60')
      return res
    }
    const { slug } = await params
    if (!slug || !SLUG_PATTERN.test(slug)) return errorResponse(400, ROOM_ERROR.INVALID_SLUG, { message: ROOM_MESSAGE.INVALID_SLUG })
    const parsed = await zodParseBody(request, JoinRoomBodySchema, { defaultRaw: {}, invalidBodyMessage: '請輸入顯示名稱' })
    if (!parsed.success) return parsed.response
    const { displayName: rawName, isSpectator: isSpectatorRaw } = parsed.data
    const displayName = sanitizeUserInput(rawName, 20)
    if (!displayName) return errorResponse(400, ROOM_ERROR.DISPLAY_NAME_REQUIRED, { message: ROOM_MESSAGE.DISPLAY_NAME_REQUIRED })
    const isSpectator = isSpectatorRaw === true
    try {
      const supabase = createServerClient()
      const { data: room, error: roomError } = await getRoomBySlug<{ id: string; password_hash?: string | null; settings?: { max_players?: number } | null }>(supabase, slug, 'id, password_hash, settings')
      if (roomError || !room) throw roomError || new Error('Room not found')
      const roomWithHash = room
      if (roomWithHash.password_hash) {
        const provided = typeof parsed.data.password === 'string' ? parsed.data.password.trim() : ''
        const hash = hashRoomPassword(provided)
        if (!secureComparePasswordHash(hash, roomWithHash.password_hash)) {
          return errorResponse(403, ROOM_ERROR.INVALID_PASSWORD, { message: ROOM_MESSAGE.INVALID_PASSWORD })
        }
      }
      const maxPlayersForRoom = typeof roomWithHash.settings?.max_players === 'number' ? roomWithHash.settings.max_players : MAX_PLAYERS
      const { data: existingPlayers } = await supabase
        .from('game_room_players')
        .select('id, is_spectator')
        .eq('room_id', room.id)
      const nonSpectatorCount = (existingPlayers ?? []).filter((p) => !(p as { is_spectator?: boolean }).is_spectator).length
      if (!isSpectator && nonSpectatorCount >= maxPlayersForRoom) {
        return errorResponse(400, ROOM_ERROR.ROOM_FULL, { message: ROOM_MESSAGE.ROOM_FULL })
      }
      const nextIndex = (existingPlayers ?? []).length
      const insertPayload: { room_id: string; display_name: string; order_index: number; is_spectator?: boolean } = {
        room_id: room.id,
        display_name: displayName,
        order_index: nextIndex,
      }
      if (isSpectator) insertPayload.is_spectator = true
      const { data: player, error: insertError } = await supabase
        .from('game_room_players')
        .insert(insertPayload)
        .select('id, display_name, order_index')
        .single()
      if (insertError) throw insertError
      const { data: players } = await supabase
        .from('game_room_players')
        .select('id, display_name, order_index')
        .eq('room_id', room.id)
        .order('order_index', { ascending: true })
      return NextResponse.json({
        ok: true,
        player: { id: player.id, displayName: player.display_name, orderIndex: player.order_index },
        players: (players || []).map((p) => ({ id: p.id, displayName: p.display_name, orderIndex: p.order_index })),
      })
    } catch (supabaseErr) {
      throw supabaseErr
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    if (message === 'Room not found' || (e as { code?: string })?.code === 'PGRST116') {
      return errorResponse(404, ROOM_ERROR.ROOM_NOT_FOUND, { message: ROOM_MESSAGE.ROOM_NOT_FOUND })
    }
    return serverErrorResponse(e)
  }
}
