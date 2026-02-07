'use client'

import { useEffect, useState, useCallback } from 'react'
import AddToHomeScreenBanner from './AddToHomeScreenBanner'
import OfflineBanner from './OfflineBanner'

const SW_URL = '/sw.js'
/** PWA.1：點「稍後」後多久內不再顯示更新提示（ms） */
const SW_UPDATE_DISMISS_MS = 24 * 60 * 60 * 1000
const SW_UPDATE_DISMISS_KEY = 'cheersin_sw_update_dismissed'

/** 291–292 PWA：註冊 Service Worker + 添加到主畫面橫幅 + 更新提示；PWA.1 優化：稍後冷卻、無障礙 */
export default function PwaProvider() {
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false)
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker.register(SW_URL).then((registration) => {
      setSwRegistration(registration)

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return
        try {
          const dismissed = sessionStorage.getItem(SW_UPDATE_DISMISS_KEY)
          if (dismissed) {
            const t = parseInt(dismissed, 10)
            if (Number.isFinite(t) && Date.now() - t < SW_UPDATE_DISMISS_MS) return
          }
        } catch {
          /* ignore */
        }
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setSwUpdateAvailable(true)
          }
        })
      })
    }).catch(() => {
      /* ignore */
    })

    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })
  }, [])

  const handleUpdate = useCallback(() => {
    if (!swRegistration?.waiting) return
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }, [swRegistration?.waiting])

  const handleDismiss = useCallback(() => {
    setSwUpdateAvailable(false)
    try {
      sessionStorage.setItem(SW_UPDATE_DISMISS_KEY, String(Date.now()))
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <>
      <OfflineBanner />
      <AddToHomeScreenBanner />
      {swUpdateAvailable && (
        <div
          role="alert"
          aria-live="polite"
          aria-label="有新版本可用"
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 p-4 rounded-lg bg-primary-600 text-white shadow-xl border border-white/10 safe-area-pb"
        >
          <p className="text-sm font-medium mb-2">有新版本可用</p>
          <p className="text-xs text-white/80 mb-3">點擊「立即更新」以獲取最新功能；選擇「稍後」則 24 小時內不再提示。</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUpdate}
              className="flex-1 px-4 py-2 rounded-lg bg-white text-primary-600 font-medium text-sm hover:bg-white/90 transition-colors games-touch-target games-focus-ring"
            >
              立即更新
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors games-touch-target games-focus-ring"
            >
              稍後
            </button>
          </div>
        </div>
      )}
    </>
  )
}
