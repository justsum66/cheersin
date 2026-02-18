'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/sw-register'

/**
 * PWA-003: Client-only component that registers the Service Worker on mount.
 * Must be loaded with { ssr: false } to avoid server-side execution.
 */
export default function SwRegisterScript() {
  useEffect(() => {
    registerServiceWorker()
  }, [])
  return null
}
