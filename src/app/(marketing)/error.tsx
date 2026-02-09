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
  const isChunkError = typeof error?.message === 'string' && /Failed to load chunk|Loading chunk \d+ failed/i.test(error.message)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isChunkError) {
      console.warn('Chunk load error (dev). Fix: run "npm run clean" then "npm run dev", or use "npm run dev:turbo" only if needed.')
    } else {
      console.error('Marketing error:', error instanceof Error ? error.message : String(error))
    }
  }, [error, isChunkError])

  return (
    <PageErrorContent
      title={t('error.title')}
      description={isChunkError ? '頁面資源載入失敗，請點「重新載入」或重新整理。若在開發模式反覆出現，請執行 npm run clean 後再 npm run dev。' : t('error.description')}
      onRetry={reset}
      retryLabel={t('error.retry')}
      links={[
        { href: '/', label: t('notFound.back') },
        { href: '/quiz', label: t('nav.quiz') },
      ]}
    />
  )
}
