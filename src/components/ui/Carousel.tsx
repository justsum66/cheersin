'use client'

/** P1-077：輪播組件 — 支援前一張/下一張、圓點指示、鍵盤與 a11y */
import { useState, useCallback, useEffect } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface CarouselProps {
  /** 子元素依序為每一頁（可為任意 ReactNode） */
  children: React.ReactNode[]
  /** 是否自動輪播（ms），0 表示不自動 */
  autoPlayMs?: number
  /** 是否顯示圓點指示器 */
  showDots?: boolean
  /** 是否顯示左右箭頭 */
  showArrows?: boolean
  className?: string
}

export function Carousel({
  children,
  autoPlayMs = 0,
  showDots = true,
  showArrows = true,
  className = '',
}: CarouselProps) {
  const [index, setIndex] = useState(0)
  const total = Math.max(1, children.length)
  const safeIndex = total === 0 ? 0 : ((index % total) + total) % total

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + total) % total)
  }, [total])

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % total)
  }, [total])

  useEffect(() => {
    if (autoPlayMs <= 0 || total <= 1) return
    const id = setInterval(goNext, autoPlayMs)
    return () => clearInterval(id)
  }, [autoPlayMs, total, goNext])

  if (total === 0) return null

  return (
    <div className={`relative overflow-hidden ${className}`} role="region" aria-label="輪播">
      <div className="relative flex items-center justify-center min-h-[120px]">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={safeIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {children[safeIndex]}
          </m.div>
        </AnimatePresence>
      </div>

      {showArrows && total > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white games-focus-ring min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="上一張"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white games-focus-ring min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="下一張"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {showDots && total > 1 && (
        <div className="flex justify-center gap-2 mt-3" role="tablist" aria-label="輪播頁">
          {children.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === safeIndex}
              aria-label={`第 ${i + 1} 頁`}
              onClick={() => setIndex(i)}
              className={`min-h-[44px] min-w-[44px] rounded-full transition-colors games-focus-ring p-2 ${
                i === safeIndex ? 'bg-primary-500' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
