'use client'

/**
 * R2-116：成就解鎖彈窗 — 金色卡片自右滑入，約 2 秒後關閉
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { m } from 'framer-motion'
import { Award, Trophy, Clock, Pin, Bookmark, Zap } from 'lucide-react'
import { BADGE_LABELS, type BadgeId } from '@/lib/gamification'

const BADGE_ICONS: Record<string, typeof Award> = {
  'first-quiz': Award,
  'streak-7': Award,
  'games-10': Trophy,
  'learn-1': Award,
  'wishlist-5': Bookmark,
  'assistant-10': Award,
  'bookmark-5': Pin,
  'bookmark-10': Pin,
  'learn-60': Clock,
  'learn-120': Clock,
  'learn-300': Clock,
  'holiday-cny': Award,
  'course-complete': Trophy,
  'trivia-streak-5': Zap,
}

interface BadgeUnlockCelebrationProps {
  badgeId: BadgeId
  onComplete: () => void
  prefersReducedMotion?: boolean
}

export function BadgeUnlockCelebration({ badgeId, onComplete, prefersReducedMotion }: BadgeUnlockCelebrationProps) {
  const [exiting, setExiting] = useState(false)
  const duration = prefersReducedMotion ? 1200 : 2000

  useEffect(() => {
    const t = setTimeout(() => setExiting(true), duration)
    return () => clearTimeout(t)
  }, [badgeId, duration])

  if (typeof document === 'undefined') return null

  const Icon = BADGE_ICONS[badgeId] ?? Award
  const label = BADGE_LABELS[badgeId] ?? badgeId

  return createPortal(
    <m.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label={`成就解鎖：${label}`}
    >
      <m.div
        className="px-8 py-6 rounded-2xl bg-gradient-to-br from-amber-500/95 to-orange-600/95 border-2 border-amber-300/50 shadow-2xl"
        initial={prefersReducedMotion ? false : { x: 100, opacity: 0, scale: 0.9 }}
        animate={exiting ? { x: 80, opacity: 0, scale: 0.95 } : { x: 0, opacity: 1, scale: 1 }}
        transition={{ duration: exiting ? 0.2 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => exiting && onComplete()}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="w-8 h-8 text-amber-100" aria-hidden />
          </div>
          <div>
            <p className="text-amber-100/80 text-sm font-medium">成就解鎖</p>
            <p className="text-xl font-bold text-white">{label}</p>
          </div>
        </div>
      </m.div>
    </m.div>,
    document.body
  )
}
