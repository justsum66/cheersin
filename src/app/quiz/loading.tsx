'use client'

import { Skeleton, SkeletonCard, SkeletonText } from '@/components/ui/Skeleton'

/** Quiz 頁 20 項優化 #11、Q-04：測驗頁載入佔位與 Quiz 視覺一致；skeleton 固定尺寸不閃爍、safe-area */
export default function Loading() {
  return (
    <main role="progressbar" aria-label="測驗載入中" className="min-h-screen quiz-hero-echo pt-12 px-4 pb-16 relative overflow-hidden safe-area-px">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-500/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary-500/5 rounded-full blur-[80px]" />
      </div>
      <div className="relative max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <Skeleton className="h-10 w-64 mx-auto rounded-lg" />
          <Skeleton className="h-5 w-48 mx-auto rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} className="h-28" />
          ))}
        </div>
        <SkeletonText lines={4} className="max-w-xl mx-auto min-h-[96px]" />
      </div>
    </main>
  )
}
