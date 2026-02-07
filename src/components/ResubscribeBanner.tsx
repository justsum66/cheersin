'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw, X } from 'lucide-react'
import { isWithinResubscribeWindow } from '@/lib/subscription-retention'

/** E32：取消後挽留窗內顯示橫幅；文案可 A/B；CTA 連 /pricing 或專屬優惠 */
export default function ResubscribeBanner() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setShow(isWithinResubscribeWindow())
  }, [])

  if (!show || dismissed) return null

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 bg-primary-500/10 border-b border-primary-500/30 text-sm"
      role="region"
      aria-label="重新訂閱優惠"
    >
      <div className="flex items-center gap-2 min-w-0">
        <RotateCcw className="w-4 h-4 text-primary-400 shrink-0" aria-hidden />
        <span className="text-white/90 truncate">
          限時回來享首月優惠 — 重新訂閱再送 7 天
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/pricing" className="btn-primary min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-sm py-2 px-4">
          重新訂閱
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="關閉"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
