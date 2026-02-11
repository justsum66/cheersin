'use client'

import { useEffect } from 'react'
import { PageErrorContent } from '@/components/PageErrorContent'
import { useTranslation } from '@/contexts/I18nContext'
import { logger } from '@/lib/logger'

/** 57 錯誤邊界與 fallback — DEDUP #7 使用 PageErrorContent 統一版面；I18N-07 t(error.*) */
export default function LearnError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation()
  useEffect(() => {
    logger.error('[Learn]', { message: error instanceof Error ? error.message : String(error) })
  }, [error])

  return (
    <PageErrorContent
      title={t('error.learnTitle')}
      description={t('error.learnDescription')}
      onRetry={reset}
      retryLabel={t('error.retry')}
      links={[{ href: '/', label: t('notFound.back') }]}
    />
  )
}
