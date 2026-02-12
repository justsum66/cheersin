/**
 * POST /api/games/rooms/[slug]/leave
 * SM-03：離開房間 — 將當前玩家標記為非活躍（is_active = false）或從 game_room_players 移除
 */
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { SLUG_PATTERN } from '@/lib/games-room'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug || !SLUG_PATTERN.test(slug)) return errorResponse(400, 'Invalid slug', { message: '房間代碼格式不正確' })
    const body = (await request.json().catch(() => ({}))) as { playerId?: string }
    const playerId = typeof body.playerId === 'string' ? body.playerId.trim() : ''
    if (!playerId) return errorResponse(400, 'playerId required', { message: '缺少玩家識別' })
    const supabase = createServerClient()
    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .select('id')
      .eq('slug', slug)
      .single()
    if (roomError || !room) {
      return errorResponse(404, 'Room not found', { message: '房間不存在或已過期' })
    }
    const { error: updateError } = await supabase
      .from('game_room_players')
      .update({ is_active: false })
      .eq('id', playerId)
      .eq('room_id', room.id)
    if (updateError) throw updateError
    return NextResponse.json({ ok: true })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
