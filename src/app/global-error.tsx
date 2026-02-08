'use client'

import * as Sentry from '@sentry/nextjs'
import NextError from 'next/error'
import { useEffect } from 'react'

/** P3-470：全域錯誤邊界 — 捕獲 App Router 未處理錯誤並送 Sentry */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
      Sentry.captureException(error)
    }
  }, [error])

  return (
    <html lang="zh-TW">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
