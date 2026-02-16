/**
 * 任務 4：遊戲收藏 localStorage；任務 10：遊戲評分
 */

const FAVORITES_KEY = 'cheersin_games_favorites'
const RATINGS_KEY = 'cheersin_games_ratings'
const FAVORITES_MAX = 50

export function getFavoriteGameIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string').slice(0, FAVORITES_MAX) : []
  } catch {
    return []
  }
}

export function toggleFavorite(gameId: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const ids = getFavoriteGameIds()
    const next = ids.includes(gameId) ? ids.filter((id) => id !== gameId) : [...ids, gameId].slice(-FAVORITES_MAX)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
    return next.includes(gameId)
  } catch {
    return false
  }
}

/** Legacy Alias */
export const getFavorites = getFavoriteGameIds

/** Legacy Alias */
export function addFavorite(gameId: string): void {
  if (!isFavorite(gameId)) toggleFavorite(gameId)
}

/** Legacy Alias */
export function removeFavorite(gameId: string): void {
  if (isFavorite(gameId)) toggleFavorite(gameId)
}

export function isFavorite(gameId: string): boolean {
  return getFavoriteGameIds().includes(gameId)
}

export function getGameRatings(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(RATINGS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== 'object' || parsed === null) return {}
    const out: Record<string, number> = {}
    for (const [k, v] of Object.entries(parsed)) {
      const n = typeof v === 'number' ? v : parseInt(String(v), 10)
      if (Number.isFinite(n) && n >= 1 && n <= 5) out[k] = Math.round(n)
    }
    return out
  } catch {
    return {}
  }
}

export function setGameRating(gameId: string, stars: number): void {
  if (typeof window === 'undefined') return
  const n = Math.max(1, Math.min(5, Math.round(stars)))
  try {
    const prev = getGameRatings()
    prev[gameId] = n
    localStorage.setItem(RATINGS_KEY, JSON.stringify(prev))
  } catch {
    /* ignore */
  }
}
