'use client'

import { useEffect } from 'react'
import { PageErrorContent } from '@/components/PageErrorContent'
import { ERROR_PAGE_QUIZ_TITLE, ERROR_PAGE_QUIZ_DESCRIPTION } from '@/config/errors.config'

/** Q-05 Quiz 錯誤態 — DEDUP #7 使用 PageErrorContent 統一版面 */
export default function QuizError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Quiz]', error)
  }, [error])

  return (
    <PageErrorContent
      title={ERROR_PAGE_QUIZ_TITLE}
      description={ERROR_PAGE_QUIZ_DESCRIPTION}
      onRetry={reset}
      retryLabel="重新載入"
      links={[
        { href: '/', label: '返回首頁' },
        { href: '/quiz', label: '再試一次測驗' },
      ]}
    />
  )
}
