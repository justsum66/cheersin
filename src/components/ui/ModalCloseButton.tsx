'use client'

import { forwardRef } from 'react'
import { X } from 'lucide-react'

/** DEDUP #2：Modal 關閉鈕共用組件 — 統一 48px 觸控區 + aria-label + games-focus-ring */
export const ModalCloseButton = forwardRef<
  HTMLButtonElement,
  {
    onClick: () => void
    'aria-label'?: string
    className?: string
  }
>(function ModalCloseButton({ onClick, 'aria-label': ariaLabel = '關閉', className = '' }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={`p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center games-focus-ring ${className}`}
      aria-label={ariaLabel}
    >
      <X className="w-5 h-5" />
    </button>
  )
})
