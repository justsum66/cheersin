
import { memo } from 'react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

/**
 * P1-079：風格統一的標籤組件，用於遊戲卡片、課程狀態、用戶等級等。
 * Task #53: 使用 React.memo 優化列表渲染性能
 */
export interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md'
  className?: string
  title?: string
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-white/10 text-white/90 border-white/20',
  primary: 'bg-primary-500/20 text-primary-300 border-primary-500/40',
  secondary: 'bg-secondary-500/20 text-secondary-300 border-secondary-500/40',
  accent: 'bg-accent-500/20 text-accent-300 border-accent-500/40',
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  error: 'bg-red-500/20 text-red-300 border-red-500/40',
}

const sizeClasses = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
}

import { m, useReducedMotion } from 'framer-motion'

function BadgeInner({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  title,
  shimmer = false,
  pulse = false,
}: BadgeProps & { shimmer?: boolean; pulse?: boolean }) {
  const reducedMotion = useReducedMotion()
  
  return (
    <m.span
      className={cn(
        `inline-flex items-center font-medium rounded-full border relative overflow-hidden ${variantClasses[variant]} ${sizeClasses[size]}`,
        className
      )}
      role="status"
      title={title}
      whileHover={reducedMotion ? undefined : { scale: 1.05 }}
      whileTap={reducedMotion ? undefined : { scale: 0.95 }}
      animate={pulse && !reducedMotion ? {
        scale: [1, 1.05, 1],
      } : {}}
      transition={pulse && !reducedMotion ? {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      } : {}}
    >
      {shimmer && (
        <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
      {children}
    </m.span>
  )
}

export const Badge = memo(BadgeInner)

export default Badge;
