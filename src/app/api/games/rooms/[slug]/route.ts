import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { getMockStore, mockGetRoomBySlug, mockGetPlayers } from '@/lib/games-room-mock'
import { SLUG_PATTERN } from '@/lib/games-room'

/** GET: 依 slug 取得房間與玩家名單；Supabase 失敗時 dev 用 in-memory fallback；P3-59：slug 格式驗證 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug || !SLUG_PATTERN.test(slug)) return errorResponse(400, 'Invalid slug', { message: '房間代碼格式不正確' })
    try {
      const supabase = createServerClient()
      /** P3-40：一次查詢房間 + 玩家，避免 N+1 */
      type RoomRow = {
        id: string
        slug: string
        created_at: string
        expires_at: string | null
        password_hash?: string | null
        game_room_players: Array<{
          id: string
          display_name: string
          order_index: number
          joined_at?: string
          is_spectator?: boolean
        }> | null
      }
      const { data: roomRow, error: roomError } = await supabase
        .from('game_rooms')
        .select('id, slug, created_at, expires_at, password_hash, game_room_players(id, display_name, order_index, joined_at, is_spectator)')
        .eq('slug', slug)
        .single()
      if (roomError || !roomRow) throw roomError || new Error('Room not found')
      const room = roomRow as RoomRow
      const players = room.game_room_players ?? []
      const sortedPlayers = [...players].sort((a, b) => a.order_index - b.order_index)
      return NextResponse.json({
        room: {
          id: room.id,
          slug: room.slug,
          createdAt: room.created_at,
          expiresAt: room.expires_at,
          hasPassword: !!room.password_hash,
        },
        players: sortedPlayers.map((p) => ({
          id: p.id,
          displayName: p.display_name,
          orderIndex: p.order_index,
          isSpectator: p.is_spectator ?? false,
        })),
      })
    } catch (supabaseErr) {
      if (getMockStore()) {
        const room = mockGetRoomBySlug(slug)
        if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
        const players = mockGetPlayers(room.id)
        return NextResponse.json({
          room: {
            id: room.id,
            slug: room.slug,
            createdAt: room.created_at,
            expiresAt: null,
            hasPassword: !!room.password,
          },
          players: players.map((p) => ({
            id: p.id,
            displayName: p.display_name,
            orderIndex: p.order_index,
            isSpectator: p.is_spectator ?? false,
          })),
        })
      }
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
