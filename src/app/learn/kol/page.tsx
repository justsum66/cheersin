'use client'

/**
 * P2.E3.1 KOL推薦榜單：網紅/專家精選課程（籌備中）
 */
import Link from 'next/link'
import { ChevronLeft, Users, Star } from 'lucide-react'

export default function LearnKOLPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Users className="w-7 h-7 text-amber-400" />
          KOL 推薦榜單
        </h1>
        <p className="text-white/60 text-sm mb-8">
          品酒網紅與專家精選課程，跟著信任的 KOL 學。
        </p>

        <div className="py-12 text-center rounded-xl bg-white/5 border border-white/10">
          <Star className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
          <p className="text-white/70">KOL 推薦榜單籌備中</p>
          <p className="text-white/40 text-sm mt-2">將由認證講師與人氣創作者精選課程，敬請期待</p>
          <Link href="/learn" className="inline-block mt-6 px-4 py-2 rounded-xl bg-primary-500/30 text-primary-300 text-sm hover:bg-primary-500/40">
            返回課程總覽
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
