/**
 * 161–165 遊戲化：積分、徽章、連續學習天數、成就、排行榜（localStorage 單機版，可後端擴充）
 */

const KEYS = {
  POINTS: 'cheersin_points',
  STREAK_LAST_DATE: 'cheersin_streak_last_date',
  STREAK_DAYS: 'cheersin_streak_days',
  BADGES: 'cheersin_badges',
  LEADERBOARD: 'cheersin_leaderboard',
  FRIEND_COMPARE: 'cheersin_friend_compare',
} as const

export function getPoints(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(KEYS.POINTS)
    const n = raw ? parseInt(raw, 10) : 0
    return Number.isFinite(n) ? Math.max(0, n) : 0
  } catch {
    return 0
  }
}

export function addPoints(delta: number): number {
  if (typeof window === 'undefined') return 0
  const next = Math.max(0, getPoints() + delta)
  try {
    localStorage.setItem(KEYS.POINTS, String(next))
  } catch {
    /* ignore */
  }
  return next
}

/** 連續學習天數：今日有完成任一課程章節則更新 */
export function getStreak(): { days: number; lastDate: string } {
  if (typeof window === 'undefined') return { days: 0, lastDate: '' }
  try {
    const last = localStorage.getItem(KEYS.STREAK_LAST_DATE) ?? ''
    const raw = localStorage.getItem(KEYS.STREAK_DAYS) ?? '0'
    const days = parseInt(raw, 10) || 0
    return { days: Number.isFinite(days) ? Math.max(0, days) : 0, lastDate: last }
  } catch {
    return { days: 0, lastDate: '' }
  }
}

const LEARN_MINUTES_KEY = 'cheersin_learn_minutes'
/** 57 每日任務：今日是否已完成一章 */
const DAILY_CHAPTER_KEY = 'cheersin_daily_chapter'
/** P2.B2.2 學習提醒排程：每日目標章數 */
const LEARN_DAILY_GOAL_KEY = 'cheersin_learn_daily_goal'
/** 今日已完成章數（key 含日期，每日歸零） */
const LEARN_CHAPTERS_TODAY_PREFIX = 'cheersin_learn_chapters_'

/** 35 學習時長統計：累積分鐘數 */
export function getLearnMinutes(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(LEARN_MINUTES_KEY)
    const n = raw ? parseInt(raw, 10) : 0
    return Number.isFinite(n) ? Math.max(0, n) : 0
  } catch {
    return 0
  }
}

/** 增加學習分鐘數（完成章節時呼叫，預估每章 5 分鐘）；53 學習時長成就 */
export function addLearnMinutes(delta: number): number {
  if (typeof window === 'undefined') return 0
  const prev = getLearnMinutes()
  const next = Math.max(0, prev + delta)
  try {
    localStorage.setItem(LEARN_MINUTES_KEY, String(next))
    if (next >= 300 && prev < 300) unlockBadge('learn-300')
    else if (next >= 120 && prev < 120) unlockBadge('learn-120')
    else if (next >= 60 && prev < 60) unlockBadge('learn-60')
  } catch {
    /* ignore */
  }
  return next
}

/** 57 每日任務：今日是否已完成任一章節 */
export function getCompletedChapterToday(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const stored = localStorage.getItem(DAILY_CHAPTER_KEY) ?? ''
    const today = new Date().toISOString().slice(0, 10)
    return stored === today
  } catch {
    return false
  }
}

/** P2.B2.2 今日已完成章數（用於每日目標進度） */
export function getChaptersCompletedToday(): number {
  if (typeof window === 'undefined') return 0
  try {
    const today = new Date().toISOString().slice(0, 10)
    const raw = localStorage.getItem(LEARN_CHAPTERS_TODAY_PREFIX + today) ?? '0'
    const n = parseInt(raw, 10)
    return Number.isFinite(n) ? Math.max(0, n) : 0
  } catch {
    return 0
  }
}

/** 完成一章時呼叫，累加今日完成數 */
export function incrementChaptersCompletedToday(): number {
  if (typeof window === 'undefined') return 0
  const today = new Date().toISOString().slice(0, 10)
  const next = getChaptersCompletedToday() + 1
  try {
    localStorage.setItem(LEARN_CHAPTERS_TODAY_PREFIX + today, String(next))
  } catch {
    /* ignore */
  }
  return next
}

/** P2.B3.3 學習時間熱力圖：過去 N 天每日完成章數 */
export function getLearnChaptersHistory(days: number): { date: string; count: number }[] {
  if (typeof window === 'undefined' || days <= 0) return []
  const out: { date: string; count: number }[] = []
  const today = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const date = d.toISOString().slice(0, 10)
    const raw = localStorage.getItem(LEARN_CHAPTERS_TODAY_PREFIX + date) ?? '0'
    const n = parseInt(raw, 10)
    out.push({ date, count: Number.isFinite(n) ? Math.max(0, n) : 0 })
  }
  return out.reverse()
}

/** P2.B2.2 取得/設定每日目標章數（1–10） */
export function getLearnDailyGoal(): number {
  if (typeof window === 'undefined') return 1
  try {
    const raw = localStorage.getItem(LEARN_DAILY_GOAL_KEY) ?? '1'
    const n = parseInt(raw, 10)
    return Number.isFinite(n) && n >= 1 && n <= 10 ? n : 1
  } catch {
    return 1
  }
}

export function setLearnDailyGoal(chapters: number): void {
  if (typeof window === 'undefined') return
  const n = Math.max(1, Math.min(10, Math.round(chapters)))
  try {
    localStorage.setItem(LEARN_DAILY_GOAL_KEY, String(n))
  } catch {
    /* ignore */
  }
}

/** 57 完成章節時呼叫，標記今日已完成任務 */
export function setCompletedChapterToday(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DAILY_CHAPTER_KEY, new Date().toISOString().slice(0, 10))
  } catch {
    /* ignore */
  }
}

/** 58 週挑戰：本週完成章節數（週一為起點） */
const WEEK_CHAPTER_KEY = 'cheersin_week_chapters'

function getWeekStart(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  return monday.toISOString().slice(0, 10)
}

export function getWeeklyChapterCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(WEEK_CHAPTER_KEY)
    if (!raw) return 0
    const parsed = JSON.parse(raw) as { week: string; count: number }
    return parsed.week === getWeekStart() ? (Number.isFinite(parsed.count) ? Math.max(0, parsed.count) : 0) : 0
  } catch {
    return 0
  }
}

/** 58 完成章節時呼叫，增加本週計數 */
export function addWeeklyChapterCount(): void {
  if (typeof window === 'undefined') return
  try {
    const week = getWeekStart()
    const raw = localStorage.getItem(WEEK_CHAPTER_KEY)
    let parsed = raw ? (JSON.parse(raw) as { week: string; count: number }) : null
    if (!parsed || parsed.week !== week) parsed = { week, count: 0 }
    parsed.count += 1
    localStorage.setItem(WEEK_CHAPTER_KEY, JSON.stringify(parsed))
  } catch {
    /* ignore */
  }
}

export const BADGE_LABELS: Record<BadgeId, string> = {
  'first-quiz': '首次測驗',
  'streak-7': '連續 7 天',
  'games-10': '遊戲達人',
  'learn-1': '完成第一堂課',
  'wishlist-5': '願望清單 5 款',
  'assistant-10': 'AI 對話 10 次',
  'bookmark-5': '書籤達 5 個',
  'bookmark-10': '書籤達 10 個',
  'learn-60': '學習 60 分鐘',
  'learn-120': '學習 2 小時',
  'learn-300': '學習 5 小時',
  'holiday-cny': '春節限定',
  'course-complete': '完成一門課程',
}

/** 59 節慶徽章：若在節慶期間則自動解鎖 */
export function maybeUnlockHolidayBadge(): void {
  if (typeof window === 'undefined') return
  const d = new Date()
  const m = d.getMonth() + 1
  const day = d.getDate()
  if ((m === 1 && day >= 22) || (m === 2 && day <= 15)) {
    unlockBadge('holiday-cny')
  }
}

/** 記錄今日已學習（由課程完成時呼叫）；回傳更新後的連續天數 */
export function recordStudyToday(): number {
  if (typeof window === 'undefined') return 0
  const today = new Date().toISOString().slice(0, 10)
  const { days, lastDate } = getStreak()
  let nextDays = days
  if (lastDate !== today) {
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
    if (lastDate === yesterday) nextDays = days + 1
    else if (lastDate !== today) nextDays = 1
    try {
      localStorage.setItem(KEYS.STREAK_LAST_DATE, today)
      localStorage.setItem(KEYS.STREAK_DAYS, String(nextDays))
    } catch {
      /* ignore */
    }
  }
  return nextDays
}

export type BadgeId = 'first-quiz' | 'streak-7' | 'games-10' | 'learn-1' | 'wishlist-5' | 'assistant-10' | 'bookmark-5' | 'bookmark-10' | 'learn-60' | 'learn-120' | 'learn-300' | 'holiday-cny' | 'course-complete'

export function getUnlockedBadges(): BadgeId[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEYS.BADGES)
    const arr = raw ? (JSON.parse(raw) as BadgeId[]) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function unlockBadge(id: BadgeId): void {
  if (typeof window === 'undefined') return
  const list = getUnlockedBadges()
  if (list.includes(id)) return
  try {
    localStorage.setItem(KEYS.BADGES, JSON.stringify([...list, id]))
  } catch {
    /* ignore */
  }
}

/** 89 品酒師等級認證：依完成課程數（40 門課程） */
export type SommelierLevel = '銅牌' | '銀牌' | '金牌' | '品酒師' | null
export function getSommelierLevel(completedCourseCount: number): SommelierLevel {
  if (completedCourseCount >= 25) return '品酒師'
  if (completedCourseCount >= 15) return '金牌'
  if (completedCourseCount >= 8) return '銀牌'
  if (completedCourseCount >= 3) return '銅牌'
  return null
}

/** 56 與好友比較：localStorage 存好友暱稱與完成堂數（demo 用，可後端擴充） */
export interface FriendCompareEntry {
  nickname: string
  completedCourses: number
  updatedAt: string
}
export function getFriendCompare(): FriendCompareEntry | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEYS.FRIEND_COMPARE)
    if (!raw) return null
    const parsed = JSON.parse(raw) as FriendCompareEntry
    return parsed?.nickname && Number.isFinite(parsed?.completedCourses) ? parsed : null
  } catch {
    return null
  }
}
export function setFriendCompare(entry: FriendCompareEntry | null): void {
  if (typeof window === 'undefined') return
  try {
    if (!entry) {
      localStorage.removeItem(KEYS.FRIEND_COMPARE)
      return
    }
    const withDate = { ...entry, updatedAt: new Date().toISOString().slice(0, 10) }
    localStorage.setItem(KEYS.FRIEND_COMPARE, JSON.stringify(withDate))
  } catch {
    /* ignore */
  }
}

/** 排行榜：僅顯示當前用戶（無 mock）；可後端擴充取得全站排行 */
export interface LeaderboardEntry {
  rank: number
  name: string
  points: number
  isCurrentUser?: boolean
}

export function getLeaderboard(): LeaderboardEntry[] {
  const points = getPoints()
  return [{ rank: 1, name: '你', points, isCurrentUser: true }]
}
