'use client'

import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'
import { useEffect } from 'react'

/** P3-470：全域錯誤邊界 — 捕獲 App Router 未處理錯誤並送 Sentry。R2-289：品牌化版面、重試與聯絡客服。 */
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

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <html lang="zh-TW">
      <body style={{ margin: 0, background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 100%)', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <main
          style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          role="alert"
          aria-label="發生錯誤"
        >
          <div style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: 16, borderRadius: '9999px', background: 'rgba(239,68,68,0.1)', color: 'rgb(248,113,113)', marginBottom: 24 }} aria-hidden>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>發生錯誤</h1>
            <p style={{ fontSize: '0.875rem', color: 'rgba(248,113,113,0.9)', marginBottom: 24 }}>頁面載入時發生問題，請重新載入或聯絡客服。</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleRetry}
                style={{ minHeight: 48, paddingLeft: 24, paddingRight: 24, borderRadius: 12, border: 'none', background: 'rgb(139,0,0)', color: '#fff', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
              >
                重新載入
              </button>
              <Link
                href="/"
                style={{ minHeight: 48, paddingLeft: 24, paddingRight: 24, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.875rem', textDecoration: 'none' }}
              >
                回首頁
              </Link>
            </div>
            <p style={{ marginTop: 24, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
              若問題持續，請聯絡{' '}
              <a href="mailto:hello@cheersin.app" style={{ color: 'rgba(212,175,55,0.9)', textDecoration: 'underline' }}>hello@cheersin.app</a>
            </p>
          </div>
        </main>
      </body>
    </html>
  )
}
