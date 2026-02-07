'use client'

/**
 * P2.A4.3 考古題練習區：認證考試歷年考題（入口頁，內容籌備中）
 */
import Link from 'next/link'
import { ChevronLeft, FileQuestion, BookOpen } from 'lucide-react'

export default function LearnExamPracticePage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <FileQuestion className="w-7 h-7 text-primary-400" />
          考古題練習區
        </h1>
        <p className="text-white/60 text-sm mb-8">
          WSET、CMS、MW 等認證歷年考題與模擬練習（籌備中）。
        </p>

        <div className="py-12 text-center rounded-xl bg-white/5 border border-white/10">
          <BookOpen className="w-12 h-12 text-white/30 mx-auto mb-3" />
          <p className="text-white/70">考古題與模擬考題庫籌備中</p>
          <p className="text-white/40 text-sm mt-2">完成學習計劃後，可在此進行考前衝刺</p>
          <Link href="/learn/plan" className="inline-block mt-6 px-4 py-2 rounded-xl bg-primary-500/30 text-primary-300 text-sm hover:bg-primary-500/40">
            前往學習計劃
          </Link>
        </div>

        <p className="mt-8 text-white/40 text-sm">
          <Link href="/learn" className="text-primary-400 hover:underline flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            返回課程總覽
          </Link>
        </p>
      </div>
    </div>
  )
}
