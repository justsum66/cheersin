/** RSC-compatible 骨架：FAQ */
export default function HomeFAQSkeleton() {
  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-white/10 overflow-hidden p-4 flex items-center gap-3">
          <div className="h-5 w-5 shrink-0 rounded bg-white/10 animate-pulse" />
          <div className="flex-1 h-4 rounded bg-white/10 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
