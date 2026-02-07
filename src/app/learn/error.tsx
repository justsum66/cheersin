'use client'

import { useEffect } from 'react'
import { PageErrorContent } from '@/components/PageErrorContent'
import { ERROR_PAGE_LEARN_TITLE, ERROR_PAGE_LEARN_DESCRIPTION } from '@/config/errors.config'

/** 57 錯誤邊界與 fallback — DEDUP #7 使用 PageErrorContent 統一版面 */
export default function LearnError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Learn]', error)
  }, [error])

  return (
    <PageErrorContent
      title={ERROR_PAGE_LEARN_TITLE}
      description={ERROR_PAGE_LEARN_DESCRIPTION}
      onRetry={reset}
      retryLabel="重新載入"
      links={[{ href: '/', label: '返回首頁' }]}
    />
  )
}
