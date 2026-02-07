'use client'

import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

/** GAMES_500 #11：與 games loading.tsx 一致的骨架，供 GamesPageDynamic Suspense fallback 使用 */
export default function GamesLoadingFallback() {
  return (
    <div
      className="min-h-screen bg-dark-950 pt-4 px-4 pb-16 relative overflow-hidden games-content safe-area-px safe-area-pb"
      style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 100%)' }}
      role="progressbar"
      aria-label="載入中"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-500/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary-500/5 rounded-full blur-[80px]" />
      </div>
      <div className="relative max-w-7xl mx-auto space-y-6">
        <div className="flex justify-center mb-2">
          <Skeleton className="h-12 w-12 rounded-xl" aria-hidden />
        </div>
        <div className="text-center mb-4">
          <Skeleton className="h-10 w-48 mx-auto rounded-lg" aria-hidden />
          <Skeleton className="h-5 w-64 max-w-full mx-auto mt-2 rounded" aria-hidden />
        </div>
        <div className="flex justify-center mb-4">
          <Skeleton className="h-12 w-full max-w-sm rounded-xl" aria-hidden />
        </div>
        <div className="flex gap-2 justify-center mb-4 flex-wrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-24 rounded-t-xl" aria-hidden />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <SkeletonCard key={i} className="h-36" />
          ))}
        </div>
      </div>
    </div>
  )
}
