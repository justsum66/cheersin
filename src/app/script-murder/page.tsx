'use client'

import Link from 'next/link'
import { BookOpen, Sparkles } from 'lucide-react'

/**
 * 報告 85–97：酒局劇本殺 — 即將推出佔位頁
 * 實作見 docs/roadmap-script-murder.md
 */
export default function ScriptMurderPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
      <div className="flex items-center gap-3 text-primary-400">
        <BookOpen className="w-12 h-12" aria-hidden />
        <Sparkles className="w-8 h-8" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold text-white text-center">酒局劇本殺</h1>
      <p className="text-white/70 text-center max-w-md">
        劇本殺 + 喝酒遊戲，4–8 人秘密角色、投票、懲罰，即將推出。
      </p>
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
