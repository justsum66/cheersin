'use client'

import { useEffect } from 'react'
import { PageErrorContent } from '@/components/PageErrorContent'
import { useTranslation } from '@/contexts/I18nContext'
import { logger } from '@/lib/logger'

function isChunkLoadError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const e = err as Error
  return e.name === 'ChunkLoadError' || /loading chunk|chunk.*failed/i.test(e.message)
}

/** E83 P2：全域錯誤頁 — DEDUP #7 使用 PageErrorContent 統一版面；i18n 接線 error.* */
export default function Error({
  error,
  reset,
}: {
  error: unknown
  reset: () => void
}) {
  const { t } = useTranslation()
  const chunkError = isChunkLoadError(error)
  const handleRetry = chunkError ? () => { if (typeof window !== 'undefined') window.location.reload() } : reset

  useEffect(() => {
    const err = error as Error & { digest?: string }
    logger.error('App error', {
      name: err?.name,
      message: err instanceof Error ? err.message : String(error),
      digest: err?.digest,
    })
  }, [error])

  return (
    <PageErrorContent
      title={t('error.title')}
      description={chunkError ? '資源載入失敗，請點下方按鈕重新整理頁面' : t('error.description')}
      onRetry={handleRetry}
      retryLabel={chunkError ? '重新整理頁面' : t('error.retry')}
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
