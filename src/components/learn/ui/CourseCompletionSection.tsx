'use client'

import { useState } from 'react'
import Link from 'next/link'
import { m } from 'framer-motion'
import { Sparkles, ChevronRight, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { ShareToStory } from './ShareToStory'
import { CertificateShare } from './CertificateShare'
import { NEXT_COURSE_MAP } from '@/config/learn-curriculum'
import { LEARN_XP_KEY, LEARN_USER_RATINGS_KEY } from '@/config/learn.config'
import type { ProgressEntry } from '@/lib/learn-progress.utils'

/** LEARN-049: 計算並儲存 XP */
function awardCourseXP(courseId: string, totalChapters: number): number {
  const xpEarned = totalChapters * 20 + 50 // base 50 + 20 per chapter
  try {
    const raw = localStorage.getItem(LEARN_XP_KEY)
    const xpData: Record<string, number> = raw ? JSON.parse(raw) : {}
    if (!xpData[courseId]) {
      xpData[courseId] = xpEarned
      localStorage.setItem(LEARN_XP_KEY, JSON.stringify(xpData))
    }
    return Object.values(xpData).reduce((a, b) => a + b, 0)
  } catch { return xpEarned }
}

/** LEARN-050: 讀取使用者評分 */
function getUserRating(courseId: string): number {
  try {
    const raw = localStorage.getItem(LEARN_USER_RATINGS_KEY)
    const data: Record<string, number> = raw ? JSON.parse(raw) : {}
    return data[courseId] ?? 0
  } catch { return 0 }
}

function setUserRating(courseId: string, rating: number): void {
  try {
    const raw = localStorage.getItem(LEARN_USER_RATINGS_KEY)
    const data: Record<string, number> = raw ? JSON.parse(raw) : {}
    data[courseId] = rating
    localStorage.setItem(LEARN_USER_RATINGS_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

interface CourseCompletionSectionProps {
  courseId: string
  courseTitle: string
  totalChapters: number
  progressPct: number
  progress: Record<string, ProgressEntry>
  currentProgress?: ProgressEntry
}

export function CourseCompletionSection({
  courseId,
  courseTitle,
  totalChapters,
  progressPct,
  progress,
  currentProgress,
}: CourseCompletionSectionProps) {
  const [rating, setRating] = useState(() => getUserRating(courseId))
  const [hoveredStar, setHoveredStar] = useState(0)

  if (progressPct < 100) return null

  const recommendations = NEXT_COURSE_MAP[courseId] ?? NEXT_COURSE_MAP['_default'] ?? []

  // 過濾掉已完成的課程
  const unfinished = recommendations
    .filter((r) => {
      const p = progress[r.id]
      if (!p) return true
      return p.completed < p.total
    })
    .slice(0, 3)

  // LEARN-049: 計算 XP
  const totalXP = awardCourseXP(courseId, totalChapters)

  const handleRate = (stars: number) => {
    setRating(stars)
    setUserRating(courseId, stars)
    toast.success(`感謝評分！你給了 ${stars} 星`, { duration: 2000 })
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-transparent border border-primary-500/20"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary-500/20">
          <Sparkles className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">恭喜完成 {courseTitle}！</h3>
          <p className="text-white/60 text-sm">推薦你接續學習以下課程</p>
        </div>
      </div>

      {/* LEARN-049: XP 獎勵顯示 */}
      <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
        <span className="text-2xl">⭐</span>
        <div>
          <p className="text-amber-300 text-sm font-medium">+{totalChapters * 20 + 50} XP 獲得！</p>
          <p className="text-white/50 text-xs">累計 XP：{totalXP}</p>
        </div>
      </div>

      {/* LEARN-050: 課程評分 */}
      <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
        <p className="text-white/70 text-sm mb-2">為這堂課評分：</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => handleRate(s)}
              onMouseEnter={() => setHoveredStar(s)}
              onMouseLeave={() => setHoveredStar(0)}
              className="p-1 transition-transform hover:scale-110"
              aria-label={`${s} 星`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  s <= (hoveredStar || rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-white/20'
                }`}
              />
            </button>
          ))}
          {rating > 0 && <span className="text-white/50 text-xs ml-2">已評 {rating} 星</span>}
        </div>
      </div>

      {/* Phase 2 E1.1: IG Story 分享按鈕 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <ShareToStory courseTitle={courseTitle} completedAt={currentProgress?.completedAt} totalChapters={totalChapters} />
        {/* Phase 2 E1.2: 證書分享連結 */}
        <CertificateShare courseTitle={courseTitle} completedAt={currentProgress?.completedAt} totalChapters={totalChapters} />
      </div>

      {unfinished.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {unfinished.map((course, idx) => (
            <m.div key={course.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + idx * 0.1 }}>
              <Link
                href={`/learn/${course.id}`}
                className="group block p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white group-hover:text-primary-300 transition-colors truncate">{course.title}</h4>
                    <p className="text-white/50 text-sm mt-1 line-clamp-2">{course.reason}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-primary-400 group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />
                </div>
              </Link>
            </m.div>
          ))}
        </div>
      )}
    </m.div>
  )
}
