'use client'

import { m } from 'framer-motion'
import { SkeletonCard, SkeletonText } from '@/components/ui/Skeleton'
import { TriviaLoader } from '@/components/ui/TriviaLoader'

/** R2-039：頁面切換過渡 — 淡入；48 骨架屏優化首屏體驗 */
export default function Loading() {
  return (
    <m.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      role="progressbar"
      aria-label="載入中"
      className="min-h-screen flex items-center justify-center relative overflow-hidden safe-area-px"
      style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-500/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary-500/5 rounded-full blur-[80px]" />
      </div>
      <TriviaLoader />
    </m.main>
  )
}

