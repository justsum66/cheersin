import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { getCurrentUser } from '@/lib/get-current-user'
import { getRoomBySlug, SLUG_PATTERN } from '@/lib/games-room'
import { ROOM_ERROR, ROOM_MESSAGE } from '@/lib/api-error-codes'
import { GamesRoomsPatchBodySchema } from '@/lib/api-body-schemas'

/** GET: 依 slug 取得房間與玩家名單；Supabase 失敗時 dev 用 in-memory fallback；P3-59：slug 格式驗證 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug || !SLUG_PATTERN.test(slug)) return errorResponse(400, ROOM_ERROR.INVALID_SLUG, { message: ROOM_MESSAGE.INVALID_SLUG })
    try {
      const supabase = createServerClient()
      /** P3-40：一次查詢房間 + 玩家，避免 N+1 */
      type RoomRow = {
        id: string
        slug: string
        created_at: string
        expires_at: string | null
        host_id: string | null
        password_hash?: string | null
        settings?: { anonymousMode?: boolean; max_players?: number; partyRoom?: boolean; scriptId?: string; scriptRoom?: boolean } | null
        game_room_players: Array<{
          id: string
          display_name: string
          order_index: number
          joined_at?: string
          is_spectator?: boolean
          is_active?: boolean
        }> | null
      }
      const { data: roomRow, error: roomError } = await supabase
        .from('game_rooms')
        .select('id, slug, created_at, expires_at, host_id, password_hash, settings, game_room_players(id, display_name, order_index, joined_at, is_spectator, is_active)')
        .eq('slug', slug)
        .single()
      if (roomError || !roomRow) throw roomError || new Error('Room not found')
      const room = roomRow as RoomRow
      const allPlayers = room.game_room_players ?? []
      const players = allPlayers.filter((p) => (p as { is_active?: boolean }).is_active !== false)
      const sortedPlayers = [...players].sort((a, b) => a.order_index - b.order_index)
      const settings = (room.settings as { anonymousMode?: boolean; max_players?: number; scriptId?: string; scriptRoom?: boolean } | null) ?? {}
      const anonymousMode = !!settings.anonymousMode
      const maxPlayers = typeof settings.max_players === 'number' ? settings.max_players : 12
      return NextResponse.json({
        room: {
          id: room.id,
          slug: room.slug,
          hostId: room.host_id ?? null,
          createdAt: room.created_at,
          expiresAt: room.expires_at,
          hasPassword: !!room.password_hash,
          anonymousMode,
          maxPlayers,
          scriptId: settings.scriptId ?? null,
          scriptRoom: !!settings.scriptRoom,
        },
        players: sortedPlayers.map((p) => ({
          id: p.id,
          displayName: anonymousMode ? `玩家${String.fromCharCode(65 + p.order_index)}` : p.display_name,
          orderIndex: p.order_index,
          isSpectator: p.is_spectator ?? false,
        })),
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

/** P0-004：PATCH 房間設定（僅房主）；body: { anonymousMode?: boolean, endRoom?: boolean }；PR-35：endRoom 提前結束房間 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!slug || !SLUG_PATTERN.test(slug)) return errorResponse(400, ROOM_ERROR.INVALID_SLUG, { message: ROOM_MESSAGE.INVALID_SLUG })
  const user = await getCurrentUser()
  if (!user?.id) return errorResponse(401, ROOM_ERROR.UNAUTHORIZED, { message: ROOM_MESSAGE.LOGIN_REQUIRED })
  let body: { anonymousMode?: boolean; endRoom?: boolean }
  try {
    const raw = await request.json().catch(() => ({}))
    const parsed = GamesRoomsPatchBodySchema.safeParse(raw ?? {})
    if (!parsed.success) {
      return errorResponse(400, ROOM_ERROR.INVALID_BODY, { message: ROOM_MESSAGE.INVALID_JSON_BODY })
    }
    body = parsed.data
  } catch {
    return errorResponse(400, ROOM_ERROR.INVALID_JSON, { message: ROOM_MESSAGE.INVALID_JSON_BODY })
  }
  try {
    const supabase = createServerClient()
    const { data: room, error: fetchErr } = await getRoomBySlug<{ id: string; host_id: string | null; settings: unknown; expires_at: string | null }>(supabase, slug, 'id, host_id, settings, expires_at')
    if (fetchErr || !room) return errorResponse(404, ROOM_ERROR.ROOM_NOT_FOUND, { message: ROOM_MESSAGE.ROOM_NOT_FOUND })
    if (room.host_id !== user.id) return errorResponse(403, ROOM_ERROR.FORBIDDEN, { message: ROOM_MESSAGE.FORBIDDEN })

    if (body.endRoom === true) {
      const now = new Date().toISOString()
      const { error: endErr } = await supabase
        .from('game_rooms')
        .update({ expires_at: now })
        .eq('id', room.id)
      if (endErr) return serverErrorResponse(endErr)
      return NextResponse.json({ ok: true, endRoom: true, expiresAt: now })
    }

    const anonymousMode = body.anonymousMode === true
    const currentSettings = (room.settings as { anonymousMode?: boolean } | null) ?? {}
    const { error: updateErr } = await supabase
      .from('game_rooms')
      .update({ settings: { ...currentSettings, anonymousMode } })
      .eq('id', room.id)
    if (updateErr) return serverErrorResponse(updateErr)
    return NextResponse.json({ ok: true, anonymousMode })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
