'use client'

/**
 * P1-080：帶有漸變或品牌元素的自定義分割線，取代單調的 <hr>。
 */
export interface DividerProps {
  /** 是否使用品牌漸變（深酒紅→香檳金） */
  gradient?: boolean
  className?: string
}

export function Divider({ gradient = true, className = '' }: DividerProps) {
  if (gradient) {
    return (
      <hr
        className={`border-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent ${className}`}
        aria-hidden
      />
    )
  }
  return (
    <hr
      className={`border-0 h-px bg-white/10 ${className}`}
      aria-hidden
    />
  )
}
