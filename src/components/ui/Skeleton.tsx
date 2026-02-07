'use client'

/** H90 骨架屏：漸變閃爍動畫；N-Skeleton-01 / A-05 RWD、不 CLS、不閃爍；任務 64 品牌色 primary/10 */
/** Phase 1 A5.2: Loading skeleton 脈衝動畫優化 */
export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl bg-primary-500/10 skeleton-shimmer-enhanced min-h-[1rem] ${className}`}
      style={style}
      aria-hidden
    />
  )
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 min-w-0 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 min-h-4 w-full" style={{ width: i === lines - 1 && lines > 1 ? '75%' : undefined }} />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 overflow-hidden min-w-0 max-w-full ${className}`}>
      <Skeleton className="h-40 min-h-40 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 min-h-5 w-3/4" />
        <SkeletonText lines={2} />
      </div>
    </div>
  )
}
