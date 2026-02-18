'use client'

import { useEffect, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * PWA-004: Custom install prompt — captures beforeinstallprompt and shows custom UI.
 * Displays after 30s delay to avoid disrupting the initial experience.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed this session
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed')) {
      return
    }
    // Check if already installed (standalone mode)
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Delay showing the prompt to avoid disruption
      setTimeout(() => setShow(true), 30000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setShow(false)
        setDeferredPrompt(null)
      }
    } catch {
      // User cancelled or error
    }
  }

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('pwa-install-dismissed', '1')
    }
  }

  if (dismissed || !show || !deferredPrompt) return null

  return (
    <AnimatePresence>
      <m.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[180] bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-2xl safe-area-pb"
      >
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-white/40 hover:text-white"
          aria-label="關閉安裝提示"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <Download className="w-6 h-6 text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm mb-1">安裝 Cheersin 沁飲</h3>
            <p className="text-white/50 text-xs mb-3 leading-relaxed">
              安裝到主畫面，享受更快速、更流暢的體驗！
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleInstall}
                className="flex-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium rounded-lg transition-colors"
              >
                安裝
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white/60 text-xs rounded-lg transition-colors"
              >
                之後再說
              </button>
            </div>
          </div>
        </div>
      </m.div>
    </AnimatePresence>
  )
}
