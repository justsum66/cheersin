'use client'

import Link from 'next/link'
import { m } from 'framer-motion'
import { Sparkles, ChevronRight } from 'lucide-react'
import { ShareToStory } from './ShareToStory'
import { CertificateShare } from './CertificateShare'
import { NEXT_COURSE_MAP } from '@/config/learn-curriculum'
import type { ProgressEntry } from '@/lib/learn-progress.utils'

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

  if (unfinished.length === 0) return null

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

      {/* Phase 2 E1.1: IG Story 分享按鈕 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <ShareToStory courseTitle={courseTitle} completedAt={currentProgress?.completedAt} totalChapters={totalChapters} />
        {/* Phase 2 E1.2: 證書分享連結 */}
        <CertificateShare courseTitle={courseTitle} completedAt={currentProgress?.completedAt} totalChapters={totalChapters} />
      </div>

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
    </m.div>
  )
}
