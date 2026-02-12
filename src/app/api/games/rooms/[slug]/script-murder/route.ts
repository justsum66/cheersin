/**
 * Phase 3 5.1 #5 #6 #12：劇本殺動作 API
 * POST: advance（僅房主）、vote（寫入投票）、punishment_done（標記懲罰完成並可推進）
 */
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/get-current-user'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { SLUG_PATTERN } from '@/lib/games-room'
import { stripHtml } from '@/lib/sanitize'
import type { ScriptRoomState } from '@/types/script-murder'

const SCRIPT_MURDER_GAME_ID = 'script_murder'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug || !SLUG_PATTERN.test(slug)) return errorResponse(400, 'Invalid slug', { message: '房間代碼格式不正確' })

    const body = (await request.json().catch(() => ({}))) as {
      action?: string
      playerId?: string
      option?: string
    }
    const action = body.action === 'advance' || body.action === 'vote' || body.action === 'punishment_done' ? body.action : null
    if (!action) return errorResponse(400, 'Invalid action', { message: '缺少或無效的 action' })

    const supabase = createServerClient()
    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .select('id, host_id, settings')
      .eq('slug', slug)
      .single()
    if (roomError || !room) return errorResponse(404, 'Room not found', { message: '找不到該房間' })

    const settings = (room.settings as { scriptId?: string; scriptRoom?: boolean }) ?? {}
    if (!settings.scriptRoom || !settings.scriptId) return errorResponse(400, 'Not a script room', { message: '此房間不是劇本殺房' })

    const { data: stateRow, error: stateError } = await supabase
      .from('game_states')
      .select('payload')
      .eq('room_id', room.id)
      .eq('game_id', SCRIPT_MURDER_GAME_ID)
      .maybeSingle()
    if (stateError) return serverErrorResponse(stateError)

    const state = (stateRow?.payload ?? {}) as ScriptRoomState
    if (state.phase === 'ended') return errorResponse(400, 'Game ended', { message: '本局已結束' })

    const user = await getCurrentUser()

    if (action === 'advance') {
      if (!user?.id || room.host_id !== user.id) return errorResponse(403, 'Host only', { message: '僅房主可推進章節' })
      const nextIndex = (state.chapterIndex ?? 0) + 1
      const totalChapters = (state as { totalChapters?: number }).totalChapters ?? 99
      const newState: ScriptRoomState = {
        ...state,
        phase: nextIndex >= totalChapters ? 'ended' : 'play',
        chapterIndex: nextIndex,
        votes: {},
        punishmentDone: false,
        stats: nextIndex >= totalChapters
          ? {
              chaptersCompleted: totalChapters,
              voteRounds: (state.stats?.voteRounds ?? 0) + (state.votes && Object.keys(state.votes).length > 0 ? 1 : 0),
              punishmentCount: (state.stats?.punishmentCount ?? 0) + (state.punishmentDone ? 1 : 0),
            }
          : state.stats,
      }
      const { error: upsertErr } = await supabase
        .from('game_states')
        .upsert({ room_id: room.id, game_id: SCRIPT_MURDER_GAME_ID, payload: newState }, { onConflict: 'room_id,game_id' })
      if (upsertErr) return serverErrorResponse(upsertErr)
      return NextResponse.json({ ok: true, state: newState })
    }

    if (action === 'vote') {
      const playerId = typeof body.playerId === 'string' ? body.playerId.trim() : ''
      const option = typeof body.option === 'string' ? stripHtml(body.option).trim().slice(0, 64) : ''
      if (!playerId || option === '') return errorResponse(400, 'Missing playerId or option', { message: '缺少 playerId 或 option' })
      const { data: player } = await supabase
        .from('game_room_players')
        .select('id')
        .eq('room_id', room.id)
        .eq('id', playerId)
        .single()
      if (!player) return errorResponse(400, 'Invalid player', { message: '無效的玩家' })
      const votes = { ...(state.votes ?? {}), [playerId]: option }
      const newState: ScriptRoomState = { ...state, votes }
      const { error: upsertErr } = await supabase
        .from('game_states')
        .upsert({ room_id: room.id, game_id: SCRIPT_MURDER_GAME_ID, payload: newState }, { onConflict: 'room_id,game_id' })
      if (upsertErr) return serverErrorResponse(upsertErr)
      return NextResponse.json({ ok: true, state: newState })
    }

    if (action === 'punishment_done') {
      const newState: ScriptRoomState = { ...state, punishmentDone: true }
      const { error: upsertErr } = await supabase
        .from('game_states')
        .upsert({ room_id: room.id, game_id: SCRIPT_MURDER_GAME_ID, payload: newState }, { onConflict: 'room_id,game_id' })
      if (upsertErr) return serverErrorResponse(upsertErr)
      return NextResponse.json({ ok: true, state: newState })
    }

    return errorResponse(400, 'Invalid action', { message: '無效的 action' })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
