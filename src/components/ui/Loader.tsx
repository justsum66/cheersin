'use client'

/**
 * P1-076：統一加載動畫（Spinner），全站一致使用此組件。
 */
export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
}

export function Loader({ size = 'md', className = '' }: LoaderProps) {
  return (
    <div
      className={`rounded-full border-primary-500/30 border-t-primary-400 animate-spin ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="載入中"
    />
  )
}
