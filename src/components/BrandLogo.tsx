'use client'

import Image from 'next/image'
import Link from 'next/link'

const LOGO_SRC = '/logo.png'
const BRAND_NAME = 'Cheersin'
const BRAND_TAGLINE = 'Sensory Lab'

export type BrandLogoVariant = 'nav' | 'compact' | 'header' | 'footer'

interface BrandLogoProps {
  /** 用於導航列（含 tagline、連結回首頁） */
  variant?: BrandLogoVariant
  /** 是否包成連結（預設 nav 為 true） */
  href?: string | null
  /** 額外 class */
  className?: string
  /** 圖片尺寸（nav 預設 40） */
  size?: number
}

/**
 * 品牌 LOGO 統一元件：全站一致使用 logo.png + 「Cheersin」字樣
 * - nav：導航用，含 tagline、懸停發光、連結回首頁
 * - compact：僅圖+品牌名，無 tagline
 * - header：頁面標題用，較小
 * - footer：頁尾用，低對比
 */
export function BrandLogo({
  variant = 'nav',
  href = undefined,
  className = '',
  size = variant === 'compact' || variant === 'header' ? 32 : 40,
}: BrandLogoProps) {
  const useLink = href !== undefined ? !!href : variant === 'nav'
  const to = href ?? (variant === 'nav' ? '/' : undefined)
  const showTagline = variant === 'nav'
  const isCompact = variant === 'compact' || variant === 'header'

  const content = (
    <span className={`brand-logo inline-flex items-center gap-2 sm:gap-3 ${className}`}>
      <span
        className={`
          relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-xl
          border border-white/10 transition-all duration-300
          ${variant === 'nav' ? 'bg-white/5 group-hover:shadow-glow-secondary group-hover:border-secondary-500/30' : 'bg-white/5'}
          ${variant === 'footer' ? 'border-white/5' : ''}
        `}
        style={{ width: size, height: size }}
      >
        <Image
          src={LOGO_SRC}
          alt={BRAND_NAME}
          width={size}
          height={size}
          className="relative z-10 w-full h-full object-contain p-0.5"
          priority={variant === 'nav'}
          fetchPriority={variant === 'nav' ? 'high' : undefined}
        />
      </span>
      <span className="flex flex-col">
        <span
          className={`
            font-display font-bold tracking-tight text-white
            ${isCompact ? 'text-base' : 'text-xl'}
            ${variant === 'footer' ? 'text-white/80' : ''}
          `}
        >
          {BRAND_NAME}
          <span className="text-primary-500">.</span>
        </span>
        {showTagline && (
          <span className="text-[10px] text-white/40 -mt-0.5 tracking-[0.2em] uppercase">
            {BRAND_TAGLINE}
          </span>
        )}
      </span>
    </span>
  )

  if (useLink && to) {
    return (
      <Link
        href={to}
        className="group flex items-center outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950 rounded-lg"
        aria-label={`${BRAND_NAME} 首頁`}
      >
        {content}
      </Link>
    )
  }

  return content
}

export { BRAND_NAME, LOGO_SRC }
