/**
 * 141 訂閱方案與功能權限定義
 * 各方案：Free / Basic / Premium（對應 profiles.subscription_tier）
 */

export type SubscriptionTier = 'free' | 'basic' | 'premium'

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, { label: string; maxAICallsPerDay: number; maxRoomPlayers: number; canAccessProCourse: boolean; hasNoAds: boolean; hasProBadge: boolean }> = {
  free: {
    label: '免費',
    /** R2-197：免費方案 AI 侍酒師每日 5 次 */
    maxAICallsPerDay: 5,
    maxRoomPlayers: 4,
    canAccessProCourse: false,
    hasNoAds: false,
    hasProBadge: false,
  },
  basic: {
    label: 'Basic',
    maxAICallsPerDay: 50,
    maxRoomPlayers: 8,
    canAccessProCourse: false,
    hasNoAds: true,
    hasProBadge: true,
  },
  premium: {
    label: 'Pro',
    maxAICallsPerDay: -1, // 無限
    maxRoomPlayers: 12,
    canAccessProCourse: true,
    hasNoAds: true,
    hasProBadge: true,
  },
}

/** 是否為付費方案（basic 或 premium），供 API 權限與房間人數等判斷 */
export function isPaidTier(tier: string | null | undefined): tier is 'basic' | 'premium' {
  return tier === 'basic' || tier === 'premium'
}

/** 當日 AI 對話次數上限（-1 表示無限） */
export function getMaxAICallsPerDay(tier: SubscriptionTier): number {
  return SUBSCRIPTION_TIERS[tier]?.maxAICallsPerDay ?? 10
}

/** 遊戲房間最大人數 */
export function getMaxRoomPlayers(tier: SubscriptionTier): number {
  return SUBSCRIPTION_TIERS[tier]?.maxRoomPlayers ?? 4
}

/** 是否可存取進階課程 */
export function canAccessProCourse(tier: SubscriptionTier): boolean {
  return SUBSCRIPTION_TIERS[tier]?.canAccessProCourse ?? false
}

/** 是否去廣告（Basic 以上） */
export function hasNoAds(tier: SubscriptionTier): boolean {
  return SUBSCRIPTION_TIERS[tier]?.hasNoAds ?? false
}

/** 是否顯示會員徽章 */
export function hasProBadge(tier: SubscriptionTier): boolean {
  return SUBSCRIPTION_TIERS[tier]?.hasProBadge ?? false
}

/** 是否可再發送 AI 請求（未達當日上限） */
export function canUseAICall(tier: SubscriptionTier, usedToday: number): boolean {
  const max = getMaxAICallsPerDay(tier)
  return max < 0 || usedToday < max
}

const STORAGE_KEY_TIER = 'cheersin-subscription-tier'
const STORAGE_KEY_EXPIRES = 'cheersin-subscription-expires'

export function getStoredTier(): SubscriptionTier {
  if (typeof window === 'undefined') return 'free'
  const t = localStorage.getItem(STORAGE_KEY_TIER)
  if (t === 'basic' || t === 'premium' || t === 'free') return t
  return 'free'
}

export function setStoredTier(tier: SubscriptionTier, expiresAt?: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY_TIER, tier)
  if (expiresAt) localStorage.setItem(STORAGE_KEY_EXPIRES, expiresAt)
  else localStorage.removeItem(STORAGE_KEY_EXPIRES)
}

export function getStoredExpires(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY_EXPIRES)
}

/** 145 AI 對話次數：當日已使用次數（localStorage 依日期） */
const STORAGE_KEY_AI_DAY = 'cheersin-ai-calls-date'
const STORAGE_KEY_AI_COUNT = 'cheersin-ai-calls-count'

function getTodayKey(): string {
  return typeof window === 'undefined' ? '' : new Date().toISOString().slice(0, 10)
}

export function getAiCallsUsedToday(): number {
  if (typeof window === 'undefined') return 0
  const today = getTodayKey()
  const storedDay = localStorage.getItem(STORAGE_KEY_AI_DAY)
  if (storedDay !== today) return 0
  const n = parseInt(localStorage.getItem(STORAGE_KEY_AI_COUNT) ?? '0', 10)
  return isNaN(n) ? 0 : n
}

export function incrementAiCallsUsedToday(): number {
  if (typeof window === 'undefined') return 0
  const today = getTodayKey()
  const storedDay = localStorage.getItem(STORAGE_KEY_AI_DAY)
  let count = 0
  if (storedDay === today) {
    count = parseInt(localStorage.getItem(STORAGE_KEY_AI_COUNT) ?? '0', 10)
    count = isNaN(count) ? 0 : count
  }
  count += 1
  localStorage.setItem(STORAGE_KEY_AI_DAY, today)
  localStorage.setItem(STORAGE_KEY_AI_COUNT, String(count))
  return count
}

/** 143 Free 用戶 Pro 功能試用：每月 3 次，計數存 localStorage */
const PRO_TRIAL_LIMIT_PER_MONTH = 3
const STORAGE_KEY_PRO_TRIAL_MONTH = 'cheersin-pro-trial-month'
const STORAGE_KEY_PRO_TRIAL_COUNT = 'cheersin-pro-trial-count'

function getProTrialMonthKey(): string {
  return typeof window === 'undefined' ? '' : new Date().toISOString().slice(0, 7)
}

/** 本月已使用 Pro 試用次數（僅 Free 用戶計數） */
export function getProTrialUsedThisMonth(): number {
  if (typeof window === 'undefined') return 0
  const monthKey = getProTrialMonthKey()
  const storedMonth = localStorage.getItem(STORAGE_KEY_PRO_TRIAL_MONTH)
  if (storedMonth !== monthKey) return 0
  const n = parseInt(localStorage.getItem(STORAGE_KEY_PRO_TRIAL_COUNT) ?? '0', 10)
  return isNaN(n) ? 0 : n
}

/** 使用一次 Pro 試用（僅在 Free 且 canUseProTrial 時呼叫） */
export function incrementProTrialUsedThisMonth(): number {
  if (typeof window === 'undefined') return 0
  const monthKey = getProTrialMonthKey()
  const storedMonth = localStorage.getItem(STORAGE_KEY_PRO_TRIAL_MONTH)
  let count = 0
  if (storedMonth === monthKey) {
    count = parseInt(localStorage.getItem(STORAGE_KEY_PRO_TRIAL_COUNT) ?? '0', 10)
    count = isNaN(count) ? 0 : count
  }
  count += 1
  localStorage.setItem(STORAGE_KEY_PRO_TRIAL_MONTH, monthKey)
  localStorage.setItem(STORAGE_KEY_PRO_TRIAL_COUNT, String(count))
  return count
}

/** Free 用戶是否還可試用 Pro 功能（每月最多 3 次）；Basic/Premium 不需試用直接可用 */
export function canUseProTrial(tier: SubscriptionTier): boolean {
  if (tier !== 'free') return true
  return getProTrialUsedThisMonth() < PRO_TRIAL_LIMIT_PER_MONTH
}

/** 剩餘 Pro 試用次數（Free 專用；Basic/Premium 回傳無限） */
export function getProTrialRemainingThisMonth(tier: SubscriptionTier): number {
  if (tier !== 'free') return -1
  return Math.max(0, PRO_TRIAL_LIMIT_PER_MONTH - getProTrialUsedThisMonth())
}
