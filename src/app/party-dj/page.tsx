'use client'

import Link from 'next/link'
import { Music2, Sparkles } from 'lucide-react'

/**
 * 報告 101–113：AI 派對 DJ — 即將推出佔位頁
 * 實作見 docs/roadmap-ai-party-dj.md
 */
export default function PartyDJPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
      <div className="flex items-center gap-3 text-primary-400">
        <Music2 className="w-12 h-12" aria-hidden />
        <Sparkles className="w-8 h-8" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold text-white text-center">AI 派對 DJ</h1>
      <p className="text-white/70 text-center max-w-md">
        AI 幫你編排整晚派對流程：暖場 → 升溫 → 高潮 → 收尾，即將推出。
      </p>
      <Link
        href="/assistant"
        className="min-h-[48px] px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors games-focus-ring"
      >
        先問 AI 侍酒師
      </Link>
      <Link href="/" className="text-white/50 hover:text-white/80 text-sm">
        返回首頁
      </Link>
    </div>
  )
}
