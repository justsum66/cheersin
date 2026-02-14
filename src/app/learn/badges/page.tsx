'use client'

/**
 * P2.E1.3 / R2-123：徽章牆 — 學習成就公開展示；解鎖時 scale 0→1 + 旋轉入場
 */
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { m } from 'framer-motion'
import { Award, ChevronLeft, Lock } from 'lucide-react'
import { getUnlockedBadges, BADGE_LABELS, type BadgeId } from '@/lib/gamification'

const ALL_BADGE_IDS: BadgeId[] = [
  'first-quiz', 'streak-7', 'games-10', 'learn-1', 'wishlist-5', 'assistant-10',
  'bookmark-5', 'bookmark-10', 'learn-60', 'learn-120', 'learn-300',
  'holiday-cny', 'course-complete',
]

export default function LearnBadgesPage() {
  const [unlocked, setUnlocked] = useState<BadgeId[]>([])

  useEffect(() => {
    setUnlocked(getUnlockedBadges())
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Award className="w-7 h-7 text-primary-400" />
          徽章牆
        </h1>
        <p className="text-white/60 text-sm mb-8">
          完成學習與互動即可解鎖徽章，展示你的成就。
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {ALL_BADGE_IDS.map((id, idx) => {
            const isUnlocked = unlocked.includes(id)
            return (
              <m.div
                key={id}
                initial={isUnlocked ? { scale: 0, rotate: -8 } : false}
                animate={isUnlocked ? { scale: 1, rotate: 0 } : {}}
                transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className={`p-4 rounded-xl border text-center transition-colors ${
                  isUnlocked
                    ? 'bg-primary-500/10 border-primary-500/30'
                    : 'bg-white/5 border-white/10 opacity-60'
                }`}
                title={BADGE_LABELS[id]}
              >
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center rounded-full bg-white/10">
                  {isUnlocked ? (
                    <Award className="w-6 h-6 text-primary-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-white/40" />
                  )}
                </div>
                <p className="text-sm font-medium text-white/90 truncate">{BADGE_LABELS[id]}</p>
              </m.div>
            )
          })}
        </div>

        <p className="mt-8 text-white/40 text-sm">
          <Link href="/learn" className="text-primary-400 hover:underline flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            返回課程總覽
          </Link>
        </p>
      </div>
    </div>
  )
}
