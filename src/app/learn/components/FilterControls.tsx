'use client'

import { useState } from 'react'
import { Search, Share2, ChevronRight } from 'lucide-react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useTranslation } from '@/contexts/I18nContext'

type CourseLevel = 'beginner' | 'intermediate' | 'expert'
type ViewMode = 'card' | 'list'

interface FilterControlsProps {
  levelFilter: CourseLevel | 'all'
  setLevelFilter: (level: CourseLevel | 'all') => void
  certFilter: string
  setCertFilter: (cert: string) => void
  quickOnly: boolean
  setQuickOnly: (quick: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  filteredCoursesLength: number
  /** CLEAN: Per-level course counts to avoid window.COURSES global access */
  courseCounts?: Record<string, number>
  isFiltering?: boolean
  deferredSearch?: string
  showShareFilter?: boolean
  showClearFilters?: boolean
  onClearAllFilters?: () => void
  onShareFilters?: () => void
  levelLabels?: Record<CourseLevel, string>
  certOptions?: string[]
  showViewToggle?: boolean
  showQuickFilter?: boolean
}

const DEFAULT_LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: '入門',
  intermediate: '進階',
  expert: '專家',
};

const DEFAULT_CERT_OPTIONS = ['all', 'WSET', 'CMS', 'MW'];

export default function FilterControls({
  levelFilter,
  setLevelFilter,
  certFilter,
  setCertFilter,
  quickOnly,
  setQuickOnly,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  filteredCoursesLength,
  courseCounts,
  isFiltering = false,
  deferredSearch = '',
  showShareFilter = false,
  showClearFilters = false,
  onClearAllFilters,
  onShareFilters,
  levelLabels = DEFAULT_LEVEL_LABELS,
  certOptions = DEFAULT_CERT_OPTIONS,
  showViewToggle = true,
  showQuickFilter = true,
}: FilterControlsProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const LEVEL_TABS = ['all', 'beginner', 'intermediate', 'expert'] as const

  const handleShareFilters = async () => {
    if (onShareFilters) {
      onShareFilters()
      return
    }

    const params = new URLSearchParams()
    if (levelFilter !== 'all') params.set('level', levelFilter)
    if (certFilter !== 'all') params.set('cert', certFilter)
    if (quickOnly) params.set('quick', '1')
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    const url = params.toString() ? `${window.location.origin}${pathname}?${params}` : `${window.location.origin}${pathname}`
    
    try {
      await navigator.clipboard.writeText(url)
    } catch { /* fallback ignored */ }
  }

  const handleClearAllFilters = () => {
    if (onClearAllFilters) {
      onClearAllFilters()
      return
    }
    setSearchQuery('')
    setLevelFilter('all')
    setCertFilter('all')
    setQuickOnly(false)
  }

  return (
    <>
      {/* Search and Action Controls */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" aria-hidden />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋課程名稱或描述"
            className="w-full pl-10 pr-10 py-3 min-h-[48px] rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
            aria-label="搜尋課程名稱或描述"
            aria-busy={searchQuery !== deferredSearch}
          />
          {searchQuery === deferredSearch && searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-2 rounded min-h-[48px] min-w-[48px] inline-flex items-center justify-center games-focus-ring"
              aria-label="清除搜尋"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          )}
        </div>
        
        {(showShareFilter || showClearFilters) && (
          <>
            {showShareFilter && (
              <button
                type="button"
                onClick={handleShareFilters}
                className="min-h-[48px] px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white shrink-0 transition-all games-focus-ring flex items-center gap-2"
                aria-label="複製篩選連結"
                title="複製篩選連結"
              >
                <Share2 className="w-4 h-4" aria-hidden />
                分享篩選
              </button>
            )}
            
            {showClearFilters && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="min-h-[48px] px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white/90 text-sm font-medium hover:bg-white/15 active:scale-[0.98] shrink-0 transition-all games-focus-ring"
                aria-label="清除所有篩選"
              >
                清除篩選
              </button>
            )}
          </>
        )}
      </div>

      {/* Level Filters */}
      <div className="mb-4">
        <p id="learn-level-label" className="text-white/50 text-xs mb-2 text-center sm:text-left">等級</p>
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 mb-4 overflow-x-auto scrollbar-hide pb-1">
          {LEVEL_TABS.map((level, idx) => {
            const count = level === 'all' 
              ? (courseCounts?.['all'] ?? filteredCoursesLength)
              : (courseCounts?.[level] ?? 0)
            return (
              <button
                key={level}
                type="button"
                role="tab"
                aria-selected={levelFilter === level}
                tabIndex={levelFilter === level ? 0 : -1}
                onClick={() => setLevelFilter(level)}
                className={`min-h-[48px] px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:outline-none touch-manipulation active:scale-[0.97] ${
                  levelFilter === level 
                    ? 'bg-primary-500/30 border border-primary-500/50 text-white' 
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                {level === 'all' ? `全部 ${count}` : `${levelLabels[level as CourseLevel]} ${count}`}
              </button>
            )
          })}
        </div>
      </div>

      {/* Certification Filters */}
      <div className="mb-6">
        <p className="text-white/50 text-xs mb-2 text-center sm:text-left">認證</p>
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
          {certOptions.map((cert) => {
            return (
              <button
                key={cert}
                type="button"
                onClick={() => setCertFilter(cert)}
                aria-pressed={certFilter === cert}
                className={`min-h-[48px] px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 games-focus-ring touch-manipulation active:scale-[0.97] ${
                  certFilter === cert 
                    ? 'bg-slate-600/50 border border-slate-500/50 text-white' 
                    : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/[0.07]'
                }`}
              >
                {cert === 'all' ? '認證' : cert}
              </button>
            )
          })}
        </div>
      </div>

      {/* Quick Filter and View Toggle */}
      {showQuickFilter && (
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch">
          <div className="flex-1 min-w-0 sm:min-w-[200px] p-4 md:p-5 rounded-xl bg-primary-500/10 border border-primary-500/20">
            <p className="text-primary-400 text-xs font-semibold uppercase tracking-wider mb-1">推薦路徑</p>
            <p className="text-primary-300 text-sm font-medium mb-1">建議學習路徑</p>
            <p className="text-white/60 text-xs md:text-sm">5 分鐘快懂 → 入門 → 進階 → 專家</p>
          </div>
          <button
            type="button"
            onClick={() => setQuickOnly(!quickOnly)}
            className={`min-h-[48px] px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 touch-manipulation active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:outline-none ${quickOnly ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/[0.07]'}`}
            aria-pressed={quickOnly}
          >
            ⚡ 只要 10 分鐘內課程
          </button>
        </div>
      )}

      {/* View Mode Toggle */}
      {showViewToggle && filteredCoursesLength > 0 && (
        <div className="flex items-center justify-end gap-2 mb-3" role="group" aria-label="檢視模式">
          <button
            type="button"
            onClick={() => setViewMode('card')}
            aria-pressed={viewMode === 'card'}
            className={`p-2 rounded-lg transition-colors games-focus-ring ${viewMode === 'card' ? 'bg-primary-500/30 text-primary-300' : 'bg-white/5 text-white/50 hover:text-white'}`}
            title="卡片檢視"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            className={`p-2 rounded-lg transition-colors games-focus-ring ${viewMode === 'list' ? 'bg-primary-500/30 text-primary-300' : 'bg-white/5 text-white/50 hover:text-white'}`}
            title="列表檢視"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      )}

      {/* Results Count */}
      <div role="region" aria-busy={isFiltering || searchQuery !== deferredSearch} aria-label="課程列表" id="learn-course-list">
        <p className="text-white/50 text-sm mb-5 md:mb-6" aria-live="polite">
          {isFiltering ? '篩選中…' : `共 ${filteredCoursesLength} 門課程`}
        </p>
      </div>
    </>
  )
}