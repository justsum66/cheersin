'use client'

import { useEffect, useState } from 'react'
import AddToHomeScreenBanner from './AddToHomeScreenBanner'

const SW_URL = '/sw.js'

/** 291–292 PWA：註冊 Service Worker + 添加到主畫面橫幅 + 更新提示 */
export default function PwaProvider() {
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false)
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker.register(SW_URL).then((registration) => {
      setSwRegistration(registration)

      // 檢查更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // 有新版本可用
            setSwUpdateAvailable(true)
          }
        })
      })
    }).catch(() => {
      /* ignore */
    })

    // 監聽 SW 控制權變更（新 SW 已啟動）
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })
  }, [])

  const handleUpdate = () => {
    if (!swRegistration?.waiting) return
    // 通知等待中的 SW 可以 skipWaiting
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }

  return (
    <>
      <AddToHomeScreenBanner />
      {swUpdateAvailable && (
        <div
          role="alert"
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 p-4 rounded-lg bg-primary-600 text-white shadow-xl border border-white/10 safe-area-pb"
        >
          <p className="text-sm font-medium mb-2">有新版本可用</p>
          <p className="text-xs text-white/80 mb-3">點擊更新以獲取最新功能</p>
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="flex-1 px-4 py-2 rounded-lg bg-white text-primary-600 font-medium text-sm hover:bg-white/90 transition-colors games-touch-target games-focus-ring"
            >
              立即更新
            </button>
            <button
              onClick={() => setSwUpdateAvailable(false)}
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
