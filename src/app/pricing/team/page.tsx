'use client'

import Link from 'next/link'
import { Building2, Mail, Calendar, ArrowLeft, Shield } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'

/** R2-187：團隊方案諮詢頁／聯絡我們 — 企業/大型活動 CTA + 表單或 mailto */
export default function PricingTeamPage() {
  const { t } = useTranslation()
  return (
    <main className="min-h-screen pt-8 pb-16 px-4 safe-area-px max-w-2xl mx-auto" role="main" aria-label="團隊方案諮詢">
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 games-focus-ring"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('pricing.teamTitle') ?? '團隊方案'}
      </Link>
      <h1 className="text-2xl font-display font-bold text-white mb-2 flex items-center gap-2">
        <Building2 className="w-6 h-6 text-primary-400" />
        企業／團體方案
      </h1>
      <p className="text-white/60 text-sm mb-6">
        專屬題庫、品牌露出、數據報表。填寫需求或來信，我們將與您聯繫。
      </p>
      <p className="text-white/40 text-xs mb-6 flex items-center gap-2">
        <Shield className="w-4 h-4" />
        安全付款 · 隨時取消，無需綁約
      </p>
      <div className="space-y-4 mb-8">
        <a
          href="mailto:enterprise@cheersin.app?subject=團隊方案諮詢"
          className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors games-focus-ring"
        >
          <Mail className="w-5 h-5 text-primary-400" />
          <div>
            <p className="font-medium text-white">enterprise@cheersin.app</p>
            <p className="text-white/50 text-xs">團隊方案諮詢</p>
          </div>
        </a>
        <a
          href="mailto:enterprise@cheersin.app?subject=預約 Demo"
          className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors games-focus-ring"
        >
          <Calendar className="w-5 h-5 text-primary-400" />
          <div>
            <p className="font-medium text-white">預約 Demo</p>
            <p className="text-white/50 text-xs">專人說明與示範</p>
          </div>
        </a>
      </div>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 min-h-[48px] px-6 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium games-focus-ring"
      >
        查看個人方案
        <ArrowLeft className="w-4 h-4 rotate-180" />
      </Link>
    </main>
  )
}
