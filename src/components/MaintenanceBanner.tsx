'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, ExternalLink } from 'lucide-react'

/** T017 P2：錯誤與維護公告明顯。由 NEXT_PUBLIC_MAINTENANCE=1 或 NEXT_PUBLIC_MAINTENANCE_MESSAGE 觸發；Footer 可連結狀態頁。 */
const MAINTENANCE_ENABLED = process.env.NEXT_PUBLIC_MAINTENANCE === '1'
const MAINTENANCE_MESSAGE = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE || '系統維護中，部分功能可能暫時無法使用，預計稍後恢復。'

export default function MaintenanceBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(MAINTENANCE_ENABLED)
  }, [])

  if (!show) return null

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-500/15 border-b border-amber-500/30 text-sm"
      role="region"
      aria-label="維護公告"
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" aria-hidden />
        <span className="text-white/90">{MAINTENANCE_MESSAGE}</span>
      </div>
      <Link
        href="/status"
        className="shrink-0 inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 text-sm font-medium min-h-[44px] min-w-[44px] items-center justify-center"
      >
        查看狀態
        <ExternalLink className="w-4 h-4" />
      </Link>
    </div>
  )
}
