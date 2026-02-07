'use client'

import { useReportWebVitals } from 'next/web-vitals'

/**
 * 296 RUM：LCP、FID、CLS、FCP、TTFB、INP
 * 發送數據至 /api/analytics
 */
export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === 'development') {
      const { name, value, id, rating } = metric
      const status = rating === 'good' ? '✓' : rating === 'needs-improvement' ? '!' : '✗'
      console.log(`[Web Vitals] ${status} ${name}: ${Math.round(value)}ms (${id})`)
    }
    if (metric.name === 'LCP' && metric.value > 2500 && typeof window !== 'undefined') {
      try {
        const key = 'cheersin_lcp_warn'
        const last = sessionStorage.getItem(key)
        if (!last || Date.now() - parseInt(last, 10) > 60000) {
          sessionStorage.setItem(key, String(Date.now()))
          console.warn(`[Perf] LCP 超過 2.5s 目標：${Math.round(metric.value)}ms`)
        }
      } catch {
        /* ignore */
      }
    }
    /** 發送至 /api/analytics */
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        rating: metric.rating,
      })
      fetch('/api/analytics', {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => { /* ignore */ })
    }
  })
  return null
}
