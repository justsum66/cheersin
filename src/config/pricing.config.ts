/**
 * E01/E02：定價與 PayPal 方案單一來源
 * P3-73：plan_type ↔ paypal_plan_id 對應由此 config + env 讀取，Webhook 與 subscription 共用。
 * 方案 id：starter(免費) | pro(Basic) | elite(Premium)；對應 tier：free | basic | premium。
 */

import { PAYPAL_BASIC_PLAN_ID, PAYPAL_PREMIUM_PLAN_ID } from '@/lib/env-config'
import type { SubscriptionTier } from '@/lib/subscription'

/** 免費方案每日 AI 對話次數（與 subscription.ts 一致） */
export const FREE_AI_CALLS_PER_DAY = 10

/** 年繳：買 10 送 2 */
export const YEARLY_MONTHS_PAID = 10
export const YEARLY_MONTHS_GET = 12
/** 首月半價促銷 */
export const FIRST_MONTH_HALF_OFF = true

/** 方案 UI id → 後端 tier（結帳與 webhook 使用 tier） */
export const PLAN_ID_TO_TIER: Record<string, SubscriptionTier> = {
  starter: 'free',
  pro: 'basic',
  elite: 'premium',
}

/** 可付費方案 tier（用於 API create-subscription） */
export const PAYABLE_TIERS = ['basic', 'premium'] as const
export type PayableTier = (typeof PAYABLE_TIERS)[number]

/** PayPal 建立訂閱用：價格與名稱單一來源 */
export const PAYPAL_PLANS: Record<PayableTier, { name: string; description: string; priceMonthly: number; currency: string; interval: string }> = {
  basic: {
    name: 'Cheersin Basic',
    description: '個人方案 - 無限 AI 對話、全部派對遊戲、遊戲房間最多 8 人',
    priceMonthly: 99,
    currency: 'TWD',
    interval: 'MONTH',
  },
  premium: {
    name: 'Cheersin Premium',
    description: 'VIP 方案 - 專屬課程、遊戲房間最多 12 人、專家諮詢',
    priceMonthly: 199,
    currency: 'TWD',
    interval: 'MONTH',
  },
}

/** 定價頁方案顯示用（不含 icon，icon 由頁面依 id 對應） */
export interface PricingPlanDisplay {
  id: 'starter' | 'pro' | 'elite'
  tier: SubscriptionTier
  name: string
  subName: string
  price: number
  originalPrice: number
  features: string[]
  notIncluded: string[]
  popular?: boolean
}

export const PRICING_PLANS_DISPLAY: PricingPlanDisplay[] = [
  {
    id: 'starter',
    tier: 'free',
    name: '免費方案',
    subName: '探索者',
    price: 0,
    originalPrice: 0,
    features: [
      '永久免費',
      `每日 ${FREE_AI_CALLS_PER_DAY} 次 AI 對話`,
      '基礎靈魂酒測',
      '標準版派對遊戲',
      '遊戲房間最多 4 人',
    ],
    notIncluded: ['AI 侍酒師無限暢聊', '進階餐酒搭配', '專屬品酒會'],
  },
  {
    id: 'pro',
    tier: 'basic',
    name: '個人方案',
    subName: '品鑑家',
    price: 99,
    originalPrice: 199,
    popular: true,
    features: [
      '無限 AI 對話',
      '360° 感官檔案',
      '進階餐酒搭配',
      '全部派對遊戲',
      '遊戲房間最多 8 人',
      '優先客服',
    ],
    notIncluded: ['專屬品酒會'],
  },
  {
    id: 'elite',
    tier: 'premium',
    name: 'VIP 方案',
    subName: '大師級',
    price: 199,
    originalPrice: 399,
    features: [
      '個人方案全部功能',
      '專屬課程',
      '遊戲房間最多 12 人',
      '每月 1 對 1 專家諮詢',
      '品酒會邀請',
      '稀有酒款代購',
    ],
    notIncluded: [],
  },
]

/** E60：功能對比表與 subscription.ts 一致 — basic 50 次、premium 無限 */
export const COMPARISON_ROWS_PRICING: {
  feature: string
  starter: string
  pro: string
  elite: string
  tooltip?: string
}[] = [
  { feature: '靈魂酒測', starter: '基礎版', pro: '360° 全方位', elite: '✓', tooltip: '味覺偏好與酒款推薦' },
  { feature: '每日 AI 對話', starter: `${FREE_AI_CALLS_PER_DAY} 次`, pro: '50 次', elite: '無限', tooltip: '與 AI 侍酒師暢聊' },
  { feature: '遊戲房間人數', starter: '4 人', pro: '8 人', elite: '12 人', tooltip: '單一房間最多玩家數' },
  { feature: '餐酒搭配', starter: '—', pro: '進階', elite: '進階' },
  { feature: '派對遊戲', starter: '標準版', pro: '全部', elite: '全部' },
  { feature: '專屬課程', starter: '—', pro: '—', elite: '✓', tooltip: '品酒學院進階課' },
  { feature: '專家諮詢', starter: '—', pro: '—', elite: '每月 1 次' },
  { feature: '品酒會邀請', starter: '—', pro: '—', elite: '✓' },
]

/** API 用：取得 PayPal 方案價格字串（兩位小數） */
export function getPayPalPriceString(tier: PayableTier): string {
  const plan = PAYPAL_PLANS[tier]
  return plan.priceMonthly.toFixed(2)
}

/** P3-73：依 tier 取得 PayPal plan_id（單一來源，與 .env PAYPAL_*_PLAN_ID 對應） */
export function getPayPalPlanId(tier: PayableTier): string | undefined {
  const id = tier === 'basic' ? PAYPAL_BASIC_PLAN_ID : PAYPAL_PREMIUM_PLAN_ID
  return id?.trim() || undefined
}

/** P3-73：依 PayPal 回傳的 plan_id 對應為 tier（Webhook 用） */
export function getTierFromPayPalPlanId(planId: string | undefined): SubscriptionTier {
  if (!planId?.trim()) return 'free'
  const trimmed = planId.trim()
  if (trimmed === PAYPAL_BASIC_PLAN_ID) return 'basic'
  if (trimmed === PAYPAL_PREMIUM_PLAN_ID) return 'premium'
  return 'free'
}

/** E81 P2：限時優惠結束時間（Unix ms）；從 env 讀取，無活動時回傳 0 可隱藏倒數 */
export function getPromoEndMs(): number {
  if (typeof process.env.NEXT_PUBLIC_PROMO_END_MS !== 'string') return 0
  const ms = parseInt(process.env.NEXT_PUBLIC_PROMO_END_MS, 10)
  return Number.isFinite(ms) && ms > Date.now() ? ms : 0
}
