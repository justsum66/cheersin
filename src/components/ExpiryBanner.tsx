'use client'

import { useSubscription } from '@/hooks/useSubscription'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

/** E55：訂閱到期前 7 天站內橫幅 — 「您的方案將於 YYYY-MM-DD 到期」+ 續訂連結 */
const DAYS_BEFORE_EXPIRY = 7
const MS_PER_DAY = 24 * 60 * 60 * 1000

export default function ExpiryBanner() {
  const { tier, expiresAt } = useSubscription()
  if (tier === 'free' || !expiresAt) return null
  let expiryDate: Date
  try {
    expiryDate = new Date(expiresAt)
  } catch {
    return null
  }
  const now = Date.now()
  const daysLeft = Math.ceil((expiryDate.getTime() - now) / MS_PER_DAY)
  if (daysLeft > DAYS_BEFORE_EXPIRY || daysLeft < 0) return null

  const dateStr = expiryDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 bg-amber-500/15 border-b border-amber-500/30 text-sm"
      role="region"
      aria-label="訂閱即將到期提醒"
    >
      <Calendar className="w-4 h-4 text-amber-400 shrink-0" aria-hidden />
      <span className="text-white/90">
        您的方案將於 <strong className="text-amber-300">{dateStr}</strong> 到期
      </span>
      <Link
        href="/subscription"
        className="inline-flex items-center gap-2 min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 font-medium transition-colors games-focus-ring"
      >
        續訂方案
      </Link>
    </div>
  )
}
