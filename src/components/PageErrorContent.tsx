'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

/**
 * DEDUP #7：頁級錯誤共用版面 — 與 ErrorFallback / EmptyState 風格一致
 * 用於 app/error.tsx、quiz/error.tsx、learn/error.tsx，避免重複 layout
 */
export interface PageErrorContentProps {
  /** 主標題 */
  title: string
  /** 說明文案 */
  description: string
  /** 重試 callback（由 Next error boundary reset 傳入） */
  onRetry?: () => void
  /** 主要按鈕文案（有 onRetry 時顯示） */
  retryLabel?: string
  /** 連結：{ href, label }[]，顯示為 btn-ghost / btn-secondary */
  links?: { href: string; label: string }[]
  /** 額外 class（如 gradient 背景） */
  className?: string
  /** 按鈕下方額外區塊（如客服連結） */
  footer?: ReactNode
}

export function PageErrorContent({
  title,
  description,
  onRetry,
  retryLabel = '重新載入',
  links = [],
  className = '',
  footer,
}: PageErrorContentProps) {
  return (
    <main
      className={`min-h-screen px-4 py-16 flex items-center justify-center safe-area-px ${className}`}
      role="alert"
      aria-label={title}
    >
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-400" aria-hidden>
          <AlertCircle className="w-12 h-12" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white mb-2">{title}</h1>
          <p className="text-red-400/90 text-sm">{description}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="btn-primary min-h-[48px] games-touch-target games-focus-ring"
            >
              {retryLabel}
            </button>
          )}
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="btn-ghost min-h-[48px] inline-flex items-center justify-center games-touch-target games-focus-ring rounded"
            >
              {label}
            </Link>
          ))}
        </div>
        {footer && <div className="pt-2">{footer}</div>}
      </div>
    </main>
  )
}
