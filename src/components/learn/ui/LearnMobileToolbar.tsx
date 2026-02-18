'use client'

import { memo } from 'react'
import { m } from 'framer-motion'
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react'
import { hasBookmark, addBookmark, removeBookmark } from '@/lib/learn-bookmarks'
import { useTranslation } from '@/contexts/I18nContext'
import type { Chapter } from './LearnCourseContent.ts'

interface LearnMobileToolbarProps {
  chapters: Chapter[]
  activeChapterId: number | null
  courseId: string
  courseTitle: string
  total: number
  onNavigate: (chapterId: number) => void
}

/** 行動版底部快速操作列 - 從 LearnCourseContent 拆分 */
function LearnMobileToolbarComponent({
  chapters,
  activeChapterId,
  courseId,
  courseTitle,
  total,
  onNavigate,
}: LearnMobileToolbarProps) {
  const { t } = useTranslation()
  const ids = chapters.map((c) => c.id)
  const currentIdx = activeChapterId ? ids.indexOf(activeChapterId) : 0

  const handlePrev = () => {
    const prevIdx = Math.max(0, currentIdx - 1)
    onNavigate(ids[prevIdx])
  }

  const handleNext = () => {
    const nextIdx = Math.min(ids.length - 1, currentIdx + 1)
    onNavigate(ids[nextIdx])
  }

  const handleBookmark = () => {
    if (!activeChapterId) return
    const ch = chapters.find((c) => c.id === activeChapterId)
    if (!ch) return
    if (hasBookmark(courseId, ch.id)) {
      removeBookmark(courseId, ch.id)
    } else {
      addBookmark({ courseId, chapterId: ch.id, title: ch.title, courseTitle })
    }
  }

  const isBookmarked = activeChapterId ? hasBookmark(courseId, activeChapterId) : false

  return (
    <m.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a0a2e]/95 backdrop-blur-lg border-t border-white/10 safe-area-pb"
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* 上一章 */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={!activeChapterId || activeChapterId <= 1}
          className="p-3 rounded-xl bg-white/10 text-white/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/15 transition-colors"
          aria-label="上一章"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* 章節指示器 */}
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">
            {t('common.chapterProgress', { current: activeChapterId ?? 1, total })}
          </span>
          <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <m.div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
              style={{ width: `${((activeChapterId ?? 1) / total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* 書籤按鈕 */}
        <button
          type="button"
          onClick={handleBookmark}
          className="p-3 rounded-xl bg-white/10 text-white/80 hover:bg-white/15 transition-colors"
          aria-label={isBookmarked ? '移除書籤' : '加入書籤'}
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-primary-400" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>

        {/* 下一章 */}
        <button
          type="button"
          onClick={handleNext}
          disabled={!activeChapterId || activeChapterId >= total}
          className="p-3 rounded-xl bg-white/10 text-white/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/15 transition-colors"
          aria-label="下一章"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </m.div>
  )
}

export const LearnMobileToolbar = memo(LearnMobileToolbarComponent)
export default LearnMobileToolbar
