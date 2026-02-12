import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { hashRoomPassword, secureComparePasswordHash, SLUG_PATTERN } from '@/lib/games-room'
import { stripHtml } from '@/lib/sanitize'
import { isRateLimited, getClientIp } from '@/lib/rate-limit'
import { JoinRoomBodySchema } from '@/lib/api-body-schemas'

const MAX_PLAYERS = 12

/** POST: 加入房間（body: displayName, password?, isSpectator?）；T060 P1：rate limit 30/分/IP；SEC-003 Zod 校驗 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const ip = getClientIp(request.headers)
    if (isRateLimited(ip, 'join')) {
      return NextResponse.json(
        { error: '操作過於頻繁，請稍後再試', retryAfter: 60 },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }
    const { slug } = await params
    if (!slug || !SLUG_PATTERN.test(slug)) return errorResponse(400, 'Invalid slug', { message: '房間代碼格式不正確' })
    const raw = await request.json().catch(() => ({}))
    const parsed = JoinRoomBodySchema.safeParse(raw)
    if (!parsed.success) {
      return errorResponse(400, 'Invalid body', { message: '請輸入顯示名稱' })
    }
    const { displayName: rawName, isSpectator: isSpectatorRaw } = parsed.data
    const displayName = stripHtml(rawName).slice(0, 20)
    if (!displayName) return errorResponse(400, 'displayName required', { message: '請輸入顯示名稱' })
    const isSpectator = isSpectatorRaw === true
    try {
      const supabase = createServerClient()
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select('id, password_hash, settings')
        .eq('slug', slug)
        .single()
      if (roomError || !room) throw roomError || new Error('Room not found')
      const roomWithHash = room as { id: string; password_hash?: string | null; settings?: { max_players?: number } | null }
      if (roomWithHash.password_hash) {
        const provided = typeof parsed.data.password === 'string' ? parsed.data.password.trim() : ''
        const hash = hashRoomPassword(provided)
        if (!secureComparePasswordHash(hash, roomWithHash.password_hash)) {
          return errorResponse(403, 'INVALID_PASSWORD', { message: '房間密碼錯誤' })
        }
      }
      const maxPlayersForRoom = typeof roomWithHash.settings?.max_players === 'number' ? roomWithHash.settings.max_players : MAX_PLAYERS
      const { data: existingPlayers } = await supabase
        .from('game_room_players')
        .select('id, is_spectator')
        .eq('room_id', room.id)
      const nonSpectatorCount = (existingPlayers ?? []).filter((p) => !(p as { is_spectator?: boolean }).is_spectator).length
      if (!isSpectator && nonSpectatorCount >= maxPlayersForRoom) {
        return errorResponse(400, 'ROOM_FULL', { message: '房間已滿' })
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
      return errorResponse(404, 'Room not found', { message: '找不到該房間' })
    }
    return serverErrorResponse(e)
  }
}
