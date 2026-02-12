/**
 * POST /api/games/rooms/[slug]/leave
 * SM-03：離開房間 — 將當前玩家標記為非活躍（is_active = false）
 * GAME-004：房主離開時房間立即結束（expires_at 設為現在），其餘玩家會看到 PartyRoomEnded
 */
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { SLUG_PATTERN } from '@/lib/games-room'
import { LeaveRoomBodySchema } from '@/lib/api-body-schemas'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug || !SLUG_PATTERN.test(slug)) return errorResponse(400, 'Invalid slug', { message: '房間代碼格式不正確' })
    const raw = await request.json().catch(() => ({}))
    const parsed = LeaveRoomBodySchema.safeParse(raw)
    if (!parsed.success) {
      return errorResponse(400, 'Invalid body', { message: '缺少玩家識別' })
    }
    const { playerId } = parsed.data
    const supabase = createServerClient()

    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .select('id, host_id')
      .eq('slug', slug)
      .single()
    if (roomError || !room) {
      return errorResponse(404, 'Room not found', { message: '房間不存在或已過期' })
    }

    const { data: player, error: playerErr } = await supabase
      .from('game_room_players')
      .select('id, user_id')
      .eq('id', playerId)
      .eq('room_id', room.id)
      .single()
    if (playerErr || !player) {
      return errorResponse(404, 'Player not in room', { message: '找不到該玩家' })
    }

    const { error: updateError } = await supabase
      .from('game_room_players')
      .update({ is_active: false })
      .eq('id', playerId)
      .eq('room_id', room.id)
    if (updateError) throw updateError

    const isHostLeaving = room.host_id != null && player.user_id != null && room.host_id === player.user_id
    if (isHostLeaving) {
      const now = new Date().toISOString()
      const { error: endErr } = await supabase
        .from('game_rooms')
        .update({ expires_at: now })
        .eq('id', room.id)
      if (endErr) throw endErr
      return NextResponse.json({ ok: true, endRoom: true, expiresAt: now })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
