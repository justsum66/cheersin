'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { m, AnimatePresence } from 'framer-motion'
import { Check, Lock, ChevronRight, Trophy, Star, Target, BookOpen } from 'lucide-react'
import { getCurriculumNodes, type CurriculumNode, type CourseLevel } from '@/config/learn-curriculum'

const PROGRESS_KEY = 'cheersin_learn_progress'

type ProgressEntry = { completed: number; total: number; completedAt?: string }

function loadProgress(): Record<string, ProgressEntry> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, ProgressEntry>
  } catch {
    return {}
  }
}

interface LearningRoadmapProps {
  className?: string
  currentCourseId?: string
}

/**
 * Phase 2 B3.1 / R2-378：學習路徑節點圖
 * 資料來源 learn-curriculum（入門→進階→專家），視覺化課程進度與前置關係
 */
export function LearningRoadmap({ className = '', currentCourseId }: LearningRoadmapProps) {
  const [progress, setProgress] = useState<Record<string, ProgressEntry>>({})
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'wine' | 'spirits' | 'cocktail' | 'beer' | 'certification' | 'other'>('all')
  const [mounted, setMounted] = useState(false)

  const COURSE_NODES = useMemo(() => getCurriculumNodes(), [])

  useEffect(() => {
    setMounted(true)
    setProgress(loadProgress())
  }, [])

  // 計算課程狀態（完成 / 進行中 / 可解鎖 / 鎖定）
  const courseStates = useMemo(() => {
    const states: Record<string, 'locked' | 'available' | 'in-progress' | 'completed'> = {}
    COURSE_NODES.forEach(course => {
      const courseProgress = progress[course.id]
      if (courseProgress && courseProgress.completed >= courseProgress.total) {
        states[course.id] = 'completed'
        return
      }
      if (courseProgress && courseProgress.completed > 0) {
        states[course.id] = 'in-progress'
        return
      }
      if (course.prerequisites.length > 0) {
        const allPrereqsCompleted = course.prerequisites.every(prereq => {
          const prereqProgress = progress[prereq]
          return prereqProgress && prereqProgress.completed >= prereqProgress.total
        })
        states[course.id] = allPrereqsCompleted ? 'available' : 'locked'
      } else {
        states[course.id] = 'available'
      }
    })
    return states
  }, [progress, COURSE_NODES])

  const filteredCourses = useMemo(() => {
    if (selectedCategory === 'all') return COURSE_NODES
    return COURSE_NODES.filter(c => c.category === selectedCategory)
  }, [selectedCategory, COURSE_NODES])

  const coursesByLevel = useMemo(() => {
    const levels: Record<CourseLevel, CurriculumNode[]> = {
      beginner: [],
      intermediate: [],
      expert: [],
    }
    filteredCourses.forEach(course => {
      levels[course.level].push(course)
    })
    return levels
  }, [filteredCourses])

  const stats = useMemo(() => {
    const completed = Object.values(courseStates).filter(s => s === 'completed').length
    const total = COURSE_NODES.length
    return { completed, total, percentage: total ? Math.round((completed / total) * 100) : 0 }
  }, [courseStates, COURSE_NODES.length])

  if (!mounted) return null

  const levelLabels: Record<CourseLevel, { label: string; icon: typeof BookOpen; color: string }> = {
    beginner: { label: '入門', icon: BookOpen, color: 'text-emerald-400' },
    intermediate: { label: '進階', icon: Star, color: 'text-amber-400' },
    expert: { label: '專家', icon: Trophy, color: 'text-primary-400' },
  }

  const categories = [
    { id: 'all', label: '全部' },
    { id: 'wine', label: '葡萄酒' },
    { id: 'spirits', label: '烈酒' },
    { id: 'cocktail', label: '調酒' },
    { id: 'beer', label: '啤酒' },
    { id: 'certification', label: '認證' },
    { id: 'other', label: '其他' },
  ]

  return (
    <div className={`${className}`}>
      {/* 頂部統計 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">學習路線圖</h2>
          <p className="text-white/60 text-sm">系統化規劃你的品酒學習旅程</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary-400">{stats.percentage}%</div>
          <div className="text-white/50 text-xs">{stats.completed}/{stats.total} 完成</div>
        </div>
      </div>

      {/* 進度條 */}
      <div className="h-2 rounded-full bg-white/10 mb-6 overflow-hidden">
        <m.div
          className="h-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${stats.percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* 類別篩選 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id as typeof selectedCategory)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 路線圖 */}
      <div className="space-y-8">
        {(Object.entries(coursesByLevel) as [CourseLevel, CurriculumNode[]][]).map(([level, courses]) => {
          if (courses.length === 0) return null
          const levelInfo = levelLabels[level]
          const LevelIcon = levelInfo.icon

          return (
            <div key={level}>
              <div className="flex items-center gap-2 mb-3">
                <LevelIcon className={`w-5 h-5 ${levelInfo.color}`} />
                <h3 className={`text-lg font-semibold ${levelInfo.color}`}>{levelInfo.label}</h3>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {courses.map((course, idx) => {
                    const state = courseStates[course.id]
                    const isCurrent = course.id === currentCourseId
                    const progressData = progress[course.id]
                    const progressPct = progressData 
                      ? Math.round((progressData.completed / progressData.total) * 100)
                      : 0

                    return (
                      <m.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        {state === 'locked' ? (
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5 opacity-50 cursor-not-allowed">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Lock className="w-4 h-4 text-white/40" />
                                  <span className="text-white/40 text-sm font-medium">{course.shortTitle}</span>
                                </div>
                                <p className="text-white/30 text-xs">{course.duration}</p>
                                {course.prerequisites.length > 0 && (
                                  <p className="text-white/30 text-xs mt-1">需先完成：{course.prerequisites.slice(0, 2).map(pid => COURSE_NODES.find(c => c.id === pid)?.shortTitle ?? pid).join('、')}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Link
                            href={`/learn/${course.id}`}
                            className={`group block p-4 rounded-xl border transition-all duration-200 ${
                              isCurrent
                                ? 'bg-primary-500/20 border-primary-500/50 ring-2 ring-primary-500/30'
                                : state === 'completed'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15 roadmap-node-glow'
                                  : state === 'in-progress'
                                    ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15 roadmap-node-glow'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {state === 'completed' && (
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                      <Check className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                  <span className={`text-sm font-medium truncate ${
                                    state === 'completed' ? 'text-emerald-300' : 'text-white'
                                  }`}>
                                    {course.shortTitle}
                                  </span>
                                </div>
                                <p className="text-white/50 text-xs mb-2">{course.duration}</p>
                                
                                {/* 進度條 */}
                                {(state === 'in-progress' || state === 'completed') && (
                                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                                    <m.div
                                      className={`h-full rounded-full ${
                                        state === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                                      }`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${progressPct}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                              <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                                state === 'completed' ? 'text-emerald-400' : 'text-white/40 group-hover:text-white group-hover:translate-x-1'
                              }`} />
                            </div>
                          </Link>
                        )}
                      </m.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LearningRoadmap
