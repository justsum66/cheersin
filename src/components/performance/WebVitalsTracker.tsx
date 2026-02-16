'use client'

import { useEffect, useCallback } from 'react'
import { useReportWebVitals } from 'next/web-vitals'

// Performance budget thresholds
const PERFORMANCE_BUDGETS = {
  LCP: 1200,      // < 1.2s
  FID: 100,       // < 100ms
  CLS: 0.1,       // < 0.1
  INP: 200,       // < 200ms (new INP metric)
  FCP: 1800,      // < 1.8s
  TTFB: 800,      // < 800ms
  // Game-specific metrics
  GAME_LOAD: 3000,  // < 3s
  INTERACTION_DELAY: 100, // < 100ms
} as const

// Performance monitoring state
let performanceMetrics: Record<string, number[]> = {}
let interactionCount = 0
let frustrationSignals = 0

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
  // Record metric for analytics
  const recordMetric = useCallback((name: string, value: number) => {
    if (!performanceMetrics[name]) {
      performanceMetrics[name] = []
    }
    performanceMetrics[name].push(value)
    
    // Keep only last 100 measurements to prevent memory leaks
    if (performanceMetrics[name].length > 100) {
      performanceMetrics[name] = performanceMetrics[name].slice(-100)
    }
  }, [])

  // Check performance budget
  const checkBudget = useCallback((metricName: string, value: number) => {
    const budget = PERFORMANCE_BUDGETS[metricName as keyof typeof PERFORMANCE_BUDGETS]
    if (budget && value > budget) {
      const exceedPercent = Math.round(((value - budget) / budget) * 100)
      console.warn(`[Performance Budget] ${metricName} exceeded by ${exceedPercent}% (${value}ms > ${budget}ms)`)
      
      // Send to analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'performance_budget_exceeded', {
          metric_name: metricName,
          actual_value: value,
          budget_value: budget,
          exceed_percentage: exceedPercent,
        })
      }
    }
  }, [])

  // Monitor interaction delays
  const monitorInteractionDelay = useCallback(() => {
    if (typeof window === 'undefined') return
    
    let interactionStart = 0
    
    const handleInteractionStart = () => {
      interactionStart = performance.now()
    }
    
    const handleInteractionEnd = () => {
      if (interactionStart > 0) {
        const delay = performance.now() - interactionStart
        recordMetric('interaction_delay', delay)
        checkBudget('INTERACTION_DELAY', delay)
        interactionStart = 0
      }
    }
    
    // Monitor key interactions
    document.addEventListener('keydown', handleInteractionStart, true)
    document.addEventListener('mousedown', handleInteractionStart, true)
    document.addEventListener('touchstart', handleInteractionStart, true)
    
    document.addEventListener('keyup', handleInteractionEnd, true)
    document.addEventListener('mouseup', handleInteractionEnd, true)
    document.addEventListener('touchend', handleInteractionEnd, true)
    
    return () => {
      document.removeEventListener('keydown', handleInteractionStart, true)
      document.removeEventListener('mousedown', handleInteractionStart, true)
      document.removeEventListener('touchstart', handleInteractionStart, true)
      document.removeEventListener('keyup', handleInteractionEnd, true)
      document.removeEventListener('mouseup', handleInteractionEnd, true)
      document.removeEventListener('touchend', handleInteractionEnd, true)
    }
  }, [recordMetric, checkBudget])
  useReportWebVitals((metric) => {
    // Record the metric
    recordMetric(metric.name, metric.value)
    
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

    // Check performance budgets
    checkBudget(metric.name, metric.value)

    // Performance monitoring and alerting
    switch (metric.name) {
      case 'LCP':
        if (metric.value > PERFORMANCE_BUDGETS.LCP) {
          console.warn(`[Performance Alert] LCP is ${metric.value}ms, target < ${PERFORMANCE_BUDGETS.LCP}ms`)
        }
        break
      case 'FID':
        if (metric.value > PERFORMANCE_BUDGETS.FID) {
          console.warn(`[Performance Alert] FID is ${metric.value}ms, target < ${PERFORMANCE_BUDGETS.FID}ms`)
          frustrationSignals++
        }
        break
      case 'CLS':
        if (metric.value > PERFORMANCE_BUDGETS.CLS) {
          console.warn(`[Performance Alert] CLS is ${metric.value}, target < ${PERFORMANCE_BUDGETS.CLS}`)
        }
        break
      case 'INP':
        if (metric.value > PERFORMANCE_BUDGETS.INP) {
          console.warn(`[Performance Alert] INP is ${metric.value}ms, target < ${PERFORMANCE_BUDGETS.INP}ms`)
          frustrationSignals++
        }
        break
      case 'FCP':
        if (metric.value > PERFORMANCE_BUDGETS.FCP) {
          console.warn(`[Performance Alert] FCP is ${metric.value}ms, target < ${PERFORMANCE_BUDGETS.FCP}ms`)
        }
        break
      case 'TTFB':
        if (metric.value > PERFORMANCE_BUDGETS.TTFB) {
          console.warn(`[Performance Alert] TTFB is ${metric.value}ms, target < ${PERFORMANCE_BUDGETS.TTFB}ms`)
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
            recordMetric('long_task', entry.duration)
          }
        })
      })
      observer.observe({ entryTypes: ['longtask'] })
      
      return () => observer.disconnect()
    }
  }, [recordMetric])

  // Monitor interaction delays
  useEffect(() => {
    return monitorInteractionDelay()
  }, [monitorInteractionDelay])

  // Game loading performance monitoring
  useEffect(() => {
    const handleGameLoad = () => {
      const gameLoadTime = performance.now()
      recordMetric('game_load_time', gameLoadTime)
      checkBudget('GAME_LOAD', gameLoadTime)
    }

    // Listen for game load events
    window.addEventListener('game-load-start', handleGameLoad)
    
    return () => {
      window.removeEventListener('game-load-start', handleGameLoad)
    }
  }, [recordMetric, checkBudget])

  // Performance dashboard API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.getPerformanceMetrics = () => ({
        metrics: performanceMetrics,
        frustrationSignals,
        interactionCount,
        getAverage: (metricName: string) => {
          const metrics = performanceMetrics[metricName] || []
          return metrics.length > 0 
            ? metrics.reduce((a, b) => a + b, 0) / metrics.length 
            : 0
        },
        getPercentile: (metricName: string, percentile: number) => {
          const metrics = [...(performanceMetrics[metricName] || [])].sort((a, b) => a - b)
          if (metrics.length === 0) return 0
          const index = Math.floor((percentile / 100) * (metrics.length - 1))
          return metrics[index]
        }
      })
    }
  }, [])

  return null
}