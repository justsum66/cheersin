'use client'

import { memo } from 'react'
import { m } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Chapter } from './LearnCourseContent'

interface LearnChapterNavigationProps {
  chapters: Chapter[]
  activeChapterId: number | null
  completedCount: number
  progressPct: number
  onChapterClick: (chapterId: number) => void
}

/** 側邊章節導航 - 從 LearnCourseContent 拆分 */
function LearnChapterNavigationComponent({
  chapters,
  activeChapterId,
  completedCount,
  progressPct,
  onChapterClick,
}: LearnChapterNavigationProps) {
  return (
    <nav
      className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent p-4 rounded-xl bg-white/5 border border-white/10"
      aria-label="章節導航"
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
        <span className="text-white/60 text-xs font-medium">章節導航</span>
      </div>
      <ul className="space-y-1" role="list">
        {chapters.map((ch) => {
          const isActive = activeChapterId === ch.id
          const isChCompleted = completedCount >= ch.id
          return (
            <li key={ch.id}>
              <button
                type="button"
                onClick={() => onChapterClick(ch.id)}
                className={`group w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-primary-500/20 text-white border-l-2 border-primary-500 shadow-lg shadow-primary-500/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`}
                aria-current={isActive ? 'location' : undefined}
              >
                {/* 進度指示器 */}
                <span
                  className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-medium shrink-0 transition-all ${
                    isChCompleted
                      ? 'bg-primary-500 text-white'
                      : isActive
                        ? 'bg-white/20 text-white ring-2 ring-primary-500/50'
                        : 'bg-white/10 text-white/40 group-hover:bg-white/15'
                  }`}
                >
                  {isChCompleted ? <Check className="w-3 h-3" /> : ch.id}
                </span>
                {/* 章節標題 */}
                <span className="truncate flex-1">{ch.title}</span>
                {/* 時長 */}
                <span
                  className={`text-xs shrink-0 transition-opacity ${
                    isActive
                      ? 'text-primary-300 opacity-100'
                      : 'text-white/30 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {ch.duration}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {/* 整體進度 */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-white/50 mb-2">
          <span>整體進度</span>
          <span className="text-primary-400 font-medium">{progressPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <m.div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </nav>
  )
}

export const LearnChapterNavigation = memo(LearnChapterNavigationComponent)
export default LearnChapterNavigation
