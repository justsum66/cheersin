'use client'

import Link from 'next/link'
import { AnimatePresence, m } from 'framer-motion'
import { ChevronLeft, Share2, Printer, Focus } from 'lucide-react'
import toast from 'react-hot-toast'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { FontSizeControl } from '@/components/ui/FontSizeControl'
import { useTranslation } from '@/contexts/I18nContext'

interface CourseHeaderProps {
  courseId: string
  title: string
  description: string
  learningObjectives?: string[]
  duration: string
  free: boolean
  totalChapters: number
  completedCount: number
  progressPct: number
  focusMode: boolean
  onToggleFocusMode: () => void
  autoSaveIndicator: boolean
}

export function CourseHeader({
  courseId,
  title,
  description,
  learningObjectives,
  duration,
  free,
  totalChapters,
  completedCount,
  progressPct,
  focusMode,
  onToggleFocusMode,
  autoSaveIndicator,
}: CourseHeaderProps) {
  const { t } = useTranslation()

  return (
    <>
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
              navigator.clipboard?.writeText(url).then(() => toast.success(t('learn.linkCopied')))
            }}
            className="min-h-[48px] px-3 inline-flex items-center gap-2 rounded-lg text-sm games-focus-ring bg-white/5 text-white/60 hover:text-white"
            title="推薦課程給好友"
          >
            <Share2 className="w-4 h-4" />
            推薦給好友
          </button>
          <button
            type="button"
            onClick={onToggleFocusMode}
            className={`min-h-[48px] px-3 inline-flex items-center gap-2 rounded-lg text-sm games-focus-ring ${
              focusMode ? 'bg-primary-500/30 text-primary-300' : 'bg-white/5 text-white/60 hover:text-white'
            }`}
            title={focusMode ? '顯示章節導航' : '專注閱讀（隱藏側邊）'}
            aria-pressed={focusMode}
          >
            <Focus className="w-4 h-4" />
            {focusMode ? '顯示導航' : '專注閱讀'}
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white mb-2 leading-tight games-heading">
              {title}
            </h1>
            <p className="text-white/60 text-sm md:text-base mb-1 leading-relaxed games-body max-w-2xl">{description}</p>
            {learningObjectives && learningObjectives.length > 0 && (
              <ul className="text-white/50 text-sm mt-3 space-y-1 list-disc list-inside games-body max-w-2xl" aria-label="本課學習目標">
                {learningObjectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            )}
            <p className="text-white/40 text-xs mt-2">快捷鍵：J / ↓ 下一章 · K / ↑ 上一章</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Phase 2 D4.2: 字體大小調整控制項 */}
            <FontSizeControl className="mr-2" />
            {/* Phase 1 D3.2: 閱讀進度自動保存指示器 */}
            <AnimatePresence>
              {autoSaveIndicator && (
                <m.div
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-sm font-medium"
                >
                  <m.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-20" />
                      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </m.div>
                  自動保存中...
                </m.div>
              )}
            </AnimatePresence>

            {/* L72：分享課程連結 */}
            <button
              type="button"
              onClick={() => {
                const url = typeof window !== 'undefined' ? `${window.location.origin}/learn/${courseId}` : ''
                navigator.clipboard
                  ?.writeText(url)
                  .then(() => toast.success(t('learn.linkCopied')))
                  .catch(() => {})
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
          {totalChapters} 章 · {duration}
          {!free && <span className="ml-2 text-primary-400">Pro</span>}
        </p>
        {/* 153 課程進度百分比；98 aria-live 進度更新 */}
        {progressPct > 0 && (
          <div className="mt-3 flex items-center gap-2 min-w-0" aria-live="polite" aria-atomic="true" aria-label={`已完成 ${progressPct}%`}>
            <div className="flex-1 min-w-0 h-2 rounded-full bg-white/10 overflow-hidden">
              <m.div
                className="h-full rounded-full bg-primary-500 progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <span className="text-sm text-primary-400 font-medium tabular-nums shrink-0">已完成 {progressPct}%</span>
          </div>
        )}
      </div>
    </>
  )
}
