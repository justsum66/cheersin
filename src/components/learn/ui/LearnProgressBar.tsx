'use client'

import { memo } from 'react'
import { m, useTransform, type MotionValue } from 'framer-motion'

interface LearnProgressBarProps {
  scrollProgress: number
}

/** 頂部固定閱讀進度條 - 從 LearnCourseContent 拆分 */
function LearnProgressBarComponent({ scrollProgress }: LearnProgressBarProps) {
  return (
    <m.div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <m.div
        className="h-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-400 shadow-lg shadow-primary-500/30"
        style={{ width: `${scrollProgress}%` }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      />
    </m.div>
  )
}

export const LearnProgressBar = memo(LearnProgressBarComponent)
export default LearnProgressBar
