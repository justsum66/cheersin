'use client'

import { useEffect } from 'react'
import { PageErrorContent } from '@/components/PageErrorContent'
import { COPY_CTA_START_QUIZ, COPY_BUTTON_RETRY, COPY_LINK_HOME } from '@/config/copy.config'
import { ERROR_PAGE_GENERIC_TITLE, ERROR_PAGE_GENERIC_DESCRIPTION } from '@/config/errors.config'

/** E83 P2：全域錯誤頁 — DEDUP #7 使用 PageErrorContent 統一版面；P3-46 不暴露 stack */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error?.message ?? error)
  }, [error])

  return (
    <PageErrorContent
      title={ERROR_PAGE_GENERIC_TITLE}
      description={ERROR_PAGE_GENERIC_DESCRIPTION}
      onRetry={reset}
      retryLabel={COPY_BUTTON_RETRY}
      links={[
        { href: '/', label: COPY_LINK_HOME },
        { href: '/quiz', label: COPY_CTA_START_QUIZ },
      ]}
      footer={
        <p className="text-white/50 text-xs">
          若問題持續，請聯絡{' '}
          <a href="mailto:hello@cheersin.app" className="text-primary-400 hover:text-primary-300 underline">
            客服
          </a>
          。
        </p>
      }
    />
  )
}
