/**
 * Phase 3 5.1 #3：劇本殺房間列表
 * GET /api/scripts/rooms — 回傳劇本殺房（劇本摘要、當前人數、slug）
 * 錯誤時回傳 200 + 空列表，避免頁面 500。
 */
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

/** fallback=true 表示因連線錯誤回傳空列表，供前端顯示連線錯誤 */
function emptyRoomsResponse(limit: number, offset: number, fallback?: boolean) {
  const body: { rooms: unknown[]; meta: { limit: number; offset: number; count: number }; _fallback?: boolean } = {
    rooms: [],
    meta: { limit, offset, count: 0 },
  }
  if (fallback) body._fallback = true
  return NextResponse.json(body)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const limit = Math.min(30, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10) || 20))
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0', 10) || 0)

  try {
    const supabase = createServerClient()
    const { data: rooms, error: roomsError } = await supabase
      .from('game_rooms')
      .select('id, slug, created_at, expires_at, host_id, settings')
      .not('expires_at', 'lt', new Date().toISOString())
      .contains('settings', { scriptRoom: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (roomsError) {
      logger.warn('scripts/rooms query error', { err: roomsError })
      return emptyRoomsResponse(limit, offset, true)
    }

    const scriptRooms = rooms ?? []
    const scriptIds = [...new Set(scriptRooms.map((r) => (r.settings as { scriptId?: string })?.scriptId).filter(Boolean))] as string[]

    if (scriptIds.length === 0) {
      return NextResponse.json({ rooms: [], meta: { limit, offset, count: 0 } })
    }

    const { data: scripts } = await supabase
      .from('scripts')
      .select('id, title, slug, duration_min, min_players, max_players')
      .in('id', scriptIds)

    const scriptMap = new Map((scripts ?? []).map((s) => [s.id, s]))

    const roomIds = scriptRooms.map((r) => r.id)
    const { data: playerCounts } = await supabase
      .from('game_room_players')
      .select('room_id')
      .in('room_id', roomIds)

    const countByRoom = new Map<string, number>()
    for (const p of playerCounts ?? []) {
      const rid = (p as { room_id: string }).room_id
      countByRoom.set(rid, (countByRoom.get(rid) ?? 0) + 1)
    }

    const list = scriptRooms.map((r) => {
      const settings = r.settings as { scriptId?: string; max_players?: number } | null
      const scriptId = settings?.scriptId
      const script = scriptId ? scriptMap.get(scriptId) : null
      return {
        roomId: r.id,
        slug: r.slug,
        hostId: r.host_id ?? null,
        createdAt: r.created_at,
        expiresAt: r.expires_at,
        scriptId: scriptId ?? null,
        scriptTitle: script ? (script as { title: string }).title : null,
        durationMin: script ? (script as { duration_min: number | null }).duration_min : null,
        minPlayers: script ? (script as { min_players: number | null }).min_players : null,
        maxPlayers: settings?.max_players ?? 8,
        playerCount: countByRoom.get(r.id) ?? 0,
      }
    })

    return NextResponse.json({
      rooms: list,
      meta: { limit, offset, count: list.length },
    })
  } catch (e) {
    logger.error('GET /api/scripts/rooms failed', { err: e })
    return emptyRoomsResponse(limit, offset, true)
  }
}
