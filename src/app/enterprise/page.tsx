'use client'

/** R2-214：企業活動頁 — 尾牙、Team Building、品牌活動 CTA + 聯絡方式 */
import Link from 'next/link'
import { Building2, Calendar, Mail, ArrowLeft, Sparkles } from 'lucide-react'

export default function EnterprisePage() {
  return (
    <main className="min-h-screen pt-8 pb-16 px-4 safe-area-px max-w-2xl mx-auto" role="main" aria-label="企業活動方案">
      <Link href="/pricing" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 games-focus-ring">
        <ArrowLeft className="w-4 h-4" />
        返回定價
      </Link>
      <h1 className="text-2xl font-display font-bold text-white mb-2 flex items-center gap-2">
        <Building2 className="w-6 h-6 text-primary-400" />
        企業活動方案
      </h1>
      <p className="text-white/60 text-sm mb-6">
        尾牙、Team Building、品牌活動 — 專屬題庫、數據報表、客製化需求，讓每場活動都難忘。
      </p>
      <div className="space-y-4 mb-8">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h2 className="font-semibold text-white mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary-400" />適用情境</h2>
          <p className="text-white/70 text-sm">尾牙、春酒、部門聚會、客戶活動、線上 Team Building。</p>
        </div>
        <a href="mailto:enterprise@cheersin.app?subject=企業活動方案諮詢" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors games-focus-ring">
          <Mail className="w-5 h-5 text-primary-400" />
          <div>
            <p className="font-medium text-white">enterprise@cheersin.app</p>
            <p className="text-white/50 text-xs">企業活動諮詢</p>
          </div>
        </a>
        <a href="mailto:enterprise@cheersin.app?subject=預約 Demo" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors games-focus-ring">
          <Calendar className="w-5 h-5 text-primary-400" />
          <div>
            <p className="font-medium text-white">預約 Demo</p>
            <p className="text-white/50 text-xs">專人說明與示範</p>
          </div>
        </a>
      </div>
      <Link href="/pricing/team" className="inline-flex items-center gap-2 min-h-[48px] px-6 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium games-focus-ring">
        團隊方案詳情
        <ArrowLeft className="w-4 h-4 rotate-180" />
      </Link>
    </main>
  )
}
