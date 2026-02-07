'use client'

import type { ReactNode } from 'react'

/**
 * P1-079：風格統一的標籤組件，用於遊戲卡片、課程狀態、用戶等級等。
 */
export interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md'
  className?: string
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-white/10 text-white/90 border-white/20',
  primary: 'bg-primary-500/20 text-primary-300 border-primary-500/40',
  secondary: 'bg-secondary-500/20 text-secondary-300 border-secondary-500/40',
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  error: 'bg-red-500/20 text-red-300 border-red-500/40',
}

const sizeClasses = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      role="status"
    >
      {children}
    </span>
  )
}
