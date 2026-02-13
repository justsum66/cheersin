'use client'

import { useEffect } from 'react'
import { PageErrorContent } from '@/components/PageErrorContent'
import { useTranslation } from '@/contexts/I18nContext'
import { logger } from '@/lib/logger'

/** E83 P2：全域錯誤頁 — DEDUP #7 使用 PageErrorContent 統一版面；i18n 接線 error.* */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation()
  useEffect(() => {
    logger.error('App error:', { message: error instanceof Error ? error.message : String(error) })
  }, [error])

  return (
    <PageErrorContent
      title={t('error.title')}
      description={t('error.description')}
      onRetry={reset}
      retryLabel={t('error.retry')}
      className="min-h-screen bg-[linear-gradient(180deg,#1a0a2e_0%,#0a0a0a_100%)]"
      links={[
        { href: '/', label: t('notFound.back') },
        { href: '/quiz', label: t('nav.quiz') },
        { href: '/games', label: t('nav.games') },
        { href: '/assistant', label: t('nav.assistant') },
      ]}
      footer={
        <p className="text-white/50 text-xs">
          {t('error.footer')}{' '}
          <a href="mailto:hello@cheersin.app" className="text-primary-400 hover:text-primary-300 underline">
            hello@cheersin.app
          </a>
        </p>
      }
    />
  )
}
