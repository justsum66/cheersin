/**
 * Task 2.01: 元件庫標準化
 * 統一元件工廠 - 整合所有設計 tokens，提供一致的元件 API
 * 
 * 這個檔案就像一個元件的「中央廚房」，把所有設計規範統一起來
 */

import { designTokens } from '@/config/design-tokens'
import { themeExtend } from '@/lib/design-tokens'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================
// 按鈕元件標準化
// ============================================

export const buttonVariants = cva(
  // 基礎樣式 - 所有按鈕的共同 DNA
  [
    'inline-flex items-center justify-center',
    'rounded-lg', // 使用設計 tokens 的圓角
    'font-medium',
    'transition-all duration-200 ease-out', // 使用設計 tokens 的動畫
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'min-h-[48px]', // WCAG 2.5.5 觸控目標
    'px-6 py-3', // 使用設計 tokens 的間距
  ],
  {
    variants: {
      variant: {
        // 主要按鈕 - 品牌金色
        primary: [
          'bg-[#D4AF37] text-black hover:bg-[#b8942e]',
          'focus-visible:ring-[#D4AF37]/50',
          'shadow-lg shadow-[#D4AF37]/20 hover:shadow-xl hover:shadow-[#D4AF37]/30'
        ],
        // 次要按鈕 - 白金銀
        secondary: [
          'bg-[#E5E4E2] text-black hover:bg-[#d0cecc]',
          'focus-visible:ring-[#E5E4E2]/50'
        ],
        // 緊急按鈕 - 霓虹紅
        danger: [
          'bg-[#FF2E63] text-white hover:bg-[#db0f46]',
          'focus-visible:ring-[#FF2E63]/50',
          'shadow-lg shadow-[#FF2E63]/30 hover:shadow-xl hover:shadow-[#FF2E63]/40'
        ],
        // 幽靈按鈕 - 透明背景
        ghost: [
          'bg-transparent border border-[#D4AF37]/30 text-[#D4AF37]',
          'hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50',
          'focus-visible:ring-[#D4AF37]/30'
        ],
        // 玻璃擬態按鈕
        glass: [
          'bg-white/10 backdrop-blur-md border border-white/20',
          'text-white hover:bg-white/20 hover:border-white/30',
          'focus-visible:ring-white/30'
        ]
      },
      size: {
        sm: 'h-8 px-3 py-1.5 text-sm',
        md: 'h-10 px-4 py-2 text-base',
        lg: 'h-12 px-6 py-3 text-lg',
        xl: 'h-14 px-8 py-4 text-xl'
      },
      fullWidth: {
        true: 'w-full'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// ============================================
// 卡片元件標準化
// ============================================

export const cardVariants = cva(
  // 基礎樣式
  [
    'rounded-xl', // 使用設計 tokens 圓角
    'border border-white/10',
    'bg-gradient-to-br from-white/5 to-white/2',
    'backdrop-blur-xl',
    'shadow-xl', // 使用設計 tokens 陰影
    'transition-all duration-300 ease-out',
    'hover:shadow-2xl hover:shadow-[#D4AF37]/20',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50'
  ],
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-2xl shadow-[#000000]/30',
        glass: 'bg-white/5 border-white/20 backdrop-blur-2xl',
        neon: 'border-[#FF2E63]/30 shadow-[0_0_20px_rgba(255,46,99,0.3)]'
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

// ============================================
// 文字元件標準化
// ============================================

export const textVariants = cva('', {
  variants: {
    variant: {
      // 標題層次
      h1: 'text-4xl font-bold tracking-tight text-white',
      h2: 'text-3xl font-bold tracking-tight text-white',
      h3: 'text-2xl font-bold tracking-tight text-white',
      h4: 'text-xl font-semibold tracking-tight text-white',
      h5: 'text-lg font-semibold text-white',
      h6: 'text-base font-semibold text-white',
      
      // 內文層次
      body: 'text-base text-white/70 leading-relaxed',
      caption: 'text-sm text-white/50',
      overline: 'text-xs text-white/40 uppercase tracking-wider',
      
      // 語意文字
      success: 'text-[#00FF9D]',
      error: 'text-[#FF4D4D]',
      warning: 'text-[#FFB700]',
      info: 'text-[#4D9EFF]'
    },
    weight: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      bold: 'font-bold',
      black: 'font-black'
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify'
    }
  },
  defaultVariants: {
    variant: 'body',
    weight: 'normal',
    align: 'left'
  }
})

// ============================================
// 間距元件標準化
// ============================================

interface SpacingProps {
  size?: keyof typeof designTokens.spacing
  direction?: 'horizontal' | 'vertical' | 'both'
  className?: string
}

export const Spacing: React.FC<SpacingProps> = ({ 
  size = 4, 
  direction = 'both',
  className 
}) => {
  const spacingValue = designTokens.spacing[size] || '1rem'
  
  const styles = {
    horizontal: { width: spacingValue, height: '1px' },
    vertical: { height: spacingValue, width: '1px' },
    both: { width: spacingValue, height: spacingValue }
  }
  
  return (
    <div 
      className={cn('inline-block', className)}
      style={styles[direction]}
      aria-hidden="true"
    />
  )
}

// ============================================
// 色彩工具函數
// ============================================

export const getColor = (colorToken: string): string => {
  // 這裡可以整合所有色彩 tokens
  const colors = {
    ...designTokens.colors,
    ...themeExtend.colors
  }
  
  // 簡化的色彩查找邏輯
  return colorToken
}

// ============================================
// 動畫工具
// ============================================

export const getAnimation = (duration: 'fast' | 'base' | 'slow' = 'base') => {
  const durations = designTokens.animations.duration
  return durations[duration] || durations.base
}

export const getEasing = (easing: string = 'brand') => {
  const easings = designTokens.animations.easing
  return easings[easing as keyof typeof easings] || easings.brand
}

// ============================================
// 響應式工具
// ============================================

export const getBreakpoint = (breakpoint: keyof typeof designTokens.breakpoints) => {
  return designTokens.breakpoints[breakpoint]
}

// ============================================
// 可訪問性工具
// ============================================

export const getMinTouchTarget = () => {
  return designTokens.a11y.minTouchTarget
}

export const getFocusRing = () => {
  const { width, offset, color } = designTokens.a11y.focusRing
  return `${width} ${offset} ${color}`
}

// ============================================
// 匯出所有標準化元件
// ============================================

export {
  designTokens,
  themeExtend
}

export default {
  buttonVariants,
  cardVariants,
  textVariants,
  Spacing,
  getColor,
  getAnimation,
  getEasing,
  getBreakpoint,
  getMinTouchTarget,
  getFocusRing,
  designTokens,
  themeExtend
}