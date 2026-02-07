'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { ClickableImage } from '@/components/ui/ImageLightbox'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, HelpCircle, Bookmark, BookmarkCheck, Printer, Share2, Award, Trophy, Clock, Link2, Pin, Sparkles, Focus, ChevronDown, ChevronUp } from 'lucide-react'
import { recordStudyToday, addPoints, getStreak, addLearnMinutes, getLearnMinutes, setCompletedChapterToday, addWeeklyChapterCount, incrementChaptersCompletedToday } from '@/lib/gamification'
import { useGameSound } from '@/hooks/useGameSound'
import { fireFullscreenConfetti } from '@/lib/celebration'
import { getNote, setNote } from '@/lib/learn-notes'
import { addBookmark, removeBookmark, hasBookmark, getBookmarks, getBookmarkLimit } from '@/lib/learn-bookmarks'
import { parseContentWithTerms, ParsedTerm } from '@/lib/learn-terms'
import { PronunciationButton } from '@/components/ui/PronunciationButton'
import { addWrongAnswer } from '@/lib/wrong-answers'
import { unlockBadge } from '@/lib/gamification'
import VideoPlayer from '@/components/learn/VideoPlayer'
import { ShareToStory } from '@/components/learn/ShareToStory'
import { CertificateShare } from '@/components/learn/CertificateShare'
import { KeywordSummary, extractKeywords } from '@/components/learn/KeywordSummary'
import { ExamPointsReference } from '@/components/learn/ExamPointsReference'
import { FontSizeControl } from '@/components/ui/FontSizeControl'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { WineGlossary } from '@/components/learn/WineGlossary'
import { WineExamples } from '@/components/learn/WineExamples'
import { InteractiveRegionMap } from '@/components/learn/InteractiveRegionMap'
import { WineRecommendationDatabase } from '@/components/learn/WineRecommendationDatabase'
import { SeasonalWineGuide } from '@/components/learn/SeasonalWineGuide'
import { WhiskyGlossary } from '@/components/learn/WhiskyGlossary'
import { InteractiveWhiskyMap } from '@/components/learn/InteractiveWhiskyMap'
import { WhiskyRecommendationDatabase } from '@/components/learn/WhiskyRecommendationDatabase'
import { SeasonalWhiskyGuide } from '@/components/learn/SeasonalWhiskyGuide'
import { WhiskyExamples } from '@/components/learn/WhiskyExamples'
import { BeerCiderGlossary } from '@/components/learn/BeerCiderGlossary'
import { InteractiveBeerCiderMap } from '@/components/learn/InteractiveBeerCiderMap'
import { BeerCiderRecommendationDatabase } from '@/components/learn/BeerCiderRecommendationDatabase'
import { SeasonalBeerCiderGuide } from '@/components/learn/SeasonalBeerCiderGuide'
import { BeerCiderExamples } from '@/components/learn/BeerCiderExamples'
import { CocktailGlossary } from '@/components/learn/CocktailGlossary'
import { CocktailExamples } from '@/components/learn/CocktailExamples'
import { InteractiveCocktailMap } from '@/components/learn/InteractiveCocktailMap'
import { CocktailRecommendationDatabase } from '@/components/learn/CocktailRecommendationDatabase'
import { SeasonalCocktailGuide } from '@/components/learn/SeasonalCocktailGuide'
import toast from 'react-hot-toast'
import { COPY_TOAST_PROGRESS_SAVED } from '@/config/copy.config'
import { getReadingListForCourse } from '@/config/learn-reading-list'
import { getCommonMistakes } from '@/config/learn-common-mistakes'
import { getReferencesForCourse } from '@/config/learn-references'

const PROGRESS_KEY = 'cheersin_learn_progress'

/** Phase 2 B2.1: 智慧推薦下一堂課程 - 課程關聯地圖 */
const NEXT_COURSE_MAP: Record<string, { id: string; title: string; reason: string }[]> = {
  'wine-basics': [
    { id: 'white-wine', title: '白酒探索', reason: '深入認識白酒的品種與產區' },
    { id: 'wine-advanced', title: '葡萄酒進階', reason: '延伸學習，提升專業知識' },
    { id: 'tasting-notes', title: '品飲筆記與盲飲', reason: '實際應用品酒技巧' },
  ],
  'white-wine': [
    { id: 'champagne-sparkling', title: '氣泡酒與香檳', reason: '探索另一類白酒' },
    { id: 'wine-pairing', title: '餐酒搭配進階', reason: '學會將白酒與食物搭配' },
  ],
  'whisky-101': [
    { id: 'whisky-single-malt', title: '單一麥芽威士忌', reason: '深入探索威士忌世界' },
    { id: 'brandy-cognac', title: '白蘭地與干邑', reason: '認識另一類烈酒' },
  ],
  'sake-intro': [
    { id: 'sake-advanced', title: '清酒進階', reason: '深入學習清酒釀造與品飲' },
  ],
  'cocktail-basics': [
    { id: 'cocktail-classics', title: '經典調酒實作', reason: '學會更多經典配方' },
    { id: 'home-bar', title: '居家酒吧入門', reason: '在家打造調酒空間' },
  ],
  'wine-advanced': [
    { id: 'wset-l2-wines', title: 'WSET L2 葡萄酒產區', reason: '獲取国際認證' },
    { id: 'bordeaux-deep', title: '產區深度：波爾多', reason: '探索頂級產區' },
  ],
  // 默認推薦（無專屬映射時）
  '_default': [
    { id: 'wine-basics', title: '葡萄酒入門', reason: '基礎課程，適合所有人' },
    { id: 'cocktail-basics', title: '調酒基礎', reason: '學習調酒技巧' },
  ],
}

/** 158 章節測驗題（與 data/courses JSON 一致） */
/** Phase 2 C1.1: 新增 explanation 欄位支援測驗解析 */
export interface ChapterQuizItem {
  question: string
  options: string[]
  correctIndex: number
  /** Phase 2 C1.1: 答題後顯示的詳細解釋 */
  explanation?: string
}

export interface Chapter {
  id: number
  title: string
  duration: string
  content: string
  /** 156 可選影片 URL（mp4 或 YouTube） */
  videoUrl?: string | null
  /** 31-40 可選章節圖片（產區地圖、酒標等） */
  imageUrl?: string | null
  /** 圖片替代文字（無障礙） */
  imageAlt?: string | null
  quiz?: ChapterQuizItem[]
}

interface LearnCourseContentProps {
  courseId: string
  title: string
  description: string
  duration: string
  free: boolean
  chapters: Chapter[]
}

type ProgressEntry = { completed: number; total: number; completedAt?: string }

function loadProgress(): Record<string, ProgressEntry> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (typeof parsed !== 'object' || parsed === null) return {}
    const out: Record<string, ProgressEntry> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (v && typeof v === 'object' && 'completed' in v && 'total' in v) {
        out[k] = { completed: Number((v as ProgressEntry).completed), total: Number((v as ProgressEntry).total) }
        if (typeof (v as ProgressEntry).completedAt === 'string') out[k].completedAt = (v as ProgressEntry).completedAt
      }
    }
    return out
  } catch {
    return {}
  }
}

function saveProgress(progress: Record<string, ProgressEntry>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  } catch {
    /* ignore */
  }
}

/** 課程內頁：章節列表 + 完成本章寫入 cheersin_learn_progress；176-178 字體階層、行高、段落間距 */
export function LearnCourseContent({
  courseId,
  title,
  description,
  duration,
  free,
  chapters,
}: LearnCourseContentProps) {
  const total = chapters.length
  const { play } = useGameSound()
  /** P2.D4.3 專注閱讀模式：隱藏側邊欄 */
  const [focusMode, setFocusMode] = useState(false)
  /** P2.D2.2 摺疊/展開控制：延伸閱讀區塊 */
  const [readingListOpen, setReadingListOpen] = useState(true)
  const [progress, setProgress] = useState<Record<string, ProgressEntry>>({})
  /** AUDIT #25：當前章節 aria-current，依 hash 同步 */
  const [currentChId, setCurrentChId] = useState<number | null>(null)

  useEffect(() => {
    setProgress(loadProgress())
  }, [])

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

  const current = progress[courseId]
  const completedCount = current ? Math.min(current.completed, total) : 0
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0

  /** 158 章節測驗；1 選項隨機；42 答錯視覺；shuffledMap 以題目索引區分 */
  const [quizState, setQuizState] = useState<Record<number, { step: number; showCorrect: boolean; wrongIdx?: number; shuffledMap?: Record<number, number[]> }>>({})
  /** 160 筆記：key = chapterId，初始從 localStorage 讀取 */
  const [notes, setNotes] = useState<Record<number, string>>({})

  useEffect(() => {
    const initial: Record<number, string> = {}
    chapters.forEach((ch) => {
      initial[ch.id] = getNote(courseId, ch.id)
    })
    setNotes(initial)
  }, [courseId, chapters])

  const setChapterNote = (chapterId: number, text: string) => {
    // Phase 1 D3.4: 顯示筆記保存指示器
    setNoteSaveIndicator(prev => ({ ...prev, [chapterId]: true }))
    
    setNote(courseId, chapterId, text)
    setNotes((prev) => ({ ...prev, [chapterId]: text }))
    
    // 保存完成後隱藏指示器
    setTimeout(() => {
      setNoteSaveIndicator(prev => ({ ...prev, [chapterId]: false }))
    }, 1000)
  }

  /** 161 完成本章成就提示；52 里程碑慶祝動畫；40 分享本章 toast；54 書籤數量成就 */
  const [completedToast, setCompletedToast] = useState(false)
  const [shareToast, setShareToast] = useState<number | null>(null)
  const [bookmarkAchievementToast, setBookmarkAchievementToast] = useState<string | null>(null)
  const [bookmarkLimitToast, setBookmarkLimitToast] = useState(false)
  const [learnAchievementToast, setLearnAchievementToast] = useState<string | null>(null)
  const [summaryTooltip, setSummaryTooltip] = useState<{ chId: number; x: number; y: number } | null>(null)
  
  /** Phase 1 D3.2: 閱讀進度自動保存提示狀態 */
  const [autoSaveIndicator, setAutoSaveIndicator] = useState<boolean>(false)
  /** Phase 1 D3.4: 筆記自動保存指示器狀態 */
  const [noteSaveIndicator, setNoteSaveIndicator] = useState<{ [chapterId: number]: boolean }>({})
  const chapterRefs = useRef<Map<number, HTMLElement>>(new Map())
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Phase 1 D1.3: 章節完成動畫 - Check mark + 成就提示 */
  /** Phase 1 D3.2: 閱讀進度自動保存提示 - 保存時顯示指示器 */
  const markChapterComplete = (chapterId: number) => {
    const nextCompleted = Math.max(completedCount, chapterId)
    const nextPct = total > 0 ? Math.round((nextCompleted / total) * 100) : 0
    const entry: ProgressEntry = { completed: nextCompleted, total }
    if (nextCompleted >= total) entry.completedAt = new Date().toISOString().slice(0, 10)
    const next = { ...progress, [courseId]: entry }
    
    // Phase 1 D3.2: 顯示自動保存指示器
    setAutoSaveIndicator(true)
    setProgress(next)
    saveProgress(next)
    
    // 保存完成後隱藏指示器
    setTimeout(() => setAutoSaveIndicator(false), 1500)
    
    /* 任務 89：進度儲存成功後輕量 Toast，僅在切換章節/完成時顯示一次 */
    toast.success(COPY_TOAST_PROGRESS_SAVED, { duration: 2500 })
    /* L73：課程完成率 100% 時解鎖徽章；P2.B3.2 技能解鎖動畫 */
    if (nextCompleted >= total && total > 0) {
      unlockBadge('course-complete')
      toast.success('解鎖成就：完成一門課程', { duration: 3000 })
    }
    const prevMin = getLearnMinutes()
    addLearnMinutes(5)
    const nextMin = getLearnMinutes()
    if (nextMin >= 300 && prevMin < 300) {
      setLearnAchievementToast('trophy:學習 5 小時！成就解鎖')
      setTimeout(() => setLearnAchievementToast(null), 3000)
    } else if (nextMin >= 120 && prevMin < 120) {
      setLearnAchievementToast('award:學習 2 小時！成就解鎖')
      setTimeout(() => setLearnAchievementToast(null), 3000)
    } else if (nextMin >= 60 && prevMin < 60) {
      setLearnAchievementToast('clock:學習 60 分鐘！成就解鎖')
      setTimeout(() => setLearnAchievementToast(null), 3000)
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

  /** 34 下一章/上一章快捷：J/↓=下一章、K/↑=上一章 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
      const key = e.key
      if (key !== 'j' && key !== 'J' && key !== 'k' && key !== 'K' && key !== 'ArrowDown' && key !== 'ArrowUp') return
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return
      e.preventDefault()
      const ids = chapters.map((c) => c.id)
      if (ids.length === 0) return
      const vh = typeof window !== 'undefined' ? window.innerHeight : 600
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
      const nextIdx = key === 'j' || key === 'J' || key === 'ArrowDown' ? Math.min(bestIdx + 1, ids.length - 1) : Math.max(bestIdx - 1, 0)
      chapterRefs.current.get(ids[nextIdx])?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [chapters])

  /** Phase 1 D3.1: 頂部固定閱讀進度條 - 捲動位置追蹤 */
  const [scrollProgress, setScrollProgress] = useState(0)
  const mainRef = useRef<HTMLElement>(null)
  /** Phase 2 D1.2: 側邊導航 - 追蹤當前可見章節 */
  const [activeChapterId, setActiveChapterId] = useState<number | null>(null)
  
  useEffect(() => {
    const handleScroll = () => {
      if (!mainRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const scrollableHeight = scrollHeight - clientHeight
      const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0
      setScrollProgress(Math.min(100, Math.max(0, progress)))
      
      // Phase 2 D1.2: 計算當前可見章節
      let bestChapter: number | null = null
      let bestDistance = Infinity
      const viewportCenter = window.innerHeight / 3 // 上方 1/3 處作為焦點
      
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
    handleScroll() // Initial call
    return () => window.removeEventListener('scroll', handleScroll)
  }, [chapters])

  return (
    <>
      {/* Phase 1 D3.1: 頂部固定閱讀進度條 */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-400 shadow-lg shadow-primary-500/30"
          style={{ width: `${scrollProgress}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </motion.div>
      
    <main id="learn-main" ref={mainRef} className="min-h-screen px-2 sm:px-4 pt-0 pb-16 safe-area-px safe-area-pb" tabIndex={-1} role="main" aria-label="課程內容">
      {/* Phase 2 D1.2: 二欄佈局 - 桌面版側邊導航 + 內容；P2.D4.3 專注閱讀可隱藏側邊 */}
      <div className={`max-w-6xl mx-auto ${focusMode ? '' : 'lg:grid lg:grid-cols-[220px_1fr] lg:gap-8'}`}>
        {/* Phase 2 D1.2: 章節側邊導航 - 僅桌面版顯示；專注模式時隱藏 */}
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
                      {/* 進度指示器 */}
                      <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-medium shrink-0 transition-all ${
                        isChCompleted 
                          ? 'bg-primary-500 text-white' 
                          : isActive 
                            ? 'bg-white/20 text-white ring-2 ring-primary-500/50' 
                            : 'bg-white/10 text-white/40 group-hover:bg-white/15'
                      }`}>
                        {isChCompleted ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          ch.id
                        )}
                      </span>
                      {/* 章節標題 */}
                      <span className="truncate flex-1">{ch.title}</span>
                      {/* 時長 */}
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
                <motion.div 
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
        {/* UX_LAYOUT_200 #52：麵包屑結構化與連結 */}
        <Breadcrumb items={[{ href: '/', label: '首頁' }, { href: '/learn', label: '品酒學院' }, { label: title }]} className="mb-4" />
        {/* L60：返回學院連結 */}
        <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
          <Link
            href="/learn"
            className="min-h-[48px] min-w-[48px] inline-flex items-center gap-1 text-white/60 hover:text-white games-focus-ring rounded"
          >
            <ChevronLeft className="w-5 h-5" />
            返回學院
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const url = typeof window !== 'undefined' ? `${window.location.origin}/learn/${courseId}` : ''
                navigator.clipboard?.writeText(url).then(() => toast.success('已複製課程連結，可分享給好友'))
              }}
              className="min-h-[48px] px-3 inline-flex items-center gap-2 rounded-lg text-sm games-focus-ring bg-white/5 text-white/60 hover:text-white"
              title="推薦課程給好友"
            >
              <Share2 className="w-4 h-4" />
              推薦給好友
            </button>
            <button
              type="button"
              onClick={() => setFocusMode((v) => !v)}
              className={`min-h-[48px] px-3 inline-flex items-center gap-2 rounded-lg text-sm games-focus-ring ${focusMode ? 'bg-primary-500/30 text-primary-300' : 'bg-white/5 text-white/60 hover:text-white'}`}
              title={focusMode ? '顯示章節導航' : '專注閱讀（隱藏側邊）'}
              aria-pressed={focusMode}
            >
              <Focus className="w-4 h-4" />
              {focusMode ? '顯示導航' : '專注閱讀'}
            </button>
          </div>
        </div>

        {/* 39 課程內目錄錨點；Acad-09/680 目錄 RWD、48px、當前章節高亮、進度勾選 */}
        <div className="mb-6 p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/60 text-xs font-medium mb-2">目錄</p>
          {/* AUDIT #24 #25：章節列表 role="navigation"、aria-label 本課程章節；當前章節 aria-current 由 hash 決定 */}
          {/* Phase 1 B4.4: scroll-snap 橫向導航（行動端優化） */}
          <nav 
            className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent" 
            role="navigation" 
            aria-label="本課程章節"
            style={{ scrollbarWidth: 'thin' }}
          >
            {chapters.map((ch) => {
              const isCurrent = currentChId === ch.id
              const isChCompleted = completedCount >= ch.id
              return (
                <a
                  key={ch.id}
                  href={`#ch-${ch.id}`}
                  className={`min-h-[48px] min-w-[48px] shrink-0 snap-start inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors games-focus-ring ${
                    isCurrent ? 'bg-primary-500/10 border-l-2 border-primary-500 text-white ring-2 ring-primary-500/30' : 'bg-white/5 hover:bg-white/10 text-white/70 border border-transparent border-l-2 border-l-transparent'
                  }`}
                  aria-current={isCurrent ? 'location' : undefined}
                  aria-label={isChCompleted ? `第${ch.id}章（已完成）` : `第${ch.id}章`}
                >
                  {isChCompleted && <Check className="w-4 h-4 text-primary-400 shrink-0" aria-hidden />}
                  第{ch.id}章
                </a>
              )
            })}
          </nav>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white mb-2 leading-tight games-heading">{title}</h1>
              <p className="text-white/60 text-sm md:text-base mb-1 leading-relaxed games-body max-w-2xl">{description}</p>
              <p className="text-white/40 text-xs">快捷鍵：J / ↓ 下一章 · K / ↑ 上一章</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Phase 2 D4.2: 字體大小調整控制項 */}
              <FontSizeControl className="mr-2" />
              {/* Phase 1 D3.2: 閱讀進度自動保存指示器 */}
              <AnimatePresence>
                {autoSaveIndicator && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-sm font-medium"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-20" />
                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </motion.div>
                    自動保存中...
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* L72：分享課程連結 */}
              <button
                type="button"
                onClick={() => {
                  const url = typeof window !== 'undefined' ? `${window.location.origin}/learn/${courseId}` : ''
                  navigator.clipboard?.writeText(url).then(() => {
                    setShareToast(-1)
                    setTimeout(() => setShareToast(null), 2000)
                  }).catch(() => {})
                }}
                className="min-h-[48px] min-w-[48px] p-2 rounded-xl text-white/60 hover:text-primary-400 hover:bg-white/10 games-focus-ring"
                aria-label="複製課程連結"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="min-h-[48px] min-w-[48px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm print:hidden games-focus-ring"
                aria-label="列印課程內容"
              >
                <Printer className="w-4 h-4" />
                列印
              </button>
            </div>
          </div>
          <p className="text-white/40 text-sm mt-2">
            {chapters.length} 章 · {duration}
            {!free && <span className="ml-2 text-primary-400">Pro</span>}
          </p>
          {/* 153 課程進度百分比；98 aria-live 進度更新 */}
          {progressPct > 0 && (
            <div className="mt-3 flex items-center gap-2 min-w-0" aria-live="polite" aria-atomic="true" aria-label={`已完成 ${progressPct}%`}>
              <div className="flex-1 min-w-0 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-500 progress-bar-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-sm text-primary-400 font-medium tabular-nums shrink-0">已完成 {progressPct}%</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {chapters.map((ch, chIdx) => {
            const isCompleted = completedCount >= ch.id
            const prevCh = chIdx > 0 ? chapters[chIdx - 1] : null
            const nextCh = chIdx < chapters.length - 1 ? chapters[chIdx + 1] : null
            const summary = (ch.content || '').replace(/\s+/g, ' ').trim().slice(0, 80) + ((ch.content?.length ?? 0) > 80 ? '…' : '')
            const showChSummary = (clientX?: number, clientY?: number) => {
              setSummaryTooltip({ chId: ch.id, x: clientX ?? 0, y: (clientY ?? 0) - 60 })
              setTimeout(() => setSummaryTooltip(null), 3000)
            }
            const clearLongPress = () => {
              if (longPressTimer.current) {
                clearTimeout(longPressTimer.current)
                longPressTimer.current = null
              }
            }
            /* Phase 1 D2.1: 課程章節動畫比例感 - whileInView 入場動畫 */
            return (
              <motion.section
                key={ch.id}
                ref={(el) => { if (el) chapterRefs.current.set(ch.id, el) }}
                id={`ch-${ch.id}`}
                role="region"
                aria-label={`第 ${ch.id} 章：${ch.title}`}
                tabIndex={0}
                onContextMenu={(e) => { e.preventDefault(); showChSummary(e.clientX, e.clientY) }}
                onTouchStart={() => { longPressTimer.current = setTimeout(() => showChSummary(), 600) }}
                onTouchEnd={clearLongPress}
                onTouchCancel={clearLongPress}
                className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-6 focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a] focus:outline-none border-b-white/5"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ 
                  duration: 0.5, 
                  delay: chIdx * 0.08,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h2 className="text-lg md:text-xl font-semibold text-white leading-snug games-heading" id={`ch-${ch.id}-title`}>
                    第 {ch.id} 章：{ch.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-sm">{ch.duration}</span>
                    {/* 40 分享本章：複製連結 */}
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
                    {/* 160 書籤：加入/移除 */}
                    <button
                      type="button"
                      onClick={() => {
                        if (hasBookmark(courseId, ch.id)) {
                          removeBookmark(courseId, ch.id)
                        } else {
                          const { ok, atLimit } = addBookmark({ courseId, chapterId: ch.id, title: ch.title, courseTitle: title })
                          if (!ok) {
                            if (atLimit) {
                              setBookmarkLimitToast(true)
                              setTimeout(() => setBookmarkLimitToast(false), 2500)
                            }
                            return
                          }
                          const count = getBookmarks().length
                          if (count >= 10) {
                            unlockBadge('bookmark-10')
                            setBookmarkAchievementToast('書籤達 10 個！成就解鎖')
                            setTimeout(() => setBookmarkAchievementToast(null), 2500)
                          } else if (count >= 5) {
                            unlockBadge('bookmark-5')
                            setBookmarkAchievementToast('書籤達 5 個！成就解鎖')
                            setTimeout(() => setBookmarkAchievementToast(null), 2500)
                          }
                          if (atLimit) {
                            setBookmarkLimitToast(true)
                            setTimeout(() => setBookmarkLimitToast(false), 2500)
                          }
                        }
                      }}
                      className="min-h-[48px] min-w-[48px] p-2 rounded-lg text-white/60 hover:text-primary-400 hover:bg-white/10 games-focus-ring"
                      aria-label={hasBookmark(courseId, ch.id) ? '移除書籤' : '加入書籤'}
                    >
                      {hasBookmark(courseId, ch.id) ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {/* 156 影片播放器（有 videoUrl 時顯示） */}
                {ch.videoUrl && (
                  <div className="mb-4">
                    <VideoPlayer src={ch.videoUrl} title={ch.title} />
                  </div>
                )}
                {/* 31-40 章節圖片（產區地圖、酒標等） */}
                {/* Phase 1 E1.1: 圖片懶載及 blur placeholder */}
                {/* Phase 2 D2.3: 點擊放大燈箱功能 */}
                {ch.imageUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-white/10 bg-white/5 aspect-[4/3] max-h-[300px] relative">
                    <ClickableImage
                      src={ch.imageUrl}
                      alt={ch.imageAlt || `${ch.title} 示意圖`}
                      width={640}
                      height={480}
                      className="w-full h-full"
                    />
                  </div>
                )}
                {/* Phase 1 D3.1: 術語 tooltip 加強 - hover 效果優化 */}
                {/* Phase 2 F2.1: 法語/義大利語術語發音按鈕整合 */}
                <div className="mb-4 space-y-4">
                  {(() => {
                    const parts = (ch.content || '').split(/\n\n+/).filter(Boolean)
                    const paras = parts.length > 0 ? parts : [(ch.content || '')]
                    return paras.map((para, pi) => (
                      <p key={pi} className="text-white/80 text-sm md:text-base leading-loose whitespace-pre-line games-body max-w-full">
                        {parseContentWithTerms(para).map((node, ni) =>
                          typeof node === 'string' ? (
                            node
                          ) : (
                            <span
                              key={`${pi}-${ni}`}
                              className="inline-flex items-center gap-0.5"
                            >
                              <span
                                title={(node as ParsedTerm).en}
                                className="underline decoration-dotted decoration-primary-500/60 cursor-help hover:decoration-primary-400 hover:text-primary-300 transition-colors duration-200 hover:decoration-2"
                              >
                                {(node as ParsedTerm).term}
                              </span>
                              {/* Phase 2 F2.1: 發音按鈕 */}
                              {(node as ParsedTerm).pronunciation && (
                                <PronunciationButton
                                  text={(node as ParsedTerm).pronunciation!.text}
                                  lang={(node as ParsedTerm).pronunciation!.lang}
                                  size="sm"
                                  className="ml-0.5"
                                />
                              )}
                            </span>
                          )
                        )}
                      </p>
                    ))
                  })()}
                </div>
                {/* 160 學習筆記：本章節專用；Esc  blur（task 27）；P2.A2.1 可列印版 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-white/60 text-xs font-medium">我的筆記</label>
                    <div className="flex items-center gap-2">
                      {/* Phase 1 D3.4: 筆記自動保存指示器 */}
                    <AnimatePresence>
                      {noteSaveIndicator[ch.id] && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-1 text-primary-400 text-xs"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            className="w-3 h-3"
                          >
                            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" className="opacity-30" />
                              <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </motion.div>
                          已保存
                        </motion.div>
                      )}
                    </AnimatePresence>
                      <button
                        type="button"
                        onClick={() => {
                          const printContent = chapters.map((ch) => ({
                            title: ch.title,
                            note: notes[ch.id] ?? getNote(courseId, ch.id) ?? '',
                          })).filter((x) => x.note.trim())
                          if (printContent.length === 0) {
                            toast('尚無筆記可列印')
                            return
                          }
                          const win = window.open('', '_blank')
                          if (!win) return
                          win.document.write(`
                            <!DOCTYPE html><html><head><meta charset="utf-8"><title>${title} - 品酒筆記</title>
                            <style>body{font-family:system-ui;padding:2rem;max-width:720px;margin:0 auto;color:#333}
                            h1{font-size:1.25rem;margin-bottom:1rem}.chapter{margin-bottom:1.5rem}
                            .chapter h2{font-size:1rem;color:#666;margin-bottom:0.5rem}
                            .chapter p{white-space:pre-wrap;font-size:0.9rem;line-height:1.6}
                            @media print{body{padding:1rem}}</style></head><body>
                            <h1>${title} · 品酒筆記</h1>
                            ${printContent.map((c) => `<div class="chapter"><h2>${c.title}</h2><p>${c.note.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>`).join('')}
                            </body></html>`)
                          win.document.close()
                          win.focus()
                          setTimeout(() => { win.print(); win.close() }, 300)
                        }}
                        className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 games-focus-ring"
                        title="列印筆記"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={notes[ch.id] ?? getNote(courseId, ch.id)}
                    onChange={(e) => setChapterNote(ch.id, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Escape') (e.target as HTMLTextAreaElement).blur() }}
                    placeholder="寫下本章重點…"
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm resize-y min-h-[80px]"
                  />
                </div>

                {/* Phase 2 A1.2: 關鍵詞摘要卡 */}
                <KeywordSummary 
                  keywords={extractKeywords(ch.content || '')}
                  chapterTitle={ch.title}
                  className="mb-4"
                />

                {/* 158 穿插測驗：有 quiz 時先答題再完成本章 */}
                {ch.quiz && ch.quiz.length > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-white/5 border border-primary-500/20 space-y-3">
                    <div className="flex items-center gap-2 text-primary-400 text-sm font-medium">
                      <HelpCircle className="w-4 h-4" />
                      小測驗
                    </div>
                    {ch.quiz.map((q, qIdx) => {
                      const state = quizState[ch.id]
                      const step = state?.step ?? 0
                      const showCorrect = state?.showCorrect ?? false
                      const wrongIdx = state?.wrongIdx
                      const isCurrent = step === qIdx
                      if (!isCurrent) return null
                      const shuffled = (() => {
                        const s = state?.shuffledMap?.[qIdx]
                        if (s && s.length === q.options.length) return s
                        const idx = q.options.map((_, i) => i)
                        for (let i = idx.length - 1; i > 0; i--) {
                          const j = Math.floor(Math.random() * (i + 1))
                          ;[idx[i], idx[j]] = [idx[j], idx[i]]
                        }
                        return idx
                      })()
                      const handleOption = (mappedIdx: number) => {
                        if (showCorrect) return
                        const optIdx = shuffled[mappedIdx]
                        const correct = optIdx === q.correctIndex
                        setQuizState((prev) => ({
                          ...prev,
                          [ch.id]: {
                            step: correct ? qIdx + 1 : qIdx,
                            showCorrect: !correct,
                            wrongIdx: correct ? undefined : mappedIdx,
                            shuffledMap: { ...prev[ch.id]?.shuffledMap, [qIdx]: shuffled },
                          },
                        }))
                        if (correct) {
                          addPoints(5)
                          play('correct')
                        } else {
                          play('wrong')
                          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
                          // Phase 2 C2.2: 將錯題加入錯題本
                          addWrongAnswer({
                            courseId,
                            courseTitle: title,
                            chapterId: ch.id,
                            chapterTitle: ch.title,
                            question: q.question,
                            options: q.options,
                            correctIndex: q.correctIndex,
                            userAnswer: optIdx,
                            explanation: q.explanation,
                          })
                        }
                      }
                      return (
                        <div key={qIdx} className="space-y-2">
                          <p className="text-white/90 text-sm font-medium">{qIdx + 1}. {q.question}</p>
                          {/* Phase 1 D4.1: 測驗選項 hover 動畫優化 */}
                          <div className="flex flex-wrap gap-2">
                            {shuffled.map((origIdx, mappedIdx) => {
                              const opt = q.options[origIdx]
                              const isCorrect = origIdx === q.correctIndex
                              const chosen = showCorrect && isCorrect
                              const wrong = showCorrect && wrongIdx === mappedIdx
                              return (
                                <motion.button
                                  key={mappedIdx}
                                  type="button"
                                  onClick={() => handleOption(mappedIdx)}
                                  disabled={showCorrect}
                                  whileHover={!showCorrect ? { scale: 1.05, y: -2 } : {}}
                                  whileTap={!showCorrect ? { scale: 0.95 } : {}}
                                  transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                                  className={`min-h-[48px] min-w-[48px] px-3 py-2 rounded-lg text-sm border transition-all games-focus-ring ${
                                    chosen
                                      ? 'bg-primary-500/30 border-primary-500 text-primary-300 ring-2 ring-primary-500/50 shadow-lg'
                                      : wrong
                                        ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-red-500/20'
                                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 hover:shadow-md disabled:opacity-70'
                                  }`}
                                >
                                  {opt}
                                </motion.button>
                              )
                            })}
                          </div>
                          {/* Phase 1 D4.2: 測驗結果揭曉動畫 */}
                          {/* Phase 2 C1.1: 測驗解析模式 - 顯示詳細解釋 */}
                          {showCorrect && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                              className="space-y-3"
                            >
                              <motion.p 
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                                className="text-white/50 text-xs"
                              >
                                正確答案：{q.options[q.correctIndex]}
                              </motion.p>
                              {/* Phase 2 C1.1: 解析區塊 */}
                              {q.explanation && (
                                <motion.div
                                  initial={{ y: 10, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.2, duration: 0.4 }}
                                  className="p-3 rounded-lg bg-gradient-to-br from-primary-500/10 to-accent-500/5 border border-primary-500/20"
                                >
                                  <div className="flex items-start gap-2">
                                    <Sparkles className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-primary-300 text-xs font-medium mb-1">解析說明</p>
                                      <p className="text-white/70 text-sm leading-relaxed">{q.explanation}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                              {qIdx < (ch.quiz?.length ?? 1) - 1 && (
                                <motion.button
                                  initial={{ y: 10, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: q.explanation ? 0.4 : 0.2, duration: 0.3 }}
                                  type="button"
                                  onClick={() => setQuizState((prev) => ({ ...prev, [ch.id]: { ...prev[ch.id], step: qIdx + 1, showCorrect: false, wrongIdx: undefined } }))}
                                  className="mt-2 min-h-[48px] px-3 py-2 rounded-lg text-xs text-primary-400 hover:text-primary-300 games-focus-ring"
                                >
                                  下一題 →
                                </motion.button>
                              )}
                            </motion.div>
                          )}
                        </div>
                      )
                    })}
                    {(quizState[ch.id]?.step ?? 0) >= (ch.quiz?.length ?? 0) && (
                      <p className="text-primary-400 text-xs">測驗完成，可點下方「完成本章」</p>
                    )}
                  </div>
                )}

                {/* 完成本章；41 勾選動畫 */}
                {/* Phase 1 D1.3: 課程完成勾選動畫增強 - 彈跳 + 光暈 */}
                <motion.button
                  type="button"
                  onClick={() => markChapterComplete(ch.id)}
                  className={`mt-4 min-h-[48px] min-w-[48px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all games-focus-ring ${
                    isCompleted
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-[0_0_20px_rgba(139,0,0,0.3)]'
                      : 'bg-white/10 text-white/80 hover:bg-white/15 border border-white/10 hover:shadow-lg'
                  }`}
                  whileHover={!isCompleted ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!isCompleted ? { scale: 0.95 } : {}}
                  animate={isCompleted ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  {isCompleted ? (
                    <>
                      <motion.span 
                        initial={{ scale: 0, rotate: -180 }} 
                        animate={{ scale: 1, rotate: 0 }} 
                        transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 15 }}
                        className="text-primary-400"
                      >
                        <Check className="w-5 h-5" />
                      </motion.span>
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                      >
                        已完成
                      </motion.span>
                    </>
                  ) : (
                    '完成本章'
                  )}
                </motion.button>
                {/* L63：上一章 / 下一章按鈕 */}
                <div className="mt-6 flex items-center justify-between gap-2 flex-wrap games-btn-group">
                  {prevCh ? (
                    <a
                      href={`#ch-${prevCh.id}`}
                      className="min-h-[48px] min-w-[48px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm transition-colors games-focus-ring"
                      aria-label={`上一章：${prevCh.title}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      上一章：<span className="truncate max-w-[8rem] sm:max-w-none">{prevCh.title}</span>
                    </a>
                  ) : <span />}
                  {nextCh ? (
                    <a
                      href={`#ch-${nextCh.id}`}
                      className="min-h-[48px] min-w-[48px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm transition-colors games-focus-ring ml-auto"
                      aria-label={`下一章：${nextCh.title}`}
                    >
                      <span className="truncate max-w-[8rem] sm:max-w-none">下一章：{nextCh.title}</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  ) : <span />}
                </div>
              </motion.section>
            )
          })}
        </div>

        {/* 專為wine-101新增的互動式學習工具 */}
        {courseId === 'wine-basics' && (
          <div className="mt-8 space-y-8">
            {/* 互動式世界葡萄酒產區地圖 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-red-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">🌐 世界葡萄酒產區探索</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  葡萄牙以高山大河成為區塊型：泰斗大陸連意大利在火坑底互相磨破,靠酒精燃料救業了 (Taylor Continental 迁 Northern Italy 在 Fire Bottom 互相磨破, 靠 Alcohol Fuel 救業了)
                </p>
              </div>
              <InteractiveRegionMap />
            </motion.section>

            {/* 葡萄酒專業術語詞典 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-teal-500/10 to-blue-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">📚 葡萄酒專業術語</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  學習葡萄酒專業術語，提升品酒專業度
                </p>
              </div>
              <WineGlossary />
            </motion.section>

            {/* 季節性內容與推薦酒款 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">🌸 季節性酒款推薦</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  根據不同季節與場合，為您推薦最適合的葡萄酒
                </p>
              </div>
              <SeasonalWineGuide />
            </motion.section>

            {/* 葡萄酒歷史演進脈絡 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">📜 葡萄酒歷史演進</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  從古希臘羅馬到現代，探索葡萄酒的發展歷程
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">古代起源</h4>
                  <p className="text-white/70 text-sm">
                    葡萄酒的歷史可追溯至公元前6000年，最早起源於高加索地區（現今喬治亞）。古埃及、希臘、羅馬文明都對葡萄酒文化有重要貢獻。
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">中世紀發展</h4>
                  <p className="text-white/70 text-sm">
                    修道院僧侶在中世紀扮演重要角色，他們不僅保存釀酒技術，更發展出精緻的釀酒工藝，奠定了現代葡萄酒產業基礎。
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">近代革新</h4>
                  <p className="text-white/70 text-sm">
                    18-19世紀的科學革命帶來釀酒技術突破，路易·巴斯德發現發酵原理，現代釀酒科學由此誕生。
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">現代演進</h4>
                  <p className="text-white/70 text-sm">
                    20世紀以來，新世界產區崛起，科技創新與傳統工藝結合，創造出多元化的葡萄酒風格。
                  </p>
                </div>
              </div>
            </motion.section>
          </div>
        )}
        
        {/* 專為whisky-101新增的互動式學習工具 */}
        {courseId === 'whisky-101' && (
          <div className="mt-8 space-y-8">
            {/* 互動式世界威士忌產區地圖 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">🥃 世界威士忌產區探索</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  從蘇格蘭高地到日本山崎，探索全球威士忌產區的獨特風土條件
                </p>
              </div>
              <InteractiveWhiskyMap />
            </motion.section>

            {/* 威士忌專業術語詞典 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-teal-500/10 to-blue-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">📚 威士忌專業術語</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  學習威士忌專業術語，提升品酩專業度
                </p>
              </div>
              <WhiskyGlossary />
            </motion.section>

            {/* 威士忌實例案例 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">🥃 威士忌實例案例</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  精選代表性威士忌，了解不同風格與特色
                </p>
              </div>
              <WhiskyExamples />
            </motion.section>

            {/* 威士忌推薦與季節性內容 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">🌸 季節性威士忌推薦</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  根據不同季節與場合，為您推薦最適合的威士忌
                </p>
              </div>
              <SeasonalWhiskyGuide />
            </motion.section>

            {/* 威士忌歷史演進脈絡 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">📜 威士忌歷史演進</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  從蘇格蘭起源到全球發展，探索威士忌的發展歷程
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">起源發展</h4>
                  <p className="text-white/70 text-sm">
                    威士忌起源於15世紀的蘇格蘭和愛爾蘭，最初作為藥用酒精，逐漸發展成今日的飲品。
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">工業革命</h4>
                  <p className="text-white/70 text-sm">
                    18-19世紀的工業革命帶來大量生產技術，連續蒸餾器的發明改變了威士忌產業。
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">現代發展</h4>
                  <p className="text-white/70 text-sm">
                    20世紀以來，調和威士忌技術成熟，日本等新興產區崛起，威士忌成為全球性飲品。
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">新興趨勢</h4>
                  <p className="text-white/70 text-sm">
                    21世紀單一麥芽復興，台灣、澳洲等新興產區展現活力，工藝威士忌興起。
                  </p>
                </div>
              </div>
            </motion.section>
          </div>
        )}
        
        {/* 專為beer-cider新增的互動式學習工具 */}
        {courseId === 'beer-cider' && (
          <div className="mt-8 space-y-8">
            {/* 互動式世界啤酒與蘋果酒產區地圖 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">🍺 世界啤酒與蘋果酒產區探索</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  從德國皮爾森到美國精釀啤酒革命，探索全球啤酒與蘋果酒產區的獨特風土條件
                </p>
              </div>
              <InteractiveBeerCiderMap />
            </motion.section>

            {/* 啤酒與蘋果酒專業術語詞典 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-teal-500/10 to-blue-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">📚 啤酒與蘋果酒專業術語</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  學習啤酒與蘋果酒專業術語，提升品飲專業度
                </p>
              </div>
              <BeerCiderGlossary />
            </motion.section>

            {/* 啤酒與蘋果酒實例案例 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">🍺 啤酒與蘋果酒實例案例</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  精選代表性啤酒與蘋果酒，了解不同風格與特色
                </p>
              </div>
              <BeerCiderExamples />
            </motion.section>

            {/* 季節性內容與推薦酒款 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">🌸 季節性啤酒與蘋果酒推薦</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  根據不同季節與場合，為您推薦最適合的啤酒與蘋果酒
                </p>
              </div>
              <SeasonalBeerCiderGuide />
            </motion.section>

            {/* 啤酒與蘋果酒歷史演進脈絡 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">📜 啤酒與蘋果酒歷史演進</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  從古代釀造到現代精釀革命，探索啤酒與蘋果酒的發展歷程
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">古代起源</h4>
                  <p className="text-white/70 text-sm">
                    啤酒的歷史可追溯至公元前7000年，最早起源於美索不達米亞地區。古代蘇美爾人和埃及人都有釀造啤酒的記錄，被視為日常飲料。
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">中世紀發展</h4>
                  <p className="text-white/70 text-sm">
                    修道院在中世紀扮演重要角色，僧侶們不僅保存釀造技術，更發展出精緻的釀造工藝。德國純淨法確立了現代啤酒標準。
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">工業革命</h4>
                  <p className="text-white/70 text-sm">
                    18-19世紀的工業革命帶來大量生產技術，製冷設備和巴斯德消毒法的發明改變了啤酒產業。
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">現代演進</h4>
                  <p className="text-white/70 text-sm">
                    20世紀精釀啤酒運動復興傳統工藝，21世紀精釀革命帶來無限創新，台灣本土品牌也逐漸崛起。
                  </p>
                </div>
              </div>
            </motion.section>
          </div>
        )}
        
        {/* 專為cocktail-basics新增的互動式學習工具 */}
        {courseId === 'cocktail-basics' && (
          <div className="mt-8 space-y-8">
            {/* 互動式世界調酒產區地圖 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">🍸 世界調酒產區探索</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  從美國禁酒令時期到現代雞尾酒吧，探索全球調酒文化的演進與發展
                </p>
              </div>
              <InteractiveCocktailMap />
            </motion.section>

            {/* 調酒專業術語詞典 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-teal-500/10 to-blue-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">📚 調酒專業術語</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  學習調酒專業術語，提升品飲專業度
                </p>
              </div>
              <CocktailGlossary />
            </motion.section>

            {/* 調酒實例案例 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">🍸 調酒實例案例</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  精選代表性調酒，了解不同風格與特色
                </p>
              </div>
              <CocktailExamples />
            </motion.section>

            {/* 調酒推薦與季節性內容 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">🌸 季節性調酒推薦</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  根據不同季節與場合，為您推薦最適合的調酒
                </p>
              </div>
              <SeasonalCocktailGuide />
            </motion.section>

            {/* 調酒歷史演進脈絡 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-white/10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">📜 調酒歷史演進</h3>
                <p className="text-white/60 max-w-2xl mx-auto">
                  從古典時代到現代，探索調酒的發展歷程
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">古典時期</h4>
                  <p className="text-white/70 text-sm">
                    調酒的歷史可追溯至19世紀初期，最早出現於美國酒吧文化中，以威士忌為基酒的調酒成為主流。
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">禁酒令時期</h4>
                  <p className="text-white/70 text-sm">
                    1920年代美國禁酒令期間，地下酒吧繁榮發展，調酒技藝在隱蔽環境中精進。
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">現代發展</h4>
                  <p className="text-white/70 text-sm">
                    1970年代後，調酒文化復興，專業調酒師地位提升，調酒成為藝術形式。
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">新興趨勢</h4>
                  <p className="text-white/70 text-sm">
                    21世紀工藝調酒興起，注重天然原料與手工技藝，台灣調酒文化也逐漸成熟。
                  </p>
                </div>
              </div>
            </motion.section>
          </div>
        )}

        {/* P2.A1.3 常見錯誤觀念 */}
        {(() => {
          const mistakes = getCommonMistakes(courseId)
          if (!mistakes) return null
          return (
            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <h3 className="text-sm font-semibold text-amber-200 mb-2">{mistakes.title}</h3>
              <ul className="space-y-2">
                {mistakes.items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-white/80">
                    <span className="text-amber-400 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })()}

        {/* P2.A4.1 延伸閱讀書單；P2.D2.2 摺疊/展開控制 */}
        {(() => {
          const reading = getReadingListForCourse(courseId)
          if (reading.length === 0) return null
          return (
            <div className="mt-6 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setReadingListOpen((o) => !o)}
                className="w-full flex items-center justify-between p-4 text-left games-focus-ring"
                aria-expanded={readingListOpen}
              >
                <h3 className="text-sm font-semibold text-white/90">延伸閱讀</h3>
                {readingListOpen ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
              </button>
              {readingListOpen && (
                <ul className="space-y-2 px-4 pb-4">
                  {reading.map((item, i) => (
                    <li key={i}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-300 hover:text-primary-200 text-sm underline underline-offset-2"
                      >
                        {item.title}
                      </a>
                      {item.note && <span className="text-white/50 text-xs ml-2">{item.note}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })()}

        {/* P2.A4.2 論文引用資料 */}
        {(() => {
          const refs = getReferencesForCourse(courseId)
          if (refs.length === 0) return null
          return (
            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-white/60" />
                參考資料
              </h3>
              <ul className="space-y-1.5 text-sm text-white/70">
                {refs.map((r, i) => (
                  <li key={i}>
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary-300 hover:underline">
                        {r.title}
                      </a>
                    ) : (
                      <span>{r.title}</span>
                    )}
                    {r.authors && <span className="text-white/50"> — {r.authors}</span>}
                    {r.year && <span className="text-white/50"> ({r.year})</span>}
                    {r.note && <span className="text-white/50 text-xs ml-1">{r.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )
        })()}

        {/* P2.A2.3 風味輪對照圖：葡萄酒課視覺化（籌備中） */}
        {courseId === 'wine-basics' && (
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-semibold text-white/90 mb-1">風味輪對照圖</h3>
            <p className="text-white/50 text-xs">葡萄品種風味輪視覺化籌備中，敬請期待。</p>
          </div>
        )}
        {/* P2.A3.1 配方計算器：調酒課可調整份量（籌備中） */}
        {courseId === 'cocktail-basics' && (
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-semibold text-white/90 mb-1">配方計算器</h3>
            <p className="text-white/50 text-xs">可依人數調整份量的調酒計算器籌備中。</p>
          </div>
        )}
        {/* P2.A3.2 年份比較時間軸：威士忌課（籌備中） */}
        {courseId === 'whisky-101' && (
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-semibold text-white/90 mb-1">年份比較時間軸</h3>
            <p className="text-white/50 text-xs">陳年差異視覺化時間軸籌備中。</p>
          </div>
        )}
        {/* P2.A3.3 精米步合對照：清酒課（籌備中） */}
        {courseId === 'sake-intro' && (
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-semibold text-white/90 mb-1">精米步合對照</h3>
            <p className="text-white/50 text-xs">清酒精米步合互動式對照籌備中。</p>
          </div>
        )}
        {/* P2.F2.2 步驟 GIF 動圖：調酒課（籌備中） */}
        {courseId === 'cocktail-basics' && (
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-semibold text-white/90 mb-1">步驟 GIF 動圖</h3>
            <p className="text-white/50 text-xs">調酒步驟快速教學動圖籌備中。</p>
          </div>
        )}
        {/* P2.F3.1 重點回顧音檔：籌備中 */}
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold text-white/90 mb-1">重點回顧音檔</h3>
          <p className="text-white/50 text-xs">Podcast 與音檔籌備中，敬請期待。通勤時也能複習重點。</p>
        </div>

        {/* Phase 2 B2.1: 智慧推薦下一堂課程 */}
        {progressPct >= 100 && (() => {
          const recommendations = NEXT_COURSE_MAP[courseId] ?? NEXT_COURSE_MAP['_default'] ?? []
          // 過濾掉已完成的課程
          const unfinished = recommendations.filter(r => {
            const p = progress[r.id]
            if (!p) return true
            return p.completed < p.total
          }).slice(0, 3)
          
          if (unfinished.length === 0) return null
          
          return (
            <motion.div
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
                  <h3 className="text-lg font-semibold text-white">恭喜完成 {title}！</h3>
                  <p className="text-white/60 text-sm">推薦你接續學習以下課程</p>
                </div>
              </div>
              {/* Phase 2 E1.1: IG Story 分享按鈕 */}
              <div className="flex flex-wrap gap-2 mb-4">
                <ShareToStory 
                  courseTitle={title} 
                  completedAt={current?.completedAt}
                  totalChapters={total}
                />
                {/* Phase 2 E1.2: 證書分享連結 */}
                <CertificateShare
                  courseTitle={title}
                  completedAt={current?.completedAt}
                  totalChapters={total}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {unfinished.map((course, idx) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                  >
                    <Link
                      href={`/learn/${course.id}`}
                      className="group block p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/30 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white group-hover:text-primary-300 transition-colors truncate">
                            {course.title}
                          </h4>
                          <p className="text-white/50 text-sm mt-1 line-clamp-2">{course.reason}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-primary-400 group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        })()}

          {/* Phase 2 A1.1: 考點對照表 */}
          <ExamPointsReference courseId={courseId} className="mt-6" />

        <div className="mt-8 flex justify-between">
          <Link
            href="/learn"
            className="min-h-[48px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm games-focus-ring"
          >
            <ChevronLeft className="w-4 h-4" />
            返回學院
          </Link>
          <Link
            href="/quiz"
            className="min-h-[48px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm games-focus-ring"
          >
            測驗靈魂酒款
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Phase 1 D1.4: 成就提示優化 - 立體彈出動畫 + 章節完成動畫 */}
        {completedToast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.4, ease: [0.68, -0.55, 0.265, 1.55] }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl bg-gradient-to-r from-primary-500/95 to-secondary-500/95 text-white text-sm font-medium shadow-2xl backdrop-blur-sm border border-white/20 achievement-pop"
          >
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              +10 積分 · 繼續加油！
            </div>
          </motion.div>
        )}
        {shareToast !== null && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl bg-white/95 backdrop-blur-sm text-dark-950 text-sm font-medium shadow-xl border border-white/20" 
            role="status"
          >
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              >
                <Link2 className="w-4 h-4" />
              </motion.div>
              {shareToast === -1 ? '已複製課程連結' : '已複製本章連結'}
            </div>
          </motion.div>
        )}
        {/* Phase 1 D1.5: 成就解鎖提示加強 - 專業圖標系統 */}
        {(bookmarkAchievementToast || learnAchievementToast || bookmarkLimitToast) && (() => {
          const message = bookmarkLimitToast ? `pin:書籤已達上限（${getBookmarkLimit()} 個）` : (bookmarkAchievementToast ?? learnAchievementToast ?? '')
          const [iconType, text] = message.includes(':') ? message.split(':', 2) : ['award', message]
          const IconComponent = iconType === 'trophy' ? Trophy : iconType === 'clock' ? Clock : iconType === 'pin' ? Pin : Award
          
          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55] }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500/95 to-orange-500/95 text-white text-sm font-medium shadow-2xl backdrop-blur-sm border border-amber-300/30 achievement-pop badge-glow" 
              role="status"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.4, type: 'spring', stiffness: 250 }}
                >
                  <IconComponent className="w-4 h-4" />
                </motion.div>
                {text}
              </div>
            </motion.div>
          )
        })()}
        {/* 33 長按/右鍵顯示章節摘要 */}
        {summaryTooltip && (() => {
          const ch = chapters.find((c) => c.id === summaryTooltip.chId)
          if (!ch) return null
          const s = (ch.content || '').replace(/\s+/g, ' ').trim().slice(0, 100) + ((ch.content?.length ?? 0) > 100 ? '…' : '')
          const isCenter = summaryTooltip.x === 0 && summaryTooltip.y === 0
          return (
            <div
              className={`fixed z-50 max-w-sm px-4 py-3 rounded-xl bg-dark-900/95 border border-white/20 text-white text-sm shadow-xl ${isCenter ? 'bottom-24 left-1/2 -translate-x-1/2' : ''}`}
              style={!isCenter ? { left: Math.min(summaryTooltip.x, typeof window !== 'undefined' ? window.innerWidth - 320 : 999), top: Math.max(80, summaryTooltip.y) } : undefined}
              role="tooltip"
            >
              <p className="font-medium text-primary-300 mb-1">第 {ch.id} 章：{ch.title}</p>
              <p className="text-white/80 text-xs">{s || '（無摘要）'}</p>
            </div>
          )
        })()}
        </div>{/* 關閉主內容區 div */}
      </div>{/* 關閉二欄佈局 grid div */}
      
      {/* Phase 2 D1.3: 行動版底部快速操作列 - 僅行動版顯示 */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a0a2e]/95 backdrop-blur-lg border-t border-white/10 safe-area-pb"
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* 上一章 */}
          <button
            type="button"
            onClick={() => {
              const ids = chapters.map(c => c.id)
              const currentIdx = activeChapterId ? ids.indexOf(activeChapterId) : 0
              const prevIdx = Math.max(0, currentIdx - 1)
              chapterRefs.current.get(ids[prevIdx])?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            disabled={!activeChapterId || activeChapterId <= 1}
            className="p-3 rounded-xl bg-white/10 text-white/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/15 transition-colors"
            aria-label="上一章"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* 章節指示器 */}
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">
              第 {activeChapterId ?? 1} / {total} 章
            </span>
            <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                style={{ width: `${(activeChapterId ?? 1) / total * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          
          {/* 書籤按鈕 */}
          <button
            type="button"
            onClick={() => {
              if (!activeChapterId) return
              const ch = chapters.find(c => c.id === activeChapterId)
              if (!ch) return
              if (hasBookmark(courseId, ch.id)) {
                removeBookmark(courseId, ch.id)
              } else {
                addBookmark({ courseId, chapterId: ch.id, title: ch.title, courseTitle: title })
              }
            }}
            className="p-3 rounded-xl bg-white/10 text-white/80 hover:bg-white/15 transition-colors"
            aria-label={activeChapterId && hasBookmark(courseId, activeChapterId) ? '移除書籤' : '加入書籤'}
          >
            {activeChapterId && hasBookmark(courseId, activeChapterId) 
              ? <BookmarkCheck className="w-5 h-5 text-primary-400" /> 
              : <Bookmark className="w-5 h-5" />
            }
          </button>
          
          {/* 下一章 */}
          <button
            type="button"
            onClick={() => {
              const ids = chapters.map(c => c.id)
              const currentIdx = activeChapterId ? ids.indexOf(activeChapterId) : 0
              const nextIdx = Math.min(ids.length - 1, currentIdx + 1)
              chapterRefs.current.get(ids[nextIdx])?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            disabled={!activeChapterId || activeChapterId >= total}
            className="p-3 rounded-xl bg-white/10 text-white/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/15 transition-colors"
            aria-label="下一章"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </main>
    </>
  )
}
