'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { ChevronRight, ArrowRight, Lock, Play, Star, Award, ChevronDown, ChevronUp, LayoutGrid, List, Search } from 'lucide-react'
import Link from 'next/link'
import { useDeferredValue } from 'react'
import { InViewAnimate } from '@/components/ui/InViewAnimate'
import { useTranslation } from '@/contexts/I18nContext'
import { useSubscription } from '@/hooks/useSubscription'
import { canAccessProCourse, canUseProTrial, getProTrialRemainingThisMonth } from '@/lib/subscription'
import { getCourseRating } from '@/lib/learn-course-ratings'
import { CoursePreviewModal } from '@/components/learn/CoursePreviewModal'

// Type definitions
// Type definitions
type CourseLevel = 'beginner' | 'intermediate' | 'expert'

// Define Course type
interface Course {
  id: string
  title: string
  description: string
  icon: any
  lessons: number
  duration: string
  estimatedMinutes: number
  color: string
  free: boolean
  previewImage: string | null
  level: CourseLevel
  rating?: number
  tags?: ('hot' | 'new' | 'essential' | 'quick')[]
  targetAudience?: string
}

// Progress entry type
interface ProgressEntry {
  completed: number;
  total: number;
  completedAt?: string;
}

// Define constants as props to be passed in
const DEFAULT_LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: '入門',
  intermediate: '進階',
  expert: '專家',
};

const DEFAULT_PREREQ_MAP: Record<string, string> = {
  'wset-l2-wines': 'WSET L1 認證',
  'wset-l3-viticulture': 'WSET L2 認證',
  'wset-l3-tasting': 'WSET L2 認證',
  'wset-d1-production': 'WSET L3 認證',
  'wset-d2-business': 'WSET L3 認證',
  'wset-d3-world': 'WSET D1+D2',
  'wset-d4-sparkling-pro': 'WSET D3 認證',
  'cms-deductive-tasting': 'CMS Intro',
  'cms-service': 'CMS Intro',
  'cms-advanced-theory': 'CMS Deductive',
  'cms-practical': 'CMS Advanced',
  'mw-theory': 'MW Preliminary',
  'mw-practical': 'MW Theory',
  'blind-tasting-advanced': 'CMS Deductive',
};

interface CourseListSectionProps {
  progress: Record<string, ProgressEntry>
  onShowUpgrade: () => void
  courses: Course[]
  levelLabels?: Record<CourseLevel, string>
  prereqMap?: Record<string, string>
}

// Helper function to highlight search query in text
const highlightQuery = (text: string, query: string) => {
  if (!query.trim()) return text
  const parts = text.split(new RegExp(`(${query.trim()})`, 'gi'))
  return parts.map((part, i) =>
    i % 2 === 1 ? <mark key={i} className="bg-primary-500/30 text-primary-200 rounded px-0.5">{part}</mark> : part
  )
}

export default function CourseListSection({ 
  progress, 
  onShowUpgrade,
  courses,
  levelLabels = DEFAULT_LEVEL_LABELS,
  prereqMap = DEFAULT_PREREQ_MAP
}: CourseListSectionProps) {
  const { t } = useTranslation()
  const { tier } = useSubscription()
  const canAccessPro = canAccessProCourse(tier)
  const proTrialAllowed = canUseProTrial(tier)
  const proTrialRemaining = getProTrialRemainingThisMonth(tier)

  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(() => new Set())
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null)
  const [isFiltering, setIsFiltering] = useState(false)

  const deferredSearch = useDeferredValue(searchQuery)

  const INITIAL_COURSES_PER_LEVEL = 8

  // Filter courses based on search and other criteria
  const levelFiltered = courses
  const quickFiltered = levelFiltered // Add quick filter logic if needed
  const certFiltered = quickFiltered // Add certification filter logic if needed
  const filteredCourses = !deferredSearch.trim()
    ? certFiltered
    : certFiltered.filter((c) =>
        c.title.toLowerCase().includes(deferredSearch.trim().toLowerCase()) ||
        c.description.toLowerCase().includes(deferredSearch.trim().toLowerCase())
      )

  // Handle course preview
  const handleCoursePreview = (course: Course) =>
    setPreviewCourse(course)
  
  const handleStartLearning = () => {
    if (previewCourse) {
      window.location.href = `/learn/${previewCourse.id}`
      setPreviewCourse(null)
    }
  }

  const handleShowDetails = () => {
    if (previewCourse) {
      window.location.href = `/learn/${previewCourse.id}`
      setPreviewCourse(null)
    }
  }

  const handleClosePreview = () => {
    setPreviewCourse(null)
  }

  return (
    <div className="space-y-10 md:space-y-12 mb-12 divide-y divide-white/5 md:divide-y-0 md:space-y-12">
      {(['beginner', 'intermediate', 'expert'] as const).map((level) => {
        const levelCourses = filteredCourses.filter((c) => c.level === level)
        if (levelCourses.length === 0) return null
        
        const isExpanded = expandedLevels.has(level)
        const visibleCourses = isExpanded 
          ? levelCourses 
          : levelCourses.slice(0, INITIAL_COURSES_PER_LEVEL)
        const hasMore = levelCourses.length > INITIAL_COURSES_PER_LEVEL

        return (
          <section key={level} aria-labelledby={`section-${level}`} className="pt-10 md:pt-0 first:pt-0 scroll-mt-20">
            <h2 id={`section-${level}`} className="text-lg md:text-xl font-semibold text-white mb-5 md:mb-6 flex items-center gap-3">
              <span className="w-1 h-6 md:h-7 rounded-full bg-primary-500 shrink-0" aria-hidden />
              <span>{levelLabels[level]}（{levelCourses.length}）</span>
            </h2>
            <div className={viewMode === 'list' ? 'flex flex-col gap-2' : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6'}>
              {visibleCourses.map((course, index) => {
                const isProCourse = !course.free
                const hasAccess = canAccessPro || (isProCourse && tier === 'free' && proTrialAllowed)
                
                // Check if free tier user has exceeded course limit
                const globalIndex = courses.findIndex((c) => c.id === course.id)
                const freeTierOverLimit = tier === 'free' && globalIndex >= 5 // Assuming 5 free courses limit
                
                const isLocked = (isProCourse && !hasAccess) || freeTierOverLimit
                const prog = progress[course.id]
                const totalChapters = course.lessons
                const completed = prog ? Math.min(prog.completed, totalChapters) : 0
                const progressPct = totalChapters > 0 ? Math.round((completed / totalChapters) * 100) : 0

                return (
                  <InViewAnimate key={course.id} delay={Math.min(index * 0.06, 0.4)} y={20} amount={0.15}>
                    {viewMode === 'list' ? (
                      <Link
                        href={isLocked ? '/pricing' : `/learn/${course.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors"
                        aria-label={`${course.title}，${course.lessons} 課`}
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${course.color} shrink-0`}>
                          <course.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">{highlightQuery(course.title, deferredSearch)}</h3>
                          <p className="text-white/50 text-sm truncate">{highlightQuery(course.description, deferredSearch)}</p>
                        </div>
                        <span className="text-white/40 text-xs shrink-0">{course.lessons} 課 · {course.estimatedMinutes ?? course.duration}</span>
                        <ChevronRight className="w-5 h-5 text-white/40 shrink-0" />
                      </Link>
                    ) : (
                      <m.div
                        style={{ transformStyle: 'preserve-3d' }}
                        whileHover={{
                          scale: 1.025,
                          rotateX: 1.5,
                          rotateY: -1.5,
                          z: 10,
                          boxShadow: '0 20px 40px rgba(139, 0, 0, 0.15), 0 0 30px rgba(139, 0, 0, 0.1)',
                          transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
                        }}
                        onClick={() => !isLocked && handleCoursePreview(course)}
                        className="cursor-pointer group/card"
                      >
                        {/* Hover preview overlay */}
                        <div className="hidden sm:block absolute inset-0 z-[2] pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 rounded-2xl bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 flex flex-col justify-end">
                          <p className="text-white/90 text-sm line-clamp-3 mb-2">{course.description}</p>
                          <span className="text-primary-300 text-xs font-medium inline-flex items-center gap-1">
                            開始學習
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        
                        <div
                          className={`card-interactive glass-card rounded-2xl h-full relative overflow-hidden shadow-glass-1 hover:shadow-glass-hover hover:border-white/20 transition-all duration-300 ease-out active:scale-[0.99] min-h-[120px] ${isLocked ? 'cursor-pointer' : ''}`}
                          onClick={isLocked ? () => onShowUpgrade() : undefined}
                          onKeyDown={isLocked ? (e) => e.key === 'Enter' && onShowUpgrade() : undefined}
                          role={isLocked ? 'button' : undefined}
                          tabIndex={isLocked ? 0 : undefined}
                        >
                          {!isLocked && (
                            <div 
                              className="absolute inset-0 z-[1] focus:outline-none games-focus-ring focus-visible:ring-inset rounded-2xl min-h-[48px]" 
                              aria-label={`進入課程：${course.title}，${course.lessons} 堂課、約 ${course.estimatedMinutes != null ? `${course.estimatedMinutes} 分鐘` : course.duration}`} 
                            />
                          )}
                          
                          {/* Course tags */}
                          {course.tags?.includes('essential') && (
                            <span className="absolute top-3 left-3 learn-badge learn-badge-primary z-20">入門必讀</span>
                          )}
                          {course.tags?.includes('hot') && !course.tags?.includes('essential') && (
                            <span className="absolute top-3 left-3 learn-badge learn-badge-amber z-20">熱門</span>
                          )}
                          {course.tags?.includes('quick') && (
                            <span className="absolute top-3 left-3 learn-badge learn-badge-amber z-20">快速</span>
                          )}
                          {course.tags?.includes('new') && !course.tags?.includes('essential') && !course.tags?.includes('quick') && (
                            <span className="absolute top-3 left-3 learn-badge learn-badge-green z-20">新上架</span>
                          )}
                          
                          {/* Difficulty tag */}
                          <span className="absolute bottom-3 left-3 text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/90 z-20">{levelLabels[course.level]}</span>
                          

                          
                          {/* Pro course indicator */}
                          {!course.free && (
                            <div className="absolute top-3 right-3 bg-accent-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-20" aria-label="需升級">
                              <Lock className="w-3 h-3" aria-hidden />
                              {tier === 'free' && proTrialAllowed && proTrialRemaining >= 0 ? `試用 ${proTrialRemaining} 次` : 'PRO'}
                            </div>
                          )}
                          
                          {/* Locked overlay */}
                          {isLocked && (
                            <div className="absolute inset-0 bg-dark-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10" aria-label="需升級解鎖">
                              <Lock className="w-8 h-8 text-primary-400" aria-hidden />
                              <Link
                                href="/pricing"
                                className="inline-flex items-center justify-center min-h-[48px] min-w-[48px] px-5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm border border-primary-400/50 shadow-lg games-focus-ring"
                              >
                                升級解鎖
                              </Link>
                              {tier === 'free' && proTrialAllowed && proTrialRemaining >= 0 && (
                                <span className="text-white/60 text-xs">試用剩餘 {proTrialRemaining} 次</span>
                              )}
                            </div>
                          )}
                          
                          {/* Course cover */}
                          <div className={`aspect-video w-full rounded-t-2xl bg-gradient-to-br ${course.color} flex items-center justify-center relative overflow-hidden group/cover`} aria-hidden>
                            <course.icon className="w-12 h-12 text-white/80 transition-transform duration-300 group-hover/cover:scale-110" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-t-xl transition-all duration-300 group-hover/cover:bg-black/30" aria-hidden>
                              <m.div 
                                className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/50"
                                whileHover={{
                                  scale: 1.15,
                                  backgroundColor: 'rgba(255,255,255,0.4)',
                                  transition: { duration: 0.2, ease: 'easeOut' }
                                }}
                              >
                                <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                              </m.div>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${course.color} shrink-0`}>
                              <course.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="home-heading-3 text-white leading-snug">{highlightQuery(course.title, deferredSearch)}</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-medium">
                                  {levelLabels[course.level]}
                                </span>
                                {course.level === 'expert' && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300" title="深度內容">深度</span>
                                )}
                                {prereqMap[course.id] && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/90 max-w-[120px] truncate" title={`建議先完成：${prereqMap[course.id]}`}>
                                    先修：{prereqMap[course.id]}
                                  </span>
                                )}
                              </div>
                              <p className="text-white/60 text-sm mb-3 line-clamp-2">{highlightQuery(course.description, deferredSearch)}</p>
                              <p className="text-white/40 text-xs mb-2">{course.targetAudience ?? `適合：${levelLabels[course.level]}者`}</p>
                              
                              {/* Course rating */}
                              {(() => {
                                const displayRating = getCourseRating(course.id) ?? course.rating
                                return displayRating != null ? (
                                  <div className="flex items-center gap-1 mb-2 text-primary-400" title="學員評價">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-sm font-medium">{displayRating}</span>
                                    <span className="text-white/40 text-xs">評價</span>
                                  </div>
                                ) : null
                              })()}
                              
                              <div className="flex items-center gap-3 flex-wrap text-sm text-white/60">
                                <span className="font-medium">{course.lessons} 課</span>
                                <span className="text-white/40">•</span>
                                <span>預計 {course.estimatedMinutes ?? course.duration} 分鐘</span>
                                {progressPct > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="text-primary-400 font-medium">已完成 {progressPct}%</span>
                                  </>
                                )}
                              </div>
                              
                              {/* Progress bar */}
                              {progressPct > 0 && (
                                <m.div 
                                  className="mt-2 flex items-center gap-2" 
                                  role="progressbar" 
                                  aria-valuenow={progressPct} 
                                  aria-valuemin={0} 
                                  aria-valuemax={100} 
                                  aria-label={`已完成 ${progressPct}%`}
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2, duration: 0.3 }}
                                >
                                  <m.div 
                                    className="relative w-7 h-7 shrink-0" 
                                    aria-hidden
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                  >
                                    <svg className="w-7 h-7 -rotate-90" viewBox="0 0 32 32">
                                      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
                                      <m.circle 
                                        cx="16" 
                                        cy="16" 
                                        r="14" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="3" 
                                        strokeDasharray={`${(progressPct / 100) * 88} 88`} 
                                        className="text-primary-500" 
                                        strokeLinecap="round"
                                        initial={{ strokeDasharray: '0 88' }}
                                        animate={{ strokeDasharray: `${(progressPct / 100) * 88} 88` }}
                                        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
                                      />
                                      <m.span 
                                        className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5, duration: 0.3 }}
                                      >
                                        {progressPct}%
                                      </m.span>
                                    </svg>
                                  </m.div>
                                  {progressPct < 100 && (
                                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                                      <m.div 
                                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPct}%` }}
                                        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
                                      />
                                    </div>
                                  )}
                                </m.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </m.div>
                    )}
                  </InViewAnimate>
                )
              })}
            </div>
            
            {hasMore && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setExpandedLevels((s) => new Set(s).add(level))}
                  className="min-h-[48px] px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium games-focus-ring"
                  aria-label={`顯示更多${levelLabels[level]}課程，共 ${levelCourses.length - INITIAL_COURSES_PER_LEVEL} 門`}
                >
                  顯示更多（{levelCourses.length - INITIAL_COURSES_PER_LEVEL} 門）
                </button>
              </div>
            )}
          </section>
        )
      })}
      
      {/* Course Preview Modal */}
      <CoursePreviewModal
        course={previewCourse}
        isOpen={!!previewCourse}
        onClose={handleClosePreview}
        onStartLearning={handleStartLearning}
        onShowDetails={handleStartLearning}
      />
    </div>
  )
}