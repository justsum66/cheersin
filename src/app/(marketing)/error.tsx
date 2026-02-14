'use client'

import { useEffect } from 'react'
import { PageErrorContent } from '@/components/PageErrorContent'
import { useTranslation } from '@/contexts/I18nContext'
import { logger } from '@/lib/logger'

const isChunkLoadError = (err: unknown) =>
  err instanceof Error && (err.name === 'ChunkLoadError' || /loading chunk|chunk.*failed|failed to fetch/i.test(err.message))

/** 行銷區（首頁等）錯誤邊界：單一組件崩潰不導致整站白屏 */
export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation()
  const chunkError = isChunkLoadError(error)
  const handleRetry = chunkError ? () => { if (typeof window !== 'undefined') window.location.reload() } : reset

  useEffect(() => {
    logger.error('Marketing error', {
      name: error?.name,
      message: error instanceof Error ? error.message : String(error),
      digest: error?.digest,
    })
  }, [error])

  return (
    <PageErrorContent
      title={t('error.title')}
      description={chunkError ? '頁面資源載入失敗，請點下方按鈕重新整理頁面。' : t('error.description')}
      onRetry={handleRetry}
      retryLabel={chunkError ? '重新整理頁面' : t('error.retry')}
      links={[
        { href: '/', label: t('notFound.back') },
        { href: '/quiz', label: t('nav.quiz') },
      ]}
    />
  )
}
