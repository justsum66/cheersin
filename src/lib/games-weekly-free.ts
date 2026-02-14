/**
 * R2-191：限時免費遊戲輪換 — 每週輪換 2 款付費遊戲為免費體驗
 * 依 ISO 週數決定本週免費的遊戲 ID，製造緊迫感。
 */

import { PREMIUM_GAME_IDS, getGameRequiredTier } from '@/config/games.config'
import type { SubscriptionTier } from '@/lib/subscription'

const WEEKLY_FREE_COUNT = 2

/** 取得當前 ISO 週數（1–53） */
function getWeekNumber(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

/** 本週免費體驗的付費遊戲 ID（最多 2 款）；依週數＋年 deterministic 輪換 */
export function getWeeklyFreeGameIds(): string[] {
  if (PREMIUM_GAME_IDS.length === 0) return []
  const week = getWeekNumber()
  const year = new Date().getFullYear()
  const pool = PREMIUM_GAME_IDS
  const take = Math.min(WEEKLY_FREE_COUNT, pool.length)
  const base = (week * 31 + year) % Math.max(1, pool.length)
  return Array.from({ length: take }, (_, i) => pool[(base + i) % pool.length])
}

/** 是否可遊玩該遊戲（訂閱達標或本週免費） */
export function canPlayGame(gameId: string, tier: SubscriptionTier): boolean {
  const required = getGameRequiredTier(gameId)
  if (!required) return true
  if (tier === 'premium' || tier === 'basic') return true
  return getWeeklyFreeGameIds().includes(gameId)
}
