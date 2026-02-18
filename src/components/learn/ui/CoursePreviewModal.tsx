'use client'

import { m , AnimatePresence } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { X, Play, Star, BookOpen, Clock, Trophy, Lock } from 'lucide-react'
import { ModalCloseButton } from '@/components/ui/ModalCloseButton'

// Type definitions (copied from learn/page.tsx)
type CourseLevel = 'beginner' | 'intermediate' | 'expert'

interface Course {
  id: string
  title: string
  description: string
  level: CourseLevel
  lessons: number
  duration: string
  estimatedMinutes?: number
  free: boolean
  icon: React.ComponentType<{ className?: string }>
  color: string
  rating?: number
  targetAudience?: string
  tags?: string[]
}

const LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: '入門',
  intermediate: '進階',
  expert: '專家',
}

const CERT_MAP: Record<string, string> = {
  'wine-basics': 'WSET', 'whisky-101': 'WSET', 'wset-l1-spirits': 'WSET L1', 'wset-l2-wines': 'WSET L2',
  'wset-l3-viticulture': 'WSET L3', 'wset-l3-tasting': 'WSET L3', 'wset-d1-production': 'WSET D1',
  'wset-d2-business': 'WSET D2', 'wset-d3-world': 'WSET D3', 'wset-d4-sparkling-pro': 'WSET D4',
  'fortified-wines': 'WSET', 'dessert-wines': 'WSET', 'organic-biodynamic': 'WSET',
  'cms-intro-somm': 'CMS', 'cms-deductive-tasting': 'CMS', 'cms-service': 'CMS',
  'cms-advanced-theory': 'CMS Advanced', 'cms-practical': 'CMS Practical',
  'mw-prelim': 'MW Preliminary', 'mw-theory': 'MW Theory', 'mw-practical': 'MW Practical',
  'blind-tasting-fundamentals': 'CMS', 'new-world-deep': '葡萄酒進階',
  'blind-tasting-advanced': 'CMS 演繹品飲法',
}

const PREREQ_MAP: Record<string, string> = {
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
}

interface CoursePreviewModalProps {
  course: Course | null
  isOpen: boolean
  onClose: () => void
  onStartLearning: () => void
  onShowDetails: () => void
}

/**
 * Phase 1 D1.7: 課程卡片點擊放大預覽 Modal
 * 提供課程詳細資訊預覽，包含封面、簡介、章節數、時長、評分等
 */
export function CoursePreviewModal({
  course,
  isOpen,
  onClose,
  onStartLearning,
  onShowDetails,
}: CoursePreviewModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus trap and ESC handling
  useEffect(() => {
    if (!isOpen || !course) return

    const prev = document.activeElement as HTMLElement
    requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        requestAnimationFrame(() => prev?.focus())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, course, onClose])

  if (!course) return null

  const isProCourse = !course.free
  const hasCert = CERT_MAP[course.id]
  const prereq = PREREQ_MAP[course.id]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          {/* Modal Dialog */}
          <m.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-preview-title"
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 safe-area-px"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <m.div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0a0a1a] border border-white/10 shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 30,
                duration: 0.3 
              }}
            >
              {/* Header with Close Button */}
              <div className="sticky top-0 z-10 bg-[#0a0a1a]/90 backdrop-blur-xl border-b border-white/5 p-4 md:p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h2 
                        id="course-preview-title" 
                        className="text-xl md:text-2xl font-bold text-white leading-tight"
                      >
                        {course.title}
                      </h2>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60 font-medium whitespace-nowrap">
                        {LEVEL_LABELS[course.level]}
                      </span>
                      {course.level === 'expert' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 whitespace-nowrap">
                          深度
                        </span>
                      )}
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {course.tags?.includes('essential') && (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-300 font-medium">
                          入門必讀
                        </span>
                      )}
                      {course.tags?.includes('hot') && (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                          熱門
                        </span>
                      )}
                      {course.tags?.includes('quick') && (
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                          快速
                        </span>
                      )}
                      {course.tags?.includes('new') && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 font-medium">
                          新上架
                        </span>
                      )}
                      {hasCert && (
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-600/80 text-white/90">
                          {hasCert}
                        </span>
                      )}
                      {isProCourse && (
                        <span className="text-xs px-2 py-1 rounded-full bg-accent-500/20 text-accent-300 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          PRO
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <ModalCloseButton 
                    ref={closeButtonRef} 
                    onClick={onClose} 
                    aria-label="關閉課程預覽" 
                    className="text-white/70 hover:text-white"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6 space-y-6">
                {/* Cover Image */}
                <div className={`aspect-video w-full rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center relative overflow-hidden`}>
                  <course.icon className="w-16 h-16 text-white/90" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/50">
                      <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">課程簡介</h3>
                  <p className="text-white/70 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Target Audience */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">適合對象</h3>
                  <p className="text-white/60 text-sm">
                    {course.targetAudience ?? `適合：${LEVEL_LABELS[course.level]}者`}
                  </p>
                </div>

                {/* Prerequisites */}
                {prereq && (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
                    <h3 className="text-amber-300 font-medium mb-1 flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      建議先修課程
                    </h3>
                    <p className="text-amber-400/90 text-sm">
                      {prereq}
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <BookOpen className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{course.lessons}</div>
                    <div className="text-white/60 text-xs">章節數</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <Clock className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                      {course.estimatedMinutes ?? course.duration}
                    </div>
                    <div className="text-white/60 text-xs">分鐘</div>
                  </div>
                  
                  {course.rating != null && (
                    <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                      <Star className="w-6 h-6 text-amber-400 mx-auto mb-2 fill-current" />
                      <div className="text-2xl font-bold text-white">{course.rating}</div>
                      <div className="text-white/60 text-xs">評價</div>
                    </div>
                  )}
                  
                  <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-2">
                      <span className="text-primary-400 text-xs font-bold">Lv</span>
                    </div>
                    <div className="text-2xl font-bold text-white capitalize">
                      {course.level.slice(0, 1)}
                    </div>
                    <div className="text-white/60 text-xs">難度</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={onStartLearning}
                    className="flex-1 min-h-[48px] px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors games-focus-ring"
                  >
                    <Play className="w-5 h-5" />
                    開始學習
                  </button>
                  
                  <button
                    type="button"
                    onClick={onShowDetails}
                    className="min-h-[48px] px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium transition-colors games-focus-ring"
                  >
                    查看詳情
                  </button>
                </div>
              </div>
            </m.div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  )
}