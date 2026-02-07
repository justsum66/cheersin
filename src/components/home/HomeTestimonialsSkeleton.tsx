/** RSC-compatible 骨架：精選評價 | Phase 1 B3.2: 增加 shimmer 效果 */
export default function HomeTestimonialsSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div key={i} className="min-w-[280px] flex-shrink-0 rounded-xl border border-white/10 bg-white/5 h-24 shimmer" />
      ))}
    </div>
  )
}
