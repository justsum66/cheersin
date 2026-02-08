'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Users, Sparkles, Wine, Gamepad2, Link2 } from 'lucide-react'
import { fireFullscreenConfetti } from '@/lib/celebration'

/**
 * 報告 69–81 / killer task 5：乾杯按鈕 UI
 * killer #3：派對房專屬 UI — 房主選遊戲、邀請連結、人數顯示
 */
export default function PartyRoomPage() {
  const [cheersCount, setCheersCount] = useState(0)
  const [inviteCopied, setInviteCopied] = useState(false)
  const handleCheers = useCallback(() => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate([100, 50, 100])
    }
    fireFullscreenConfetti()
    setCheersCount((c) => c + 1)
  }, [])

  const handleCopyInvite = useCallback(() => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    void navigator.clipboard?.writeText(url).then(() => {
      setInviteCopied(true)
      setTimeout(() => setInviteCopied(false), 2000)
    })
  }, [])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-8">
      <div className="flex items-center gap-3 text-primary-400">
        <Users className="w-12 h-12" aria-hidden />
        <Sparkles className="w-8 h-8" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold text-white text-center">派對直播房</h1>
      <p className="text-white/70 text-center max-w-md">
        4–12 人即時同房、同步遊戲；下方乾杯按鈕可預覽效果。
      </p>

      {/* killer #3：房主選遊戲、邀請連結、人數顯示 */}
      <div className="w-full max-w-sm space-y-3 rounded-xl bg-white/5 border border-white/10 p-4">
        <p className="text-white/60 text-sm font-medium">房內狀態</p>
        <div className="flex items-center gap-2 text-white/80">
          <Users className="w-5 h-5 text-primary-400" aria-hidden />
          <span>目前 <strong className="text-white">0</strong> / 4 人</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 text-sm font-medium games-focus-ring"
          >
            <Gamepad2 className="w-4 h-4" aria-hidden />
            房主選遊戲
          </Link>
          <button
            type="button"
            onClick={handleCopyInvite}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium games-focus-ring"
            aria-label="複製邀請連結"
          >
            <Link2 className="w-4 h-4" aria-hidden />
            {inviteCopied ? '已複製' : '邀請連結'}
          </button>
        </div>
      </div>

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
