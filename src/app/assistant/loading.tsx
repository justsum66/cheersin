import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

/** AI 侍酒師頁：載入時佔位（對話列 + 氣泡骨架） */
export default function Loading() {
  return (
    <div className="min-h-screen bg-dark-950 pt-4 px-4 pb-32 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-500/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary-500/5 rounded-full blur-[80px]" />
      </div>
      <div className="relative max-w-3xl mx-auto space-y-6">
        <div className="h-14 rounded-xl bg-white/5 border border-white/10" />
        <div className="flex justify-start">
          <Skeleton className="h-20 w-3/4 max-w-sm rounded-2xl rounded-bl-md" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-24 w-4/5 max-w-md rounded-2xl rounded-br-md" />
        </div>
        <div className="flex justify-start">
          <SkeletonText lines={3} className="max-w-sm" />
        </div>
      </div>
    </div>
  )
}
