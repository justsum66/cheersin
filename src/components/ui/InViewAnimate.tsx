'use client'

import { motion, useReducedMotion } from 'framer-motion'

/** 元素入場動畫（115）；任務 17：prefers-reduced-motion 時無入場動畫 */
/** Phase 1 B4.1: 增強滾動觸發淡入動畫效果 */
export function InViewAnimate({
  children,
  className = '',
  delay = 0,
  y = 16,
  once = true,
  amount = 0.2,
  duration = 0.5,
  reducedMotion: reducedMotionProp,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
  amount?: number
  duration?: number
  /** 由外部傳入或內部 useReducedMotion；為 true 時不播放入場動畫 */
  reducedMotion?: boolean
}) {
  const systemReduced = useReducedMotion()
  const reducedMotion = reducedMotionProp ?? !!systemReduced
  /* Phase 1 B1.2: 卡片 stagger 動畫優化 - 更明顯的入場效果 */
  const initial = reducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y, scale: 0.97 }
  const whileInView = reducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }
  return (
    <motion.div
      initial={initial}
      whileInView={whileInView}
      viewport={{ once, amount }}
      transition={{ 
        duration: reducedMotion ? 0 : duration, 
        delay: reducedMotion ? 0 : delay, 
        ease: [0.22, 1, 0.36, 1],
        scale: { type: 'spring', stiffness: 400, damping: 25 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
