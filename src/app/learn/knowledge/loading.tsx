import { Skeleton } from '@/components/ui/Skeleton'

/** 知識頁：路由層 loading skeleton（task 66, 99） */
export default function KnowledgeLoading() {
  return (
    <main className="min-h-screen px-4 pt-0 pb-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <Skeleton className="h-10 w-32 rounded" />
        <div>
          <Skeleton className="h-9 w-48 mb-2 rounded-lg" />
          <Skeleton className="h-5 w-full max-w-md rounded" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-24 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-28 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-24 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
