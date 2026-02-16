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

const statusColorMap = {
  online: 'bg-success border-success/30 ring-success/20',
  offline: 'bg-white/30 border-white/10 ring-white/5',
  spectator: 'bg-blue-400 border-blue-400/30 ring-blue-400/20',
  busy: 'bg-warning border-warning/30 ring-warning/20',
}

export function Avatar({ src, alt = '', fallback = '?', size = 'md', online, status, className = '' }: AvatarProps & { status?: keyof typeof statusColorMap }) {
  const sizeClass = sizeMap[size]
  const currentStatus = status ?? (online ? 'online' : undefined)

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
      {currentStatus && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColorMap[currentStatus].split(' ')[0]}`}></span>
          <span className={`relative inline-flex rounded-full h-3 w-3 border-2 border-[var(--background)] ${statusColorMap[currentStatus].split(' ')[0]}`}></span>
        </span>
      )}
    </div>
  )
}
