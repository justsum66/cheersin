'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { m , AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HOME_TESTIMONIALS } from '@/data/home-testimonials'
import { HOME_TESTIMONIALS_INTERVAL_MS } from '@/config/home.config'

/** Testimonials 輪播：H35 間隔可配置；H49 鍵盤左右鍵切換；A-11 前/後鈕 feedback 即時（過渡中短暫 disabled） */
export default function HomeTestimonialsCarousel() {
  const [index, setIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const isTransitioningRef = useRef(false)
  const touchStartX = useRef(0)
  const reducedMotion = useReducedMotion()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const regionRef = useRef<HTMLDivElement>(null)

  isTransitioningRef.current = isTransitioning
  const len = HOME_TESTIMONIALS.length
  const go = useCallback(
    (dir: 1 | -1) => {
      if (isTransitioningRef.current) return
      setIsTransitioning(true)
      setIndex((i) => (i + dir + len) % len)
      const d = reducedMotion ? 0 : 300
      if (d > 0) setTimeout(() => setIsTransitioning(false), d)
      else setIsTransitioning(false)
    },
    [len, reducedMotion]
  )

  useEffect(() => {
    if (reducedMotion) return
    intervalRef.current = setInterval(() => go(1), HOME_TESTIMONIALS_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [go, reducedMotion])

  /** H49：輪播鍵盤可操作 — ArrowLeft/ArrowRight 切換 */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(1)
      }
    },
    [go]
  )

  const t = HOME_TESTIMONIALS[index]

  return (
    <div
      ref={regionRef}
      className="overflow-hidden py-4"
      role="region"
      aria-label="精選用戶評價"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div
        className="relative touch-pan-y"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX
        }}
        onTouchEnd={(e) => {
          const endX = e.changedTouches[0]?.clientX ?? 0
          const dx = endX - touchStartX.current
          if (Math.abs(dx) > 40) {
            if (dx > 0) go(-1)
            else go(1)
          }
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
            className="flex-shrink-0 w-full max-w-[320px] mx-auto rounded-xl border border-white/10 bg-white/[0.04] p-4"
          >
            <p className="text-white/90 text-sm leading-relaxed mb-3">「{t.text}」</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">{t.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">
                {t.tag}
              </span>
            </div>
          </m.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-2 mt-4" aria-busy={isTransitioning}>
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={isTransitioning}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 transition-colors games-touch-target flex items-center justify-center games-focus-ring disabled:opacity-50 disabled:pointer-events-none"
            aria-label="上一則"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1.5" role="tablist" aria-label="評價頁籤">
            {HOME_TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                onClick={() => {
                  if (isTransitioning || i === index) return
                  setIsTransitioning(true)
                  setIndex(i)
                  const d = reducedMotion ? 0 : 300
                  if (d > 0) setTimeout(() => setIsTransitioning(false), d)
                  else setIsTransitioning(false)
                }}
                disabled={isTransitioning}
                className="games-touch-target flex items-center justify-center rounded-full games-focus-ring p-2 disabled:opacity-70"
                aria-label={`第 ${i + 1} 則`}
              >
                <span className={`h-2 rounded-full transition-all block ${i === index ? 'w-6 bg-primary-500' : 'w-2 bg-white/30'}`} aria-hidden />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={isTransitioning}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 transition-colors games-touch-target flex items-center justify-center games-focus-ring disabled:opacity-50 disabled:pointer-events-none"
            aria-label="下一則"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
