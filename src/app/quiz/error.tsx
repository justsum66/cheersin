'use client'

import { useEffect } from 'react'
import { PageErrorContent } from '@/components/PageErrorContent'
import { useTranslation } from '@/contexts/I18nContext'

/** Q-05 Quiz 錯誤態 — DEDUP #7 使用 PageErrorContent 統一版面；I18N-07 t(error.*) */
export default function QuizError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation()
  useEffect(() => {
    console.error('[Quiz]', error instanceof Error ? error.message : String(error))
  }, [error])

  return (
    <PageErrorContent
      title={t('error.quizTitle')}
      description={t('error.quizDescription')}
      onRetry={reset}
      retryLabel={t('error.retry')}
      links={[
        { href: '/', label: t('notFound.back') },
        { href: '/quiz', label: t('nav.quiz') },
      ]}
    />
  )
}
