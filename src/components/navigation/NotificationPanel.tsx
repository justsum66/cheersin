'use client'

import { useRef, useEffect, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NotificationPanelProps {
  notificationsOpen: boolean
  setNotificationsOpen: (value: boolean | ((prev: boolean) => boolean)) => void
  prefersReducedMotion: boolean
}

/** P002: Notification panel extracted from Navigation.tsx for better code splitting */
export function NotificationPanel({
  notificationsOpen,
  setNotificationsOpen,
  prefersReducedMotion,
}: NotificationPanelProps) {
  const notificationsRef = useRef<HTMLDivElement>(null)

  /** N12：通知點擊外關閉 — useCallback 穩定 */
  const handleNotificationOutside = useCallback((e: MouseEvent) => {
    if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
      setNotificationsOpen(false)
    }
  }, [setNotificationsOpen])

  useEffect(() => {
    if (!notificationsOpen) return
    document.addEventListener('mousedown', handleNotificationOutside)
    return () => document.removeEventListener('mousedown', handleNotificationOutside)
  }, [notificationsOpen, handleNotificationOutside])

  return (
    <div className="relative" ref={notificationsRef}>
      <button
        type="button"
        onClick={() => setNotificationsOpen((v) => !v)}
        className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center games-focus-ring"
        aria-label="站內通知"
        aria-expanded={notificationsOpen}
      >
        <Bell className="w-5 h-5" />
      </button>
      <AnimatePresence>
        {notificationsOpen && (
          <motion.div
            className="absolute right-0 top-full mt-1 w-64 max-w-[calc(100vw-2rem)] max-h-[70vh] overflow-auto rounded-xl bg-[#1a0a2e] border border-white/10 py-2 shadow-xl z-[60] safe-area-px"
            role="menu"
            aria-label="通知列表"
            aria-describedby="nav-notifications-empty"
            id="nav-notifications-panel"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}
          >
            <p id="nav-notifications-empty" className="px-4 py-2 text-white/50 text-sm">
              尚無通知
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
