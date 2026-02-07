'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'

/**
 * UX_LAYOUT_200 #144 #145：空狀態插畫或圖示+文案，可選下一步 CTA
 * P3 任務 65：icon 與 ErrorFallback 插畫/Icon 風格一致（簡約、同色系 text-white/40）
 * 用於：空搜尋、空篩選、尚無通知、尚無歷史等
 */
export interface EmptyStateProps {
  /** 圖示或插畫（lucide icon 或 img） */
  icon?: ReactNode
  /** 主標題 */
  title: string
  /** 說明文案 */
  description?: string
  /** 主要 CTA：{ href, label } 或自訂 ReactNode */
  action?: { href: string; label: string } | ReactNode
  /** 次要 CTA（可選） */
  secondaryAction?: { href: string; label: string }
  /** 額外 class */
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  /* N-EmptyState-01 RWD 文案/插畫；N-EmptyState-02 CTA 48px、焦點環 */
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-8 px-4 max-w-full min-w-0 safe-area-px ${className}`}
      role="status"
      aria-label={title}
    >
      {icon && (
        <div className="mb-4 text-white/40 [&>svg]:w-12 [&>svg]:h-12 [&>svg]:max-w-full" aria-hidden>
          {icon}
        </div>
      )}
      <h3 className="text-base md:text-lg font-semibold text-white mb-1 px-2">{title}</h3>
      {description && (
        <p className="text-white/60 text-sm max-w-sm mb-6 px-2">{description}</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {action != null &&
          (typeof action === 'object' &&
          'href' in action &&
          'label' in action &&
          typeof (action as { href: string; label: string }).href === 'string' ? (
            <Link
              href={(action as { href: string; label: string }).href}
              className="btn-primary min-h-[48px] inline-flex items-center justify-center gap-2 btn-icon-text-gap games-focus-ring"
            >
              {(action as { href: string; label: string }).label}
            </Link>
          ) : (
            (action as ReactNode)
          ))}
        {secondaryAction && (
          <Link
            href={secondaryAction.href}
            className="btn-ghost min-h-[48px] inline-flex items-center justify-center gap-2 btn-icon-text-gap text-sm games-focus-ring"
          >
            {secondaryAction.label}
          </Link>
        )}
      </div>
    </div>
  )
}
