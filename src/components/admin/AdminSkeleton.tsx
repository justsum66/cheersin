'use client'

/** Admin 載入中骨架屏 — 用於用戶/知識庫/使用頁 */
export function AdminSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-lg bg-white/10" />
      <div className="h-10 w-full max-w-md rounded-lg bg-white/10" />
      <div className="h-32 w-full rounded-xl bg-white/5 border border-white/10" />
      <div className="h-24 w-full rounded-xl bg-white/5 border border-white/10" />
      <div className="h-24 w-full rounded-xl bg-white/5 border border-white/10" />
    </div>
  )
}
