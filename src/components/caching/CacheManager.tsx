'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

/**
 * Task 1.04: Caching Strategy Enhancement
 * Client-side cache manager for service worker registration and cache control
 */
export function CacheManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [cacheStats, setCacheStats] = useState({ static: { entries: 0 }, dynamic: { entries: 0 } })
  const [isVisible, setIsVisible] = useState(false)

  // 儲存可見性狀態
  const toggleVisibility = () => {
    const newVisible = !isVisible
    setIsVisible(newVisible)
    // 只在需要時保存到 localStorage
    if (!newVisible) {
      localStorage.setItem('cacheManagerVisible', 'false')
    } else {
      localStorage.removeItem('cacheManagerVisible')
    }
  }

  // 初始化時檢查是否應該顯示
  useEffect(() => {
    const saved = localStorage.getItem('cacheManagerVisible')
    if (saved === 'false') {
      setIsVisible(false)
    } else {
      // 默認不顯示，除非用戶主動打開
      setIsVisible(false)
    }
  }, [])

  useEffect(() => {
    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      setIsSupported(true)
      registerServiceWorker()
      setupCacheMonitoring()
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      if (process.env.NODE_ENV !== 'production') console.log('[Cache Manager] Service worker registered:', registration)
      setIsRegistered(true)
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version is available
              if (process.env.NODE_ENV !== 'production') console.log('[Cache Manager] New service worker available')
              showUpdateNotification()
            }
          })
        }
      })
    } catch (error) {
      console.error('[Cache Manager] Service worker registration failed:', error)
    }
  }

  const setupCacheMonitoring = () => {
    // Monitor cache performance
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('/api/') || entry.name.includes('/_next/data/')) {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[Cache Manager] API Response: ${entry.name}`, {
              duration: entry.duration,
              size: resourceEntry.transferSize,
              cached: resourceEntry.transferSize === 0
            })
          }
        }
      })
    })
    
    observer.observe({ entryTypes: ['navigation', 'resource'] })
  }

  const showUpdateNotification = () => {
    if (confirm('A new version is available. Refresh to update?')) {
      // Send message to service worker to skip waiting
      navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  const invalidateCache = async (pattern: string) => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_INVALIDATE',
        pattern
      })
      if (process.env.NODE_ENV !== 'production') console.log(`[Cache Manager] Invalidating cache for pattern: ${pattern}`)
    }
  }

  const getCacheStats = async () => {
    if (navigator.serviceWorker.controller) {
      const channel = new MessageChannel()
      channel.port1.onmessage = (event) => {
        setCacheStats(event.data)
      }
      
      navigator.serviceWorker.controller.postMessage(
        { type: 'CACHE_STATS' },
        [channel.port2]
      )
    }
  }

  // Get cache stats periodically
  useEffect(() => {
    if (isRegistered) {
      const interval = setInterval(getCacheStats, 5000)
      return () => clearInterval(interval)
    }
  }, [isRegistered])

  // 顯示隱藏的觸發按鈕
  if (!isSupported) {
    return null
  }

  if (!isVisible) {
    return (
      <button
        type="button"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-2 text-white hover:bg-black/90 transition-colors"
        aria-label="開啟 Cache Manager"
      >
        <span className="text-xs">Cache</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white text-sm min-w-[280px]">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">Cache Manager</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRegistered ? 'bg-green-500' : 'bg-red-500'}`} />
          <button
            type="button"
            onClick={toggleVisibility}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="關閉 Cache Manager"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-1 text-xs">
        <div>Static Cache: {cacheStats.static.entries} entries</div>
        <div>Dynamic Cache: {cacheStats.dynamic.entries} entries</div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => invalidateCache('/api/')}
          className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
        >
          Clear API Cache
        </button>
        <button
          onClick={getCacheStats}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
        >
          Refresh Stats
        </button>
      </div>
    </div>
  )
}