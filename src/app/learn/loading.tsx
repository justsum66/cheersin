import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

/** 55 品酒學院載入骨架；151-155 與 Hero/Grid 對齊；29 CLS：固定尺寸避免 shift；L-318 safe-area、ARIA */
export default function LearnLoading() {
  return (
    <main className="min-h-screen px-4 pt-0 pb-8 opacity-100 transition-opacity duration-300 safe-area-px" role="progressbar" aria-label="品酒學院載入中" style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 100%)' }}>
      <div className="max-w-4xl xl:max-w-[1440px] mx-auto px-2 md:px-4 space-y-6">
        <Skeleton className="h-10 w-24 rounded min-w-[96px]" />
        {/* Hero：主標、副標；29 固定高度減少 CLS */}
        <div className="text-center space-y-3 mb-6 min-h-[88px] md:min-h-[92px] flex flex-col justify-center">
          <Skeleton className="h-9 md:h-10 w-32 mx-auto rounded-lg min-w-[128px]" />
          <Skeleton className="h-4 md:h-5 w-72 max-w-full mx-auto rounded min-w-[200px]" />
        </div>
        {/* 進度環 + 徽章 */}
        <div className="flex justify-center items-center gap-6 mb-6 min-h-[64px]">
          <Skeleton className="h-16 w-16 rounded-full shrink-0 aspect-square" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-20 rounded-full" />
            ))}
          </div>
        </div>
        {/* 篩選列 */}
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-16 rounded-full" />
          ))}
        </div>
        <div className="space-y-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="space-y-4">
              <Skeleton className="h-6 w-28 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} className="h-52" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
