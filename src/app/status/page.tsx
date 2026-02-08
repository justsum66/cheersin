'use client'

import Link from 'next/link'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import StatusServices from '@/components/status/StatusServices'
import { useTranslation } from '@/contexts/I18nContext'

/** E74 P2：狀態頁 — 維修時 MaintenanceBanner 連此頁；即時顯示 Supabase / PayPal 等連線狀態；i18n Phase 3 */
export default function StatusPage() {
  const { t } = useTranslation()
  return (
    <main className="min-h-screen px-4 py-12 md:py-16 max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('status.backHome')}
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="w-8 h-8 text-emerald-400" aria-hidden />
        <h1 className="text-2xl font-display font-bold text-white">{t('status.pageTitle')}</h1>
      </div>
      <p className="text-white/60 text-sm mb-8">
        {t('status.pageDescription')}
      </p>
      <div className="mb-6">
        <StatusServices />
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        <p className="text-white/80 text-sm">
          {t('status.reportIntro')}{' '}
          <a href="mailto:hello@cheersin.app" className="text-primary-400 hover:text-primary-300 underline">
            {t('status.contactUs')}
          </a>{' '}
          {t('status.reportSuffix')}
        </p>
      </div>
    </main>
  )
}
