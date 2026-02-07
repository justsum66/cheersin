/**
 * 任務 7：本週熱門 — 依本週遊玩次數排序，供 Lobby「本週熱門」區塊使用。
 */

const STORAGE_KEY = 'cheersin_games_weekly'
const MAX_GAMES_PER_WEEK = 100

/** 取得當前週一起始日 key（例如 2026-02-02），用於本週計次 */
function getWeekKey(): string {
  if (typeof window === 'undefined') return ''
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const mon = new Date(d)
  mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return mon.toISOString().slice(0, 10)
}

export interface WeeklyData {
  weekKey: string
  counts: Record<string, number>
}

function loadWeekly(): WeeklyData {
  if (typeof window === 'undefined') return { weekKey: getWeekKey(), counts: {} }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { weekKey: getWeekKey(), counts: {} }
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== 'object' || parsed === null) return { weekKey: getWeekKey(), counts: {} }
    const weekKey = typeof (parsed as { weekKey?: string }).weekKey === 'string' ? (parsed as WeeklyData).weekKey : getWeekKey()
    const counts: Record<string, number> = {}
    const c = (parsed as { counts?: unknown }).counts
    if (typeof c === 'object' && c !== null) {
      for (const [k, v] of Object.entries(c)) {
        const n = typeof v === 'number' ? v : parseInt(String(v), 10)
        if (typeof k === 'string' && Number.isFinite(n) && n >= 0) counts[k] = Math.min(n, MAX_GAMES_PER_WEEK)
      }
    }
    return { weekKey, counts }
  } catch {
    return { weekKey: getWeekKey(), counts: {} }
  }
}

function saveWeekly(data: WeeklyData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

/** 取得本週各遊戲遊玩次數（僅當前週的資料） */
export function getWeeklyPlayCounts(): Record<string, number> {
  const current = getWeekKey()
  const data = loadWeekly()
  if (data.weekKey !== current) return {}
  return { ...data.counts }
}

/** 進入某遊戲時呼叫，將該遊戲本週次數 +1 */
export function incrementWeeklyPlay(gameId: string): void {
  if (typeof gameId !== 'string' || !gameId.trim()) return
  const current = getWeekKey()
  const data = loadWeekly()
  if (data.weekKey !== current) {
    data.weekKey = current
    data.counts = {}
  }
  data.counts[gameId] = Math.min((data.counts[gameId] ?? 0) + 1, MAX_GAMES_PER_WEEK)
  saveWeekly(data)
}
