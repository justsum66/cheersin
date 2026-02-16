/**
 * R2-134：自訂遊戲播放列表 — localStorage CRUD，key 使用 STORAGE_KEYS.GAMES_PLAYLISTS
 */

import { STORAGE_KEYS } from '@/lib/constants'
import type { GameId } from '@/config/games.config'

export interface GamePlaylist {
  id: string
  name: string
  gameIds: GameId[]
}

const KEY = STORAGE_KEYS.GAMES_PLAYLISTS

export function loadPlaylists(): GamePlaylist[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (p): p is GamePlaylist =>
        p && typeof p === 'object' && typeof p.id === 'string' && typeof p.name === 'string' && Array.isArray(p.gameIds)
    )
  } catch {
    return []
  }
}

export function savePlaylists(playlists: GamePlaylist[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(playlists))
  } catch {
    /* ignore */
  }
}

/** Legacy Alias */
export const getAllPlaylists = loadPlaylists

/** Legacy Alias */
export function getPlaylistById(id: string): GamePlaylist | undefined {
  return loadPlaylists().find(p => p.id === id)
}

/** Legacy Placeholder (Missing in source) */
export const PLAYLISTS: GamePlaylist[] = []

export function createPlaylistId(): string {
  return `pl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}
