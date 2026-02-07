/**
 * Loading 統一配置與組件
 * 定義所有 loading 狀態的樣式與行為
 */

import { Loader2 } from 'lucide-react'

/**
 * Loading Spinner 組件
 */
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      aria-hidden="true"
    />
  )
}

/**
 * Loading 全屏覆蓋
 */
export interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = '載入中...' }: LoadingOverlayProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-busy="true"
      aria-label={message}
    >
      <div className="glass-card p-6 flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" className="text-primary-400" />
        <p className="text-white text-sm font-medium">{message}</p>
      </div>
    </div>
  )
}

/**
 * Loading 骨架屏（Skeleton）
 */
export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ className = '', variant = 'text' }: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 w-full',
    circular: 'w-12 h-12 rounded-full',
    rectangular: 'w-full h-32'
  }

  return (
    <div 
      className={`animate-pulse bg-white/10 ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  )
}

/**
 * Loading 卡片骨架
 */
export function SkeletonCard() {
  return (
    <div className="glass-card p-4 space-y-3" aria-busy="true">
      <Skeleton variant="rectangular" className="h-48" />
      <Skeleton variant="text" className="h-6 w-3/4" />
      <Skeleton variant="text" className="h-4 w-full" />
      <Skeleton variant="text" className="h-4 w-5/6" />
    </div>
  )
}

/**
 * Loading 按鈕
 */
export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: React.ReactNode
}

export function LoadingButton({ 
  loading = false, 
  disabled,
  children, 
  className = '',
  ...props 
}: LoadingButtonProps) {
  return (
    <button
      disabled={loading || disabled}
      className={`relative ${className} ${loading ? 'cursor-wait' : ''}`}
      {...props}
    >
      {loading && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <LoadingSpinner size="sm" />
        </span>
      )}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </button>
  )
}

/**
 * Loading 狀態文字
 */
export const LOADING_MESSAGES = {
  DEFAULT: '載入中...',
  SAVING: '儲存中...',
  DELETING: '刪除中...',
  UPLOADING: '上傳中...',
  PROCESSING: '處理中...',
  CONNECTING: '連線中...',
  LOADING_DATA: '載入資料中...',
  GENERATING: '生成中...',
  ANALYZING: '分析中...',
  SEARCHING: '搜尋中...',
} as const
