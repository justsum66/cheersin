'use client'

import { useEffect } from 'react'
import { PageErrorContent } from '@/components/PageErrorContent'
import { useTranslation } from '@/contexts/I18nContext'

/** 行銷區（首頁等）錯誤邊界：單一組件崩潰不導致整站白屏 */
export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation()
  useEffect(() => {
    console.error('Marketing error:', error?.message ?? error)
  }, [error])

  return (
    <PageErrorContent
      title={t('error.title')}
      description={t('error.description')}
      onRetry={reset}
      retryLabel={t('error.retry')}
      links={[
        { href: '/', label: t('notFound.back') },
        { href: '/quiz', label: t('nav.quiz') },
      ]}
    />
  )
}
