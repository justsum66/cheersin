'use client'

/** R2-194：品牌大使頁 — 招募 KOL/網紅推廣、分潤說明（可接後端 stub） */
import Link from 'next/link'
import { Megaphone, Gift, Users, ArrowLeft } from 'lucide-react'

export default function AmbassadorPage() {
  return (
    <main className="min-h-screen pt-8 pb-16 px-4 safe-area-px max-w-2xl mx-auto" role="main" aria-label="品牌大使計畫">
      <Link href="/pricing" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 games-focus-ring">
        <ArrowLeft className="w-4 h-4" />
        返回定價
      </Link>
      <h1 className="text-2xl font-display font-bold text-white mb-2 flex items-center gap-2">
        <Megaphone className="w-6 h-6 text-primary-400" />
        品牌大使計畫
      </h1>
      <p className="text-white/60 text-sm mb-6">
        喜歡 Cheersin？加入品牌大使，用你的影響力推廣派對遊戲與品酒樂趣，並獲得專屬獎勵。
      </p>
      <div className="space-y-4 mb-8">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h2 className="font-semibold text-white mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-primary-400" />誰適合</h2>
          <p className="text-white/70 text-sm">派對主、品酒 KOL、生活風格創作者、社群小編。</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h2 className="font-semibold text-white mb-2 flex items-center gap-2"><Gift className="w-4 h-4 text-primary-400" />獎勵方式</h2>
          <p className="text-white/70 text-sm">專屬折扣碼、推廣分潤、免費 Pro 體驗（詳情即將公布）。</p>
        </div>
      </div>
      <p className="text-white/50 text-xs mb-6">填寫表單或來信 ambassador@cheersin.app，我們會盡快與您聯繫。</p>
      <Link href="/pricing" className="inline-flex items-center gap-2 min-h-[48px] px-6 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium games-focus-ring">
        查看方案
        <ArrowLeft className="w-4 h-4 rotate-180" />
      </Link>
    </main>
  )
}
