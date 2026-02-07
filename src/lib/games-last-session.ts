/**
 * 任務 23：存檔恢復 — 記錄上次遊玩的遊戲與時間，意外關閉後可提示恢復。
 */

const STORAGE_KEY = 'cheersin_games_last_session'
const TTL_MS = 24 * 60 * 60 * 1000 // 24 小時內可恢復

export interface LastSession {
  gameId: string
  timestamp: number
}

export function getLastSession(): LastSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== 'object' || parsed === null) return null
    const { gameId, timestamp } = parsed as { gameId?: string; timestamp?: number }
    if (typeof gameId !== 'string' || !gameId.trim() || typeof timestamp !== 'number' || !Number.isFinite(timestamp)) return null
    if (Date.now() - timestamp > TTL_MS) return null
    return { gameId: gameId.trim(), timestamp }
  } catch {
    return null
  }
}

export function saveLastSession(gameId: string): void {
  if (typeof window === 'undefined' || typeof gameId !== 'string' || !gameId.trim()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ gameId: gameId.trim(), timestamp: Date.now() }))
  } catch {
    /* ignore */
  }
}

export function clearLastSession(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
