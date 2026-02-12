'use client'

import { SkeletonCard, SkeletonText } from '@/components/ui/Skeleton'

/** UX-001：登入頁載入 skeleton，無白屏 */
export default function Loading() {
  return (
    <main role="progressbar" aria-label="載入中" className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden safe-area-px" style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 100%)' }}>
      <div className="w-full max-w-md space-y-6">
        <div className="h-8 w-40 mx-auto">
          <SkeletonCard className="h-full rounded-lg" />
        </div>
        <SkeletonCard className="h-12 w-full rounded-xl" />
        <SkeletonCard className="h-12 w-full rounded-xl" />
        <SkeletonCard className="h-12 w-32 rounded-xl" />
        <SkeletonText lines={2} className="max-w-sm min-h-[48px]" />
      </div>
    </main>
  )
}
