'use client'

/** P1-103：圖片加載失敗占位符 — 優雅顯示錯誤狀態，取代破碎圖標 */
import Image, { ImageProps } from 'next/image'
import { useState, type ReactNode } from 'react'

export interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallback?: ReactNode
  /** 自訂錯誤時顯示的圖標或文字 */
  errorMessage?: string
}

export function ImageWithFallback({
  fallback,
  errorMessage = '無法載入圖片',
  alt,
  className = '',
  ...rest
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)

  if (error) {
    if (fallback != null) return <>{fallback}</>
    return (
      <div
        className={`flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm gap-2 min-h-[120px] ${className}`}
        role="img"
        aria-label={alt || errorMessage}
      >
        <svg className="w-10 h-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
        </svg>
        <span>{errorMessage}</span>
      </div>
    )
  }

  return (
    <Image
      {...rest}
      alt={alt ?? ''}
      className={className}
      onError={() => setError(true)}
    />
  )
}
