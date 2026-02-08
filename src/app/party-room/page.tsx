'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Users, Sparkles, Wine } from 'lucide-react'
import { fireFullscreenConfetti } from '@/lib/celebration'

/**
 * 報告 69–81 / killer task 5：派對直播房 — 乾杯按鈕 UI（震動 + 音效 + 彩帶）
 */
export default function PartyRoomPage() {
  const [cheersCount, setCheersCount] = useState(0)
  const handleCheers = useCallback(() => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate([100, 50, 100])
    }
    fireFullscreenConfetti()
    setCheersCount((c) => c + 1)
  }, [])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
      <div className="flex items-center gap-3 text-primary-400">
        <Users className="w-12 h-12" aria-hidden />
        <Sparkles className="w-8 h-8" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold text-white text-center">派對直播房</h1>
      <p className="text-white/70 text-center max-w-md">
        4–12 人即時同房、同步遊戲；下方乾杯按鈕可預覽效果。
      </p>
      <button
        type="button"
        onClick={handleCheers}
        className="min-h-[56px] px-8 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-2 games-focus-ring transition-colors"
        aria-label="乾杯"
      >
        <Wine className="w-6 h-6" aria-hidden />
        乾杯！
      </button>
      {cheersCount > 0 && (
        <p className="text-white/60 text-sm">已乾杯 {cheersCount} 次</p>
      )}
      <Link
        href="/games"
        className="min-h-[48px] px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors games-focus-ring"
      >
        先去派對遊樂場
      </Link>
      <Link href="/" className="text-white/50 hover:text-white/80 text-sm">
        返回首頁
      </Link>
    </div>
  )
}
