'use client'

import { useEffect } from 'react'
import { PageErrorContent } from '@/components/PageErrorContent'
import { useTranslation } from '@/contexts/I18nContext'
import { logger } from '@/lib/logger'

/** SM-60：劇本殺頁錯誤邊界 — 使用 PageErrorContent 統一版面；i18n error.scriptMurder* */
export default function ScriptMurderError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation()
  useEffect(() => {
    logger.error('[ScriptMurder]', { message: error instanceof Error ? error.message : String(error) })
  }, [error])

  return (
    <PageErrorContent
      title={t('error.scriptMurderTitle')}
      description={t('error.scriptMurderDescription')}
      onRetry={reset}
      retryLabel={t('error.retry')}
      links={[
        { href: '/', label: t('notFound.back') },
        { href: '/script-murder', label: t('scriptMurder.title') },
      ]}
    />
  )
}
