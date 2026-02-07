'use client'

import { useCallback, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

/** 117 下拉刷新：帶酒瓶傾倒動畫的自訂 pull-to-refresh（觸控） */
export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  threshold = 80,
}: {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  disabled?: boolean
  threshold?: number
}) {
  const y = useMotionValue(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)

  const pourProgress = useTransform(y, [0, threshold], [0, 1])
  const bottleRotate = useTransform(y, [0, threshold], [0, 35])
  const indicatorY = useTransform(y, (v) => Math.min(v, threshold * 1.2) - 70)
  const indicatorOpacity = useTransform(y, [0, 30], [0, 1])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing) return
      startY.current = e.touches[0].clientY
    },
    [disabled, isRefreshing]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing) return
      const currentY = e.touches[0].clientY
      const delta = currentY - startY.current
      if (delta > 0 && window.scrollY <= 2) {
        y.set(Math.min(delta * 0.5, threshold * 1.2))
      }
    },
    [disabled, isRefreshing, threshold, y]
  )

  const handleTouchEnd = useCallback(async () => {
    const current = y.get()
    if (current >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 })
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    } else {
      animate(y, 0, { type: 'spring', stiffness: 400, damping: 35 })
    }
  }, [threshold, isRefreshing, onRefresh, y])

  return (
    <div
      className="relative min-h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div
        className="absolute left-1/2 top-0 flex flex-col items-center pointer-events-none z-10 -translate-x-1/2"
        style={{ y: indicatorY, opacity: indicatorOpacity }}
      >
        <motion.div style={{ rotate: bottleRotate }} className="origin-bottom mb-1">
          <svg width="32" height="48" viewBox="0 0 32 48" fill="none" aria-hidden>
            <path d="M12 4h8v8l-2 20H14L12 12V4z" fill="currentColor" className="text-white/30" />
            <path d="M14 12h4v16h-4z" fill="currentColor" className="text-primary-500/80" />
          </svg>
        </motion.div>
        <motion.div
          className="h-2 w-16 rounded-b-full bg-primary-500/60 overflow-hidden origin-top"
          style={{ scaleY: pourProgress }}
        />
        <span className="text-xs text-white/50 mt-1">
          {isRefreshing ? '重新整理中…' : '放開以重新整理'}
        </span>
      </motion.div>
      {children}
    </div>
  )
}
