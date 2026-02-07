'use client'

/**
 * P2.B3.4 學習夥伴配對：同進度用戶激勵（籌備中）
 */
import Link from 'next/link'
import { ChevronLeft, Users } from 'lucide-react'

export default function LearnStudyBuddyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Users className="w-7 h-7 text-primary-400" />
          學習夥伴配對
        </h1>
        <p className="text-white/60 text-sm mb-8">
          依學習進度配對同路人，互相激勵、一起達標。
        </p>

        <div className="py-12 text-center rounded-xl bg-white/5 border border-white/10">
          <Users className="w-12 h-12 text-primary-400/50 mx-auto mb-3" />
          <p className="text-white/70">學習夥伴配對籌備中</p>
          <p className="text-white/40 text-sm mt-2">完成課程進度後，將可與同進度學員配對、互相督促</p>
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
