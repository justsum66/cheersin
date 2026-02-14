/**
 * POST /api/games/rooms/[slug]/cheers — Killer 派對房：乾杯計數原子遞增，Realtime 可訂閱 game_states 同步
 */
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'
import { getRoomBySlug, SLUG_PATTERN } from '@/lib/games-room'
import { ROOM_ERROR, ROOM_MESSAGE } from '@/lib/api-error-codes'

const PARTY_ROOM_GAME_ID = 'party-room'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug || !SLUG_PATTERN.test(slug)) {
      return errorResponse(400, ROOM_ERROR.INVALID_SLUG, { message: ROOM_MESSAGE.INVALID_SLUG })
    }
    const supabase = createServerClient()
    const { data: room, error: roomError } = await getRoomBySlug(supabase, slug, 'id')
    if (roomError || !room) {
      return errorResponse(404, ROOM_ERROR.ROOM_NOT_FOUND, { message: ROOM_MESSAGE.ROOM_NOT_FOUND })
    }
    const { data: existing } = await supabase
      .from('game_states')
      .select('payload')
      .eq('room_id', room.id)
      .eq('game_id', PARTY_ROOM_GAME_ID)
      .maybeSingle()
    const prev = (existing?.payload as { cheersCount?: number } | null) ?? {}
    const cheersCount = Math.max(0, Number(prev.cheersCount) || 0) + 1
    const payload = { ...prev, cheersCount }
    const { data: row, error: upsertError } = await supabase
      .from('game_states')
      .upsert(
        { room_id: room.id, game_id: PARTY_ROOM_GAME_ID, payload },
        { onConflict: 'room_id,game_id' }
      )
      .select('payload, updated_at')
      .single()
    if (upsertError) throw upsertError
    return NextResponse.json({
      cheersCount: (row?.payload as { cheersCount?: number })?.cheersCount ?? cheersCount,
      updatedAt: row?.updated_at,
    })
  } catch (e: unknown) {
    logger.error('Cheers POST failed', { error: e instanceof Error ? e.message : 'Unknown' })
    return serverErrorResponse(e)
  }
}
