'use client'

/** R2-202：年度回顧 — 前端報表 + 假數據或既有統計 */
import Link from 'next/link'
import { BarChart3, Gamepad2, Wine, ArrowLeft } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'

export default function YearInReviewPage() {
  const { tier } = useSubscription()
  /** 假數據：可改接既有統計 API */
  const mock = {
    gamesPlayed: 24,
    favoriteCategory: '派對遊戲',
    learnMinutes: 120,
    partiesHosted: 6,
  }

  return (
    <main className="min-h-screen pt-8 pb-16 px-4 safe-area-px max-w-2xl mx-auto" role="main" aria-label="年度回顧">
      <Link href="/profile" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 games-focus-ring">
        <ArrowLeft className="w-4 h-4" />
        返回個人
      </Link>
      <h1 className="text-2xl font-display font-bold text-white mb-2 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary-400" />
        你的 Cheersin 年度回顧
      </h1>
      <p className="text-white/60 text-sm mb-6">
        今年你與 Cheersin 一起創造的回憶（示範數據，正式版將接後端統計）。
      </p>
      <div className="space-y-4 mb-8">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
          <Gamepad2 className="w-8 h-8 text-primary-400 shrink-0" />
          <div>
            <p className="text-white/50 text-xs">玩過的遊戲局數</p>
            <p className="text-xl font-bold text-white">{mock.gamesPlayed}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
          <Wine className="w-8 h-8 text-primary-400 shrink-0" />
          <div>
            <p className="text-white/50 text-xs">最常玩類型</p>
            <p className="text-lg font-semibold text-white">{mock.favoriteCategory}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/50 text-xs mb-1">學習時長（分鐘）</p>
          <p className="text-xl font-bold text-white">{mock.learnMinutes}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/50 text-xs mb-1">主辦／參與派對次數</p>
          <p className="text-xl font-bold text-white">{mock.partiesHosted}</p>
        </div>
      </div>
      {tier && tier !== 'free' && (
        <p className="text-white/50 text-xs mb-4">感謝你訂閱 {tier === 'premium' ? 'Pro' : tier === 'basic' ? 'Basic' : 'Elite'}，明年繼續一起乾杯！</p>
      )}
      <Link href="/games" className="inline-flex items-center gap-2 min-h-[48px] px-6 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium games-focus-ring">
        再去玩一局
        <ArrowLeft className="w-4 h-4 rotate-180" />
      </Link>
    </main>
  )
}
