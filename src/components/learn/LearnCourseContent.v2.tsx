'use client'

/**
 * LearnCourseContent v2 - 重構版本
 * 使用子組件架構，提升可維護性和測試性
 * 
 * 主要改進：
 * 1. 將 1939 行的巨型組件拆分為 8 個獨立子組件
 * 2. 清晰的職責分離
 * 3. 更好的程式碼重用性
 * 4. 簡化的狀態管理
 */

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { m, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, Bookmark, BookmarkCheck, Share2, Award, Trophy, Clock, Pin, Sparkles, Link2 } from 'lucide-react'
import { recordStudyToday, addPoints, getStreak, addLearnMinutes, setCompletedChapterToday, addWeeklyChapterCount, incrementChaptersCompletedToday, unlockBadge, type BadgeId } from '@/lib/gamification'
import { useGameSound } from '@/hooks/useGameSound'
import { fireFullscreenConfetti } from '@/lib/celebration'
import { getNote } from '@/lib/learn-notes'
import { addBookmark, removeBookmark, hasBookmark, getBookmarkLimit } from '@/lib/learn-bookmarks'
import { KeywordSummary, extractKeywords } from '@/components/learn/KeywordSummary'
import { BadgeUnlockCelebration } from '@/components/profile/BadgeUnlockCelebration'
import toast from 'react-hot-toast'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useTranslation } from '@/contexts/I18nContext'
import { COPY_TOAST_PROGRESS_SAVED } from '@/config/copy.config'
import { CHAPTER_QUIZ_PASS_THRESHOLD } from '@/config/learn.config'

// 新建立的子組件
import { loadProgress, saveProgress, getQuizPassed, setQuizPassed, type ProgressEntry } from '@/lib/learn-progress.utils'
import { ChapterQuiz } from './ChapterQuiz'
import { ChapterContent } from './ChapterContent'
import { ChapterNotes } from './ChapterNotes'
import { CourseHeader } from './CourseHeader'
import { InteractiveLearningTools } from './InteractiveLearningTools'
import { CourseResources } from './CourseResources'
import { CourseCompletionSection } from './CourseCompletionSection'

// 型別定義
export interface ChapterQuizItem {
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

export interface Chapter {
  id: number
  title: string
  duration: string
  content: string
  videoUrl?: string | null
  imageUrl?: string | null
  imageAlt?: string | null
  quiz?: ChapterQuizItem[]
}

interface LearnCourseContentProps {
  courseId: string
  title: string
  description: string
  learningObjectives?: string[]
  duration: string
  free: boolean
  chapters: Chapter[]
}

/** v2 版本：使用子組件架構的課程內容組件 */
export function LearnCourseContent({
  courseId,
  title,
  description,
  learningObjectives,
  duration,
  free,
  chapters,
}: LearnCourseContentProps) {
  const { t } = useTranslation()
  const total = chapters.length
  const { play } = useGameSound()
  
  // 狀態管理
  const [focusMode, setFocusMode] = useState(false)
  const [progress, setProgress] = useState<Record<string, ProgressEntry>>({})
  const [currentChId, setCurrentChId] = useState<number | null>(null)
  const [quizCorrectCount, setQuizCorrectCount] = useState<Record<number, number>>({})
  const [notes, setNotes] = useState<Record<number, string>>({})
  
  // Toast 狀態
  const [completedToast, setCompletedToast] = useState(false)
  const [shareToast, setShareToast] = useState<number | null>(null)
  const [bookmarkAchievementToast, setBookmarkAchievementToast] = useState<string | null>(null)
  const [bookmarkLimitToast, setBookmarkLimitToast] = useState(false)
  const [showBadgeCelebration, setShowBadgeCelebration] = useState<BadgeId | null>(null)
  const [autoSaveIndicator, setAutoSaveIndicator] = useState<boolean>(false)
  const [summaryTooltip, setSummaryTooltip] = useState<{ chId: number; x: number; y: number } | null>(null)
  
  // Refs
  const chapterRefs = useRef<Map<number, HTMLElement>>(new Map())
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const mainRef = useRef<HTMLElement>(null)
  
  // 側邊導航追蹤
  const [activeChapterId, setActiveChapterId] = useState<number | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  // 初始化進度
  useEffect(() => {
    setProgress(loadProgress())
  }, [])

  // 初始化筆記
  useEffect(() => {
    const initial: Record<number, string> = {}
    chapters.forEach((ch) => {
      initial[ch.id] = getNote(courseId, ch.id)
    })
    setNotes(initial)
  }, [courseId, chapters])

  // 監聽 hash 變化
  useEffect(() => {
    const read = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      const m = hash.match(/^#ch-(\d+)$/)
      setCurrentChId(m ? parseInt(m[1], 10) : null)
    }
    read()
    window.addEventListener('hashchange', read)
    return () => window.removeEventListener('hashchange', read)
  }, [])

  // 捲動進度追蹤
  useEffect(() => {
    const handleScroll = () => {
      if (!mainRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const scrollableHeight = scrollHeight - clientHeight
      const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0
      setScrollProgress(Math.min(100, Math.max(0, progress)))

      // 計算當前可見章節
      let bestChapter: number | null = null
      let bestDistance = Infinity
      const viewportCenter = window.innerHeight / 3

      chapters.forEach((ch) => {
        const el = chapterRefs.current.get(ch.id)
        if (!el) return
        const rect = el.getBoundingClientRect()
        const distance = Math.abs(rect.top - viewportCenter)
        if (rect.top < window.innerHeight && rect.bottom > 0 && distance < bestDistance) {
          bestDistance = distance
          bestChapter = ch.id
        }
      })

      if (bestChapter !== null) {
        setActiveChapterId(bestChapter)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [chapters])

  // 鍵盤快捷鍵：J/K 上下章節
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
      const key = e.key
      if (key !== 'j' && key !== 'J' && key !== 'k' && key !== 'K' && key !== 'ArrowDown' && key !== 'ArrowUp') return
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return
      e.preventDefault()
      
      const ids = chapters.map((c) => c.id)
      if (ids.length === 0) return
      
      let bestIdx = 0
      let bestDist = Infinity
      ids.forEach((id, i) => {
        const el = chapterRefs.current.get(id)
        if (!el) return
        const top = el.getBoundingClientRect().top
        const dist = Math.abs(top - 80)
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = i
        }
      })
      
      const nextIdx = key === 'j' || key === 'J' || key === 'ArrowDown' 
        ? Math.min(bestIdx + 1, ids.length - 1) 
        : Math.max(bestIdx - 1, 0)
      chapterRefs.current.get(ids[nextIdx])?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [chapters])

  const current = progress[courseId]
  const completedCount = current ? Math.min(current.completed, total) : 0
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0

  // 完成章節處理
  const markChapterComplete = (chapterId: number) => {
    const nextCompleted = Math.max(completedCount, chapterId)
    const nextPct = total > 0 ? Math.round((nextCompleted / total) * 100) : 0
    const entry: ProgressEntry = { completed: nextCompleted, total }
    if (nextCompleted >= total) entry.completedAt = new Date().toISOString().slice(0, 10)
    const next = { ...progress, [courseId]: entry }

    setAutoSaveIndicator(true)
    setProgress(next)
    saveProgress(next)

    setTimeout(() => setAutoSaveIndicator(false), 1500)
    toast.success(COPY_TOAST_PROGRESS_SAVED, { duration: 2500 })

    if (nextCompleted >= total && total > 0) {
      if (unlockBadge('course-complete')) {
        setShowBadgeCelebration('course-complete')
      } else {
        toast.success(t('learn.achievementUnlock'), { duration: 3000 })
      }
    }

    const { unlockedBadge } = addLearnMinutes(5)
    if (unlockedBadge) {
      setShowBadgeCelebration(unlockedBadge)
    }

    const streakBefore = getStreak().days
    recordStudyToday()
    setCompletedChapterToday()
    incrementChaptersCompletedToday()
    addWeeklyChapterCount()
    const streakAfter = getStreak().days
    
    if (streakAfter > streakBefore && [3, 7, 14].includes(streakAfter)) {
      addPoints(5)
    }
    
    addPoints(10)
    play('win')
    
    if (nextPct === 50 || nextPct === 100) fireFullscreenConfetti()
    
    setCompletedToast(true)
    setTimeout(() => setCompletedToast(false), 3000)
  }

  // 章節摘要顯示
  const showChSummary = (ch: Chapter, clientX?: number, clientY?: number) => {
    const s = (ch.content || '').replace(/\s+/g, ' ').trim().slice(0, 100) + ((ch.content?.length ?? 0) > 100 ? '…' : '')
    setSummaryTooltip({ chId: ch.id, x: clientX ?? 0, y: (clientY ?? 0) - 60 })
    setTimeout(() => setSummaryTooltip(null), 3000)
  }

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  return (
    <>
      {/* 頂部固定閱讀進度條 */}
      <m.div
        className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <m.div
          className="h-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-400 shadow-lg shadow-primary-500/30"
          style={{ width: `${scrollProgress}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </m.div>

      <main 
        id="learn-main" 
        ref={mainRef} 
        className="min-h-screen px-2 sm:px-4 pt-0 pb-16 safe-area-px safe-area-pb" 
        tabIndex={-1} 
        role="main" 
        aria-label="課程內容"
      >
        {/* 二欄佈局：側邊導航 + 內容 */}
        <div className={`max-w-6xl mx-auto ${focusMode ? '' : 'lg:grid lg:grid-cols-[220px_1fr] lg:gap-8'}`}>
          
          {/* 章節側邊導航 - 僅桌面版顯示 */}
          <aside className={focusMode ? 'hidden' : 'hidden lg:block'}>
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
                      <a
                        href={`#ch-${ch.id}`}
                        onClick={(e) => {
                          e.preventDefault()
                          chapterRefs.current.get(ch.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }}
                        className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive
                            ? 'bg-primary-500/20 text-white border-l-2 border-primary-500 shadow-lg shadow-primary-500/10'
                            : 'text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                        }`}
                        aria-current={isActive ? 'location' : undefined}
                      >
                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-medium shrink-0 transition-all ${
                          isChCompleted
                            ? 'bg-primary-500 text-white'
                            : isActive
                            ? 'bg-white/20 text-white ring-2 ring-primary-500/50'
                            : 'bg-white/10 text-white/40 group-hover:bg-white/15'
                        }`}>
                          {isChCompleted ? <Check className="w-3 h-3" /> : ch.id}
                        </span>
                        <span className="truncate flex-1">{ch.title}</span>
                        <span className={`text-xs shrink-0 transition-opacity ${
                          isActive ? 'text-primary-300 opacity-100' : 'text-white/30 opacity-0 group-hover:opacity-100'
                        }`}>
                          {ch.duration}
                        </span>
                      </a>
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
          </aside>

          {/* 主內容區 */}
          <div className="max-w-3xl mx-auto lg:mx-0 lg:max-w-none">
            {/* 使用 CourseHeader 子組件 */}
            <CourseHeader
              courseId={courseId}
              title={title}
              description={description}
              learningObjectives={learningObjectives}
              duration={duration}
              free={free}
              totalChapters={total}
              completedCount={completedCount}
              progressPct={progressPct}
              focusMode={focusMode}
              onToggleFocusMode={() => setFocusMode((v) => !v)}
              autoSaveIndicator={autoSaveIndicator}
            />

            {/* 課程內目錄 */}
            <div className="mb-6 p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/60 text-xs font-medium mb-2">目錄</p>
              <nav
                className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                role="navigation"
                aria-label="本課程章節"
              >
                {chapters.map((ch) => {
                  const isCurrent = currentChId === ch.id
                  const isChCompleted = completedCount >= ch.id
                  return (
                    <a
                      key={ch.id}
                      href={`#ch-${ch.id}`}
                      className={`min-h-[48px] min-w-[48px] shrink-0 snap-start inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors games-focus-ring ${
                        isCurrent 
                          ? 'bg-primary-500/10 border-l-2 border-primary-500 text-white ring-2 ring-primary-500/30' 
                          : 'bg-white/5 hover:bg-white/10 text-white/70 border border-transparent'
                      }`}
                      aria-current={isCurrent ? 'location' : undefined}
                      aria-label={isChCompleted ? `${t('common.chapterLabel', { n: ch.id })}（已完成）` : t('common.chapterLabel', { n: ch.id })}
                    >
                      {isChCompleted && <Check className="w-4 h-4 text-primary-400 shrink-0" aria-hidden />}
                      {t('common.chapterLabel', { n: ch.id })}
                    </a>
                  )
                })}
              </nav>
            </div>

            {/* 章節列表 */}
            <div className="space-y-4">
              {chapters.map((ch, chIdx) => {
                const isCompleted = completedCount >= ch.id
                const prevCh = chIdx > 0 ? chapters[chIdx - 1] : null
                const nextCh = chIdx < chapters.length - 1 ? chapters[chIdx + 1] : null
                
                return (
                  <m.section
                    key={ch.id}
                    ref={(el) => { if (el) chapterRefs.current.set(ch.id, el) }}
                    id={`ch-${ch.id}`}
                    role="region"
                    aria-label={`${t('common.chapterLabel', { n: ch.id })}：${ch.title}`}
                    tabIndex={0}
                    onContextMenu={(e) => { e.preventDefault(); showChSummary(ch, e.clientX, e.clientY) }}
                    onTouchStart={() => { longPressTimer.current = setTimeout(() => showChSummary(ch), 600) }}
                    onTouchEnd={clearLongPress}
                    onTouchCancel={clearLongPress}
                    className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-6 focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a] focus:outline-none"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{
                      duration: 0.5,
                      delay: chIdx * 0.08,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    {/* 章節標題 */}
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <h2 className="text-lg md:text-xl font-semibold text-white leading-snug games-heading">
                        {t('common.chapterLabel', { n: ch.id })}：{ch.title}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-white/40 text-sm">{ch.duration}</span>
                        
                        {/* 分享本章 */}
                        <button
                          type="button"
                          onClick={() => {
                            const url = typeof window !== 'undefined' ? `${window.location.origin}/learn/${courseId}#ch-${ch.id}` : ''
                            navigator.clipboard?.writeText(url).then(() => {
                              setShareToast(ch.id)
                              setTimeout(() => setShareToast(null), 2000)
                            }).catch(() => {})
                          }}
                          className="min-h-[48px] min-w-[48px] p-2 rounded-lg text-white/60 hover:text-primary-400 hover:bg-white/10 games-focus-ring"
                          aria-label="複製本章連結"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                        
                        {/* 書籤 */}
                        <button
                          type="button"
                          onClick={() => {
                            if (hasBookmark(courseId, ch.id)) {
                              removeBookmark(courseId, ch.id)
                            } else {
                              const { ok, atLimit } = addBookmark({ 
                                courseId, 
                                chapterId: ch.id, 
                                title: ch.title, 
                                courseTitle: title 
                              })
                              if (!ok && atLimit) {
                                setBookmarkLimitToast(true)
                                setTimeout(() => setBookmarkLimitToast(false), 2500)
                              }
                            }
                          }}
                          className="min-h-[48px] min-w-[48px] p-2 rounded-lg text-white/60 hover:text-primary-400 hover:bg-white/10 games-focus-ring"
                          aria-label={hasBookmark(courseId, ch.id) ? '移除書籤' : '加入書籤'}
                        >
                          {hasBookmark(courseId, ch.id) ? (
                            <BookmarkCheck className="w-5 h-5 fill-current" />
                          ) : (
                            <Bookmark className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 使用 ChapterContent 子組件 */}
                    <ChapterContent
                      title={ch.title}
                      content={ch.content}
                      videoUrl={ch.videoUrl}
                      imageUrl={ch.imageUrl}
                      imageAlt={ch.imageAlt}
                    />

                    {/* 使用 ChapterNotes 子組件 */}
                    <ChapterNotes
                      courseId={courseId}
                      courseTitle={title}
                      chapterId={ch.id}
                      value={notes[ch.id] || ''}
                      onChange={(text) => setNotes((prev) => ({ ...prev, [ch.id]: text }))}
                      allChapters={chapters.map((c) => ({ id: c.id, title: c.title }))}
                    />

                    {/* 關鍵詞摘要 */}
                    <KeywordSummary
                      keywords={extractKeywords(ch.content || '')}
                      chapterTitle={ch.title}
                      className="mb-4"
                    />

                    {/* 使用 ChapterQuiz 子組件 */}
                    {ch.quiz && ch.quiz.length > 0 && (
                      <ChapterQuiz
                        courseId={courseId}
                        courseTitle={title}
                        chapterId={ch.id}
                        chapterTitle={ch.title}
                        quiz={ch.quiz}
                        onQuizStateChange={(state) => {
                          if (state.passed) {
                            setQuizCorrectCount((prev) => ({ ...prev, [ch.id]: state.correctCount }))
                          }
                        }}
                      />
                    )}

                    {/* 完成本章按鈕 */}
                    {(() => {
                      const chapterHasQuiz = (ch.quiz?.length ?? 0) > 0
                      const chapterQuizPassed = chapterHasQuiz ? getQuizPassed(courseId, ch.id) : true
                      const allowComplete = !chapterHasQuiz || chapterQuizPassed
                      
                      return (
                        <m.button
                          type="button"
                          disabled={!allowComplete}
                          title={!allowComplete ? '請先通過本章測驗（80% 正確）' : undefined}
                          onClick={() => markChapterComplete(ch.id)}
                          className={`mt-4 min-h-[48px] min-w-[48px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all games-focus-ring ${
                            isCompleted
                              ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                              : !allowComplete
                              ? 'bg-white/5 text-white/40 border border-white/10 cursor-not-allowed'
                              : 'bg-white/10 text-white/80 hover:bg-white/15 border border-white/10 hover:shadow-lg'
                          }`}
                          whileHover={!isCompleted && allowComplete ? { scale: 1.05, y: -2 } : {}}
                          whileTap={!isCompleted && allowComplete ? { scale: 0.95 } : {}}
                          animate={isCompleted ? { scale: [1, 1.1, 1] } : {}}
                        >
                          {isCompleted ? (
                            <>
                              <Check className="w-5 h-5" />
                              <span>已完成</span>
                            </>
                          ) : (
                            '完成本章'
                          )}
                        </m.button>
                      )
                    })()}

                    {/* 上一章 / 下一章 */}
                    <div className="mt-6 flex items-center justify-between gap-2 flex-wrap">
                      {prevCh ? (
                        <a
                          href={`#ch-${prevCh.id}`}
                          className="min-h-[48px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          上一章：{prevCh.title}
                        </a>
                      ) : <span />}
                      
                      {nextCh ? (
                        <a
                          href={`#ch-${nextCh.id}`}
                          className="min-h-[48px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm ml-auto"
                        >
                          下一章：{nextCh.title}
                          <ChevronRight className="w-4 h-4" />
                        </a>
                      ) : <span />}
                    </div>
                  </m.section>
                )
              })}
            </div>

            {/* 使用 InteractiveLearningTools 子組件 */}
            <InteractiveLearningTools courseId={courseId} />

            {/* 使用 CourseResources 子組件 */}
            <CourseResources courseId={courseId} />

            {/* 使用 CourseCompletionSection 子組件 */}
            <CourseCompletionSection
              courseId={courseId}
              courseTitle={title}
              totalChapters={total}
              progressPct={progressPct}
              progress={progress}
              currentProgress={current}
            />

            {/* 返回按鈕 */}
            <div className="mt-8 flex justify-between">
              <Link
                href="/learn"
                className="min-h-[48px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                返回學院
              </Link>
              <Link
                href="/quiz"
                className="min-h-[48px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm"
              >
                測驗靈魂酒款
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Toast 通知 */}
            {completedToast && (
              <m.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl bg-gradient-to-r from-primary-500/95 to-secondary-500/95 text-white text-sm font-medium shadow-2xl"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  +10 積分 · 繼續加油！
                </div>
              </m.div>
            )}

            {shareToast !== null && (
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl bg-white/95 backdrop-blur-sm text-dark-950 text-sm font-medium shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  {shareToast === -1 ? '已複製課程連結' : '已複製本章連結'}
                </div>
              </m.div>
            )}

            {bookmarkLimitToast && (
              <m.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl bg-amber-500/95 text-white text-sm font-medium shadow-2xl"
              >
                <div className="flex items-center gap-2">
                  <Pin className="w-4 h-4" />
                  書籤已達上限（{getBookmarkLimit()} 個）
                </div>
              </m.div>
            )}

            {/* 成就解鎖彈窗 */}
            <AnimatePresence>
              {showBadgeCelebration && (
                <BadgeUnlockCelebration
                  key={showBadgeCelebration}
                  badgeId={showBadgeCelebration}
                  onComplete={() => setShowBadgeCelebration(null)}
                  prefersReducedMotion={!!reducedMotion}
                />
              )}
            </AnimatePresence>

            {/* 章節摘要 tooltip */}
            {summaryTooltip && (() => {
              const ch = chapters.find((c) => c.id === summaryTooltip.chId)
              if (!ch) return null
              const s = (ch.content || '').replace(/\s+/g, ' ').trim().slice(0, 100) + ((ch.content?.length ?? 0) > 100 ? '…' : '')
              const isCenter = summaryTooltip.x === 0 && summaryTooltip.y === 0
              return (
                <div
                  className={`fixed z-50 max-w-sm px-4 py-3 rounded-xl bg-dark-900/95 border border-white/20 text-white text-sm shadow-xl ${
                    isCenter ? 'bottom-24 left-1/2 -translate-x-1/2' : ''
                  }`}
                  style={!isCenter ? { 
                    left: Math.min(summaryTooltip.x, window.innerWidth - 320), 
                    top: Math.max(80, summaryTooltip.y) 
                  } : undefined}
                >
                  <p className="font-medium text-primary-300 mb-1">
                    {t('common.chapterLabel', { n: ch.id })}：{ch.title}
                  </p>
                  <p className="text-white/80 text-xs">{s || '（無摘要）'}</p>
                </div>
              )
            })()}
          </div>
        </div>

        {/* 行動版底部快速操作列 */}
        <m.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a0a2e]/95 backdrop-blur-lg border-t border-white/10 safe-area-pb"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={() => {
                const ids = chapters.map(c => c.id)
                const currentIdx = activeChapterId ? ids.indexOf(activeChapterId) : 0
                const prevIdx = Math.max(0, currentIdx - 1)
                chapterRefs.current.get(ids[prevIdx])?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              disabled={!activeChapterId || activeChapterId <= 1}
              className="p-3 rounded-xl bg-white/10 text-white/80 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">
                {t('common.chapterProgress', { current: activeChapterId ?? 1, total })}
              </span>
              <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <m.div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                  style={{ width: `${((activeChapterId ?? 1) / total) * 100}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const ids = chapters.map(c => c.id)
                const currentIdx = activeChapterId ? ids.indexOf(activeChapterId) : 0
                const nextIdx = Math.min(ids.length - 1, currentIdx + 1)
                chapterRefs.current.get(ids[nextIdx])?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              disabled={!activeChapterId || activeChapterId >= total}
              className="p-3 rounded-xl bg-white/10 text-white/80 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </m.div>
      </main>
    </>
  )
}
