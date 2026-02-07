'use client'

/** P1-083：Avatar 組件 — 圖片、首字母 fallback、可選在線狀態/等級徽章 */
import Image from 'next/image'

export interface AvatarProps {
  src?: string | null
  alt?: string
  /** 無圖時顯示的首字母（如用戶名首字） */
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
  /** 在線狀態：綠點 */
  online?: boolean
  className?: string
}

const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' } as const

export function Avatar({ src, alt = '', fallback = '?', size = 'md', online, className = '' }: AvatarProps) {
  const sizeClass = sizeMap[size]

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size === 'lg' ? 48 : size === 'md' ? 40 : 32}
          height={size === 'lg' ? 48 : size === 'md' ? 40 : 32}
          className={`rounded-full object-cover ${sizeClass}`}
        />
      ) : (
        <span
          className={`rounded-full bg-primary-500/40 border border-white/20 flex items-center justify-center font-bold text-white/90 ${sizeClass}`}
          aria-hidden
        >
          {fallback.charAt(0).toUpperCase()}
        </span>
      )}
      {online != null && (
        <span
          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-[var(--background)] ${online ? 'bg-success' : 'bg-white/30'}`}
          aria-hidden
        />
      )}
    </div>
  )
}
