/** P1-028：Icon 組件庫 — 統一管理 lucide 圖標尺寸與顏色 */
import type { LucideIcon } from 'lucide-react'
import * as Lucide from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  chevronRight: Lucide.ChevronRight,
  chevronDown: Lucide.ChevronDown,
  star: Lucide.Star,
  heart: Lucide.Heart,
  share2: Lucide.Share2,
  users: Lucide.Users,
  wine: Lucide.Wine,
  sparkles: Lucide.Sparkles,
  gamepad2: Lucide.Gamepad2,
  messageCircle: Lucide.MessageCircle,
  graduationCap: Lucide.GraduationCap,
  sun: Lucide.Sun,
  moon: Lucide.Moon,
  menu: Lucide.Menu,
  x: Lucide.X,
  check: Lucide.Check,
  alertCircle: Lucide.AlertCircle,
  info: Lucide.Info,
}

export type IconName = keyof typeof iconMap

export interface IconProps {
  name: IconName
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-hidden'?: boolean
}

const sizeClass = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' } as const

export function Icon({ name, size = 'md', className = '', 'aria-hidden': ariaHidden = true }: IconProps) {
  const LucideIcon = iconMap[name]
  if (!LucideIcon) return null
  return (
    <LucideIcon
      className={`${sizeClass[size]} shrink-0 ${className}`}
      aria-hidden={ariaHidden}
    />
  )
}
