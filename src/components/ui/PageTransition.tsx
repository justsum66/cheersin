'use client'

import dynamic from 'next/dynamic'
import { useReducedMotion } from 'framer-motion'

// P001: Dynamic import for framer-motion to reduce initial bundle
const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.div),
  { ssr: true } // Keep SSR for page transitions to avoid flash
) as typeof import('framer-motion').motion.div

/** 頁面過渡動畫（111）：framer-motion layout 流暢切換；A-01 prefers-reduced-motion 時關閉動畫 */
/** Phase 1 B1.1 & B1.3: 增強頁面轉場效果，不延遲導航 */
/** Phase 1 B3.1: 頁面轉場動畫優化 - 更流暢的過渡 */
export function PageTransition({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion()
  const initial = reducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.99 }
  const animate = { opacity: 1, y: 0, scale: 1 }
  const exit = reducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -6, scale: 1.005 }
  const transition = reducedMotion 
    ? { duration: 0 } 
    : { 
        duration: 0.35, 
        ease: [0.22, 1, 0.36, 1] as const,
        opacity: { duration: 0.25 },
        y: { type: 'spring' as const, stiffness: 500, damping: 35 }
      }
  return (
    <MotionDiv
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      className={className}
    >
      {children}
    </MotionDiv>
  )
}
