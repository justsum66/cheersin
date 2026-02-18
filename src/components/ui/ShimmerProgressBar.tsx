'use client'

import { useEffect, useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'

interface ShimmerProgressBarProps {
  /** 進度值 0-100 */
  value: number
  /** 最大值 */
  max?: number
  /** 顯示標籤 */
  showLabel?: boolean
  /** 自定義標籤 */
  label?: string
  /** 類名 */
  className?: string
  /** 高度 */
  height?: 'sm' | 'md' | 'lg'
  /** 顏色變體 */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  /** 是否啟用流光效果 */
  shimmer?: boolean
  /** 流光速度 (秒) */
  shimmerSpeed?: number
  /** 是否啟用動畫 */
  animated?: boolean
  /** 圓角大小 */
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

/**
 * E5. 進度條流光效果 - 帶 shimmer 動畫的進度條
 * 提供現代化的進度指示和視覺反饋
 */
export function ShimmerProgressBar({
  value,
  max = 100,
  showLabel = false,
  label,
  className = '',
  height = 'md',
  variant = 'primary',
  shimmer = true,
  shimmerSpeed = 2,
  animated = true,
  rounded = 'full'
}: ShimmerProgressBarProps) {
  const [mounted, setMounted] = useState(false)
  const reducedMotion = useReducedMotion()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (animated && !reducedMotion) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 500)
      return () => clearTimeout(timer)
    }
  }, [value, animated, reducedMotion])

  const pct = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0))

  // 顏色配置
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-400',
    secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-400',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500',
    danger: 'bg-gradient-to-r from-red-500 to-rose-500'
  }

  // 高度配置
  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  // 圓角配置
  const roundedClasses = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }

  // 流光效果樣式
  const shimmerStyles = shimmer && !reducedMotion ? {
    background: `linear-gradient(90deg, 
      transparent 0%, 
      rgba(255,255,255,0.3) 50%, 
      transparent 100%)`,
    backgroundSize: '200% 100%',
    animation: `shimmer ${shimmerSpeed}s ease-in-out infinite`
  } : {}

  return (
    <div className={`min-w-0 max-w-full ${className}`}>
      {/* 標籤 */}
      {(showLabel || label) && (
        <div className="flex justify-between items-center gap-2 mb-2">
          {label && <span className="text-sm font-medium text-white/80">{label}</span>}
          {showLabel && (
            <span className="text-sm font-mono tabular-nums text-white/70">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}

      {/* 進度條容器 */}
      <div 
        className={`w-full ${heightClasses[height]} ${roundedClasses[rounded]} bg-white/10 overflow-hidden relative border border-white/10`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || '進度條'}
      >
        {/* 背景流光效果 */}
        {shimmer && !reducedMotion && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: `shimmer ${shimmerSpeed * 1.5}s linear infinite`
            }}
          />
        )}

        {/* 進度條填充 */}
        <m.div
          className={`relative ${heightClasses[height]} ${roundedClasses[rounded]} ${variantClasses[variant]} shadow-lg`}
          style={shimmerStyles}
          initial={animated && !reducedMotion ? { width: 0 } : false}
          animate={{ width: mounted ? `${pct}%` : '0%' }}
          transition={animated && !reducedMotion ? { 
            type: 'spring', 
            stiffness: 150, 
            damping: 20,
            mass: 0.8
          } : { duration: 0 }}
        >
          {/* 前景流光效果 */}
          {shimmer && !reducedMotion && (
            <div 
              className="absolute inset-0 rounded-full opacity-40"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                backgroundSize: '300% 100%',
                animation: `shimmer ${shimmerSpeed}s linear infinite reverse`
              }}
            />
          )}

          {/* 進度條端點高光 */}
          {pct > 0 && pct < 100 && !reducedMotion && (
            <div className="absolute right-0 top-0 h-full w-1 bg-white/30 rounded-full blur-sm" />
          )}
        </m.div>

        {/* 完成動畫效果 */}
        {pct >= 100 && !reducedMotion && isAnimating && (
          <m.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
          </m.div>
        )}
      </div>

      {/* 動態狀態指示 */}
      {!reducedMotion && pct < 100 && (
        <div className="flex items-center gap-2 mt-2">
          <m.div 
            className="w-2 h-2 rounded-full bg-white/40"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span className="text-xs text-white/50">進行中...</span>
        </div>
      )}

      {pct >= 100 && (
        <div className="flex items-center gap-2 mt-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-xs text-green-400 font-medium">已完成</span>
        </div>
      )}
    </div>
  )
}

// 單純的Shimmer Loader 元件
interface ShimmerLoaderProps {
  width?: string
  height?: string
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

export function ShimmerLoader({
  width = '100%',
  height = '1rem',
  className = '',
  rounded = 'full'
}: ShimmerLoaderProps) {
  const roundedClasses = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }

  return (
    <div 
      className={`bg-white/10 overflow-hidden relative ${roundedClasses[rounded]} ${className}`}
      style={{ width, height }}
    >
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite'
        }}
      />
    </div>
  )
}

// 預設導出
export default ShimmerProgressBar