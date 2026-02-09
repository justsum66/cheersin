'use client'

import { motion } from 'framer-motion'
import { SkeletonCard, SkeletonText } from '@/components/ui/Skeleton'

/** R2-039：頁面切換過渡 — 淡入；48 骨架屏優化首屏體驗 */
export default function Loading() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      role="progressbar"
      aria-label="載入中"
      className="min-h-[60vh] min-h-screen pt-12 px-4 pb-16 relative overflow-hidden safe-area-px"
      style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-500/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary-500/5 rounded-full blur-[80px]" />
      </div>
      <div className="relative max-w-4xl mx-auto space-y-8">
        <div className="h-8 w-48 min-w-[192px]">
          <SkeletonCard className="h-full rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard className="min-h-[140px]" />
          <SkeletonCard className="min-h-[140px]" />
          <SkeletonCard className="min-h-[140px]" />
        </div>
        <SkeletonText lines={5} className="max-w-2xl min-h-[120px]" />
      </div>
    </motion.main>
  )
}

