'use client'

/**
 * R2-054：等級提升慶祝 — 全螢幕 overlay 顯示等級數字放大動畫 + confetti
 */
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { m } from 'framer-motion'
import { fireFullscreenConfetti } from '@/lib/celebration'

const STORAGE_KEY = 'cheersin_last_known_level'

interface LevelUpCelebrationProps {
  level: number
  onComplete: () => void
  prefersReducedMotion?: boolean
}

export function LevelUpCelebration({ level, onComplete, prefersReducedMotion }: LevelUpCelebrationProps) {
  useEffect(() => {
    if (!prefersReducedMotion) fireFullscreenConfetti().catch(() => {})
    const t = setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, String(level))
        } catch { /* ignore */ }
      }
      onComplete()
    }, prefersReducedMotion ? 800 : 2500)
    return () => clearTimeout(t)
  }, [level, onComplete, prefersReducedMotion])

  if (typeof document === 'undefined') return null

  return createPortal(
    <m.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label={`等級提升至 ${level}`}
    >
      <m.p
        className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: [0.3, 1.2, 1], opacity: 1 }}
        transition={{
          duration: prefersReducedMotion ? 0.3 : 0.8,
          times: [0, 0.6, 1],
          ease: 'easeOut',
        }}
      >
        Lv.{level}
      </m.p>
      <m.p
        className="mt-4 text-xl text-white/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: prefersReducedMotion ? 0.1 : 0.4 }}
      >
        升級成功！
      </m.p>
    </m.div>,
    document.body
  )
}

export { STORAGE_KEY }
