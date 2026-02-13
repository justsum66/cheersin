'use client'

import { SkeletonCard, SkeletonText } from '@/components/ui/Skeleton'

/** UX-001：訂閱頁載入 skeleton，無白屏 */
export default function Loading() {
  return (
    <main
      role="progressbar"
      aria-label="載入中"
      className="min-h-screen pt-12 px-4 pb-16 relative overflow-hidden safe-area-px"
      style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 100%)' }}
    >
      <div className="relative max-w-4xl mx-auto space-y-8">
        <div className="h-9 w-56">
          <SkeletonCard className="h-full rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} className="min-h-[200px] rounded-xl" />
          ))}
        </div>
        <SkeletonText lines={3} className="max-w-2xl min-h-[80px]" />
      </div>
    </main>
  )
}
