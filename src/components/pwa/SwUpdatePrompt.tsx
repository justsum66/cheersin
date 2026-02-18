'use client'

import { useEffect, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { RefreshCw, X } from 'lucide-react'
import { applyServiceWorkerUpdate } from '@/lib/sw-register'

/**
 * PWA-003: SW Update Prompt — listens for 'sw-update-available' custom event
 * and shows an in-app toast/banner prompting the user to reload.
 */
export default function SwUpdatePrompt() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.registration) {
        setRegistration(detail.registration)
        setShow(true)
      }
    }
    window.addEventListener('sw-update-available', handler)
    return () => window.removeEventListener('sw-update-available', handler)
  }, [])

  const handleUpdate = () => {
    if (registration) {
      applyServiceWorkerUpdate(registration)
    }
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          className="fixed top-2 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-4 py-3 bg-primary-500/90 backdrop-blur-md rounded-2xl border border-primary-400/50 shadow-lg max-w-sm"
        >
          <RefreshCw className="w-5 h-5 text-white flex-shrink-0" />
          <p className="text-white text-sm">有新版本可用</p>
          <button
            type="button"
            onClick={handleUpdate}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg transition-colors"
          >
            更新
          </button>
          <button
            type="button"
            onClick={() => setShow(false)}
            className="p-1 text-white/60 hover:text-white"
            aria-label="關閉"
          >
            <X className="w-4 h-4" />
          </button>
        </m.div>
      )}
    </AnimatePresence>
  )
}
