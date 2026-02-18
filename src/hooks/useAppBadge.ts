/**
 * PWA-012: App Badge API for unread notification count on home screen icon.
 * Uses navigator.setAppBadge / clearAppBadge when available.
 */

import { useCallback } from 'react'

interface UseAppBadge {
  /** Set the badge count on the app icon. Pass 0 or undefined to clear. */
  setBadge: (count?: number) => Promise<void>
  /** Clear the badge entirely. */
  clearBadge: () => Promise<void>
  /** Whether the Badge API is supported by the current browser. */
  isSupported: boolean
}

export function useAppBadge(): UseAppBadge {
  const isSupported =
    typeof navigator !== 'undefined' && 'setAppBadge' in navigator

  const setBadge = useCallback(async (count?: number) => {
    if (!isSupported) return
    try {
      if (!count || count <= 0) {
        await (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge()
      } else {
        await (navigator as Navigator & { setAppBadge: (c: number) => Promise<void> }).setAppBadge(count)
      }
    } catch {
      // Badge API may throw if not in a secure context or installed PWA
    }
  }, [isSupported])

  const clearBadge = useCallback(async () => {
    if (!isSupported) return
    try {
      await (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge()
    } catch {
      // silently fail
    }
  }, [isSupported])

  return { setBadge, clearBadge, isSupported }
}
