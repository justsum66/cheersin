'use client'

import { useEffect } from 'react'

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
            // 可在此動態載入 Google Analytics、Plausible 等
            // window.gtag?.('config', 'G-XXX')
          },
          { timeout: 2000 }
        )
      } else {
        setTimeout(() => {}, 0)
      }
    }
    loadWhenIdle()
  }, [])
  return null
}
