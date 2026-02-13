/**
 * R2-025：TanStack Query hooks — 劇本殺 API
 * useScripts、useScriptRooms 統一快取與重試
 */
import { useQuery } from '@tanstack/react-query'

export interface ScriptSummary {
  id: string
  title: string
  slug: string | null
  duration_min: number | null
  min_players: number | null
  max_players: number | null
  is_18_plus?: boolean
}

export interface ScriptRoomSummary {
  slug: string
  scriptTitle: string | null
  playerCount: number
  maxPlayers: number
}

async function fetchScripts(limit = 20, offset = 0): Promise<{
  scripts: ScriptSummary[]
  meta: { limit: number; offset: number; count: number }
  _fallback?: boolean
}> {
  const res = await fetch(`/api/scripts?limit=${limit}&offset=${offset}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.message ?? 'Failed to fetch scripts')
  return data
}

async function fetchScriptRooms(limit = 10, offset = 0): Promise<{
  rooms: ScriptRoomSummary[]
  meta: { limit: number; offset: number; count: number }
  _fallback?: boolean
}> {
  const res = await fetch(`/api/scripts/rooms?limit=${limit}&offset=${offset}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.message ?? 'Failed to fetch script rooms')
  return data
}

/** 劇本列表，staleTime 2 分鐘 */
export function useScripts(options?: { limit?: number; offset?: number; enabled?: boolean }) {
  const { limit = 20, offset = 0, enabled = true } = options ?? {}
  return useQuery({
    queryKey: ['scripts', limit, offset],
    queryFn: () => fetchScripts(limit, offset),
    enabled,
  })
}

/** 劇本殺房間列表，staleTime 2 分鐘 */
export function useScriptRooms(options?: { limit?: number; offset?: number; enabled?: boolean }) {
  const { limit = 10, offset = 0, enabled = true } = options ?? {}
  return useQuery({
    queryKey: ['scripts', 'rooms', limit, offset],
    queryFn: () => fetchScriptRooms(limit, offset),
    enabled,
  })
}
