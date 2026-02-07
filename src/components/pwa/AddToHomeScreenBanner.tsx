'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Download } from 'lucide-react'

const A2HS_DISMISS_KEY = 'cheersin_a2hs_dismiss'
const A2HS_DISMISS_DAYS = 7

/** 任務 94：PWA 提示延遲 10s 不干擾首屏；關閉後暫存 N 天不再顯示 */
export default function AddToHomeScreenBanner() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<{ prompt: () => Promise<{ outcome: string }> } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true
    if (isStandalone) return
    try {
      const dismissed = localStorage.getItem(A2HS_DISMISS_KEY)
      if (dismissed) {
        const t = parseInt(dismissed, 10)
        if (Date.now() - t < A2HS_DISMISS_DAYS * 24 * 60 * 60 * 1000) return
      }
    } catch {
      /* ignore */
    }
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as unknown as { prompt: () => Promise<{ outcome: string }> })
      setShow(true)
    }
      
    // PWA 安裝成功追蹤
    const onAppInstalled = () => {
      try {
        // 發送 analytics 事件
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'pwa_installed',
            properties: { timestamp: Date.now() }
          })
        }).catch(() => {})
      } catch {}
    }
      
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onAppInstalled)
    const timer = setTimeout(() => setShow(true), 10000)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onAppInstalled)
      clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    try {
      await deferredPrompt.prompt()
      setShow(false)
    } catch {
      setShow(false)
    }
  }

  const handleDismiss = () => {
    setShow(false)
    try {
      localStorage.setItem(A2HS_DISMISS_KEY, String(Date.now()))
    } catch {
      /* ignore */
    }
  }

  if (!show) return null

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-40 md:bottom-4 md:left-auto md:right-4 md:max-w-sm safe-area-pb"
      role="region"
      aria-label="加入主畫面提示"
    >
      <div className="rounded-2xl bg-dark-800/95 border border-white/10 shadow-2xl p-4 flex items-center gap-3 backdrop-blur-xl">
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm">把 Cheersin 加到主畫面</p>
          <p className="text-white/50 text-xs mt-0.5">
            {deferredPrompt ? '一鍵開啟，離線也能用' : '使用瀏覽器選單「加入主畫面」'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {deferredPrompt ? (
            <button
              type="button"
              onClick={handleInstall}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 flex items-center justify-center gap-1"
              aria-label="加入主畫面"
            >
              <Download className="w-5 h-5" />
            </button>
          ) : (
            <Link
              href="/"
              className="min-h-[44px] px-3 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 flex items-center justify-center gap-1 text-sm"
            >
              前往首頁
            </Link>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-white/10 text-white/60 hover:text-white flex items-center justify-center"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
