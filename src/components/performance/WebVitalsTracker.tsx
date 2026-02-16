'use client'

import { useEffect } from 'react'
import { useReportWebVitals } from 'next/web-vitals'

/**
 * Task 1.01: Core Web Vitals Optimization
 * Tracks and reports Core Web Vitals metrics for performance monitoring
 * 
 * Metrics tracked:
 * - LCP (Largest Contentful Paint) < 1.2s
 * - FID (First Input Delay) < 100ms  
 * - CLS (Cumulative Layout Shift) < 0.1
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 */
export function WebVitalsTracker() {
  useReportWebVitals((metric) => {
    // Send to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        navigation_type: metric.navigationType,
      })
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value)
    }

    // Performance monitoring and alerting
    switch (metric.name) {
      case 'LCP':
        if (metric.value > 1200) {
          console.warn(`[Performance Alert] LCP is ${metric.value}ms, target < 1200ms`)
        }
        break
      case 'FID':
        if (metric.value > 100) {
          console.warn(`[Performance Alert] FID is ${metric.value}ms, target < 100ms`)
        }
        break
      case 'CLS':
        if (metric.value > 0.1) {
          console.warn(`[Performance Alert] CLS is ${metric.value}, target < 0.1`)
        }
        break
    }
  })

  // Additional performance monitoring
  useEffect(() => {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask' && entry.duration > 50) {
            console.warn(`[Performance] Long task detected: ${entry.duration}ms`)
          }
        })
      })
      observer.observe({ entryTypes: ['longtask'] })
      
      return () => observer.disconnect()
    }
  }, [])

  return null
}