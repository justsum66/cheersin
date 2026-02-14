/**
 * Phase 3 5.1 #5 #6 #12：劇本殺動作 API
 * POST: advance（僅房主）、vote（寫入投票）、punishment_done（標記懲罰完成並可推進）
 */
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/get-current-user'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { ScriptMurderPostBodySchema } from '@/lib/api-body-schemas'
import { zodParseBody } from '@/lib/parse-body'
import { getRoomBySlug, SLUG_PATTERN } from '@/lib/games-room'
import { ROOM_ERROR, ROOM_MESSAGE } from '@/lib/api-error-codes'
import { stripHtml } from '@/lib/sanitize'
import type { ScriptRoomState } from '@/types/script-murder'

const SCRIPT_MURDER_GAME_ID = 'script_murder'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug || !SLUG_PATTERN.test(slug)) return errorResponse(400, ROOM_ERROR.INVALID_SLUG, { message: ROOM_MESSAGE.INVALID_SLUG })

    const parsed = await zodParseBody(request, ScriptMurderPostBodySchema, {
      defaultRaw: {},
      invalidBodyMessage: '缺少或無效的 action',
    })
    if (!parsed.success) return parsed.response
    const body = parsed.data
    const action = body.action

    const supabase = createServerClient()
    const { data: room, error: roomError } = await getRoomBySlug<{ id: string; host_id: string | null; settings: unknown }>(supabase, slug, 'id, host_id, settings')
    if (roomError || !room) return errorResponse(404, ROOM_ERROR.ROOM_NOT_FOUND, { message: ROOM_MESSAGE.ROOM_NOT_FOUND })

    const settings = (room.settings as { scriptId?: string; scriptRoom?: boolean }) ?? {}
    if (!settings.scriptRoom || !settings.scriptId) return errorResponse(400, ROOM_ERROR.NOT_SCRIPT_ROOM, { message: ROOM_MESSAGE.NOT_SCRIPT_ROOM })

    const { data: stateRow, error: stateError } = await supabase
      .from('game_states')
      .select('payload')
      .eq('room_id', room.id)
      .eq('game_id', SCRIPT_MURDER_GAME_ID)
      .maybeSingle()
    if (stateError) return serverErrorResponse(stateError)

    const state = (stateRow?.payload ?? {}) as ScriptRoomState
    if (state.phase === 'ended') return errorResponse(400, ROOM_ERROR.GAME_ENDED, { message: ROOM_MESSAGE.GAME_ENDED })

    const user = await getCurrentUser()

    if (action === 'advance') {
      if (!user?.id || room.host_id !== user.id) return errorResponse(403, ROOM_ERROR.HOST_ONLY, { message: ROOM_MESSAGE.HOST_ONLY_SCRIPT })
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
      const playerId = (body.playerId ?? '').trim()
      const option = body.option != null ? stripHtml(String(body.option)).trim().slice(0, 64) : ''
      if (!playerId || option === '') return errorResponse(400, ROOM_ERROR.MISSING_PLAYER_OR_OPTION, { message: ROOM_MESSAGE.MISSING_PLAYER_OR_OPTION })
      const { data: player } = await supabase
        .from('game_room_players')
        .select('id')
        .eq('room_id', room.id)
        .eq('id', playerId)
        .single()
      if (!player) return errorResponse(400, ROOM_ERROR.INVALID_PLAYER, { message: ROOM_MESSAGE.INVALID_PLAYER })
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

    return errorResponse(400, ROOM_ERROR.INVALID_ACTION, { message: ROOM_MESSAGE.INVALID_ACTION })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
