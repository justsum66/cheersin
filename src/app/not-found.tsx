'use client'

import Link from 'next/link'
import { useTranslation } from '@/contexts/I18nContext'

/** EXPERT_60 P2 / P1-043：404 友善化 — 返回首頁 + 熱門連結；i18n 接線 notFound.* */
export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 100%)' }}
      role="main"
      aria-labelledby="not-found-title"
      aria-describedby="not-found-desc"
    >
      <h1 id="not-found-title" className="home-heading-2 font-display font-bold mb-2">
        <span className="gradient-text">404</span>
      </h1>
      <p id="not-found-desc" className="home-text-muted mb-2">{t('notFound.title')}</p>
      <p className="text-white/50 text-sm mb-6">{t('notFound.hint')}</p>
      <Link href="/" className="btn-primary mb-6">
        {t('notFound.back')}
      </Link>
      <p className="text-white/50 text-sm mb-3">{t('notFound.popularLinks')}</p>
      <nav className="flex flex-wrap justify-center gap-3" aria-label={t('notFound.popularLinks')}>
        <Link href="/quiz" className="btn-ghost min-h-[48px] inline-flex items-center justify-center text-sm">
          {t('nav.quiz')}
        </Link>
        <Link href="/games" className="btn-ghost min-h-[48px] inline-flex items-center justify-center text-sm">
          {t('nav.games')}
        </Link>
        <Link href="/pricing" className="btn-ghost min-h-[48px] inline-flex items-center justify-center text-sm">
          {t('nav.pricing')}
        </Link>
      </nav>
    </div>
  )
}
