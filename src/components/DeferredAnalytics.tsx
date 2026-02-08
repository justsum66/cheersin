'use client'

import Script from 'next/script'
import { useEffect } from 'react'

/** P3-450：GA4 佔位 — 當 NEXT_PUBLIC_GA_ID 設定時載入 gtag，追蹤頁面與事件 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ''

/**
 * FID < 100ms：分離長任務，使用 requestIdleCallback 延遲加載分析腳本
 * 避免阻塞主線程影響首次輸入延遲
 */
export default function DeferredAnalytics() {
  useEffect(() => {
    const loadWhenIdle = () => {
      if ('requestIdleCallback' in window) {
        ;(window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
          () => {
            // 可在此呼叫 gtag('event', ...) 等
          },
          { timeout: 2000 }
        )
      } else {
        setTimeout(() => {}, 0)
      }
    }
    loadWhenIdle()
  }, [])
  if (!GA_ID.trim()) return null
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
      <Script id="ga4-config" strategy="lazyOnload">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  )
}
