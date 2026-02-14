import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

/** AST-49：與 page 視覺一致 — 同 main 背景、safe-area、cinematic 光暈、header 佔位 */
export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-dark-950 safe-area-px page-container-mobile" role="main">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>
      <div className="h-14 shrink-0 border-b border-white/5" aria-hidden />
      <div className="flex-1 overflow-hidden px-4 pt-0 pb-32">
        <div className="max-w-3xl mx-auto space-y-6 relative">
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
    </main>
  )
}
