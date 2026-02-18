'use client'

import { m, useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'

interface EnhancedCardHoverProps {
  children: React.ReactNode
  /** 卡片類型：standard, premium, glass */
  variant?: 'standard' | 'premium' | 'glass'
  /** 傾斜強度 (1-5) */
  tiltIntensity?: number
  /** 縮放強度 (1.0-1.2) */
  scaleIntensity?: number
  /** 是否啟用光影效果 */
  enableLighting?: boolean
  /** 是否啟用邊框光暈 */
  enableGlow?: boolean
  /** 自定義類名 */
  className?: string
  /** 點擊事件 */
  onClick?: () => void
  /** 懸浮事件 */
  onHover?: (isHovered: boolean) => void
}

/**
 * C4. 卡片懸浮立體效果增強元件
 * 提供高級3D transform、光影和互動效果
 */
export function EnhancedCardHover({
  children,
  variant = 'standard',
  tiltIntensity = 3,
  scaleIntensity = 1.05,
  enableLighting = true,
  enableGlow = true,
  className = '',
  onClick,
  onHover
}: EnhancedCardHoverProps) {
  const reducedMotion = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const tiltRafRef = useRef<number>(0)

  // 根據變體設定樣式
  const getVariantStyles = () => {
    switch (variant) {
      case 'premium':
        return 'bg-gradient-to-br from-purple-900/80 to-blue-900/80 border border-purple-500/30'
      case 'glass':
        return 'bg-white/5 backdrop-blur-xl border border-white/10'
      case 'standard':
      default:
        return 'bg-gray-900/80 border border-gray-700/50'
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return
    
    cancelAnimationFrame(tiltRafRef.current)
    
    tiltRafRef.current = requestAnimationFrame(() => {
      const card = cardRef.current
      if (!card) return
      
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      
      // 計算傾斜角度
      const rotateX = ((y - centerY) / centerY) * -tiltIntensity
      const rotateY = ((x - centerX) / centerX) * tiltIntensity
      
      // 計算光影偏移
      const lightX = ((x - centerX) / centerX) * 20
      const lightY = ((y - centerY) / centerY) * 20
      
      // 應用transform
      card.style.transform = `
        perspective(1000px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        scale3d(${scaleIntensity}, ${scaleIntensity}, ${scaleIntensity})
      `
      
      // 應用光影效果
      if (enableLighting) {
        card.style.background = `
          radial-gradient(
            circle at ${x}px ${y}px,
            rgba(255,255,255,0.1) 0%,
            transparent 70%
          ),
          ${getVariantStyles().split(' ').filter(c => c.startsWith('bg-')).join(' ')}
        `
      }
    })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    onHover?.(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    onHover?.(false)
    
    if (reducedMotion || !cardRef.current) return
    
    // 重置所有效果
    const card = cardRef.current
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    card.style.background = getVariantStyles()
    card.style.boxShadow = 'none'
  }

  const handleClick = () => {
    onClick?.()
  }

  // 動態陰影效果
  const getDynamicShadow = () => {
    if (!enableGlow) return 'shadow-xl'
    
    const shadows = {
      standard: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
      premium: '0 20px 25px -5px rgba(139, 92, 246, 0.3), 0 10px 10px -5px rgba(99, 102, 241, 0.2)',
      glass: '0 20px 25px -5px rgba(255, 255, 255, 0.1), 0 10px 10px -5px rgba(255, 255, 255, 0.05)'
    }
    
    return shadows[variant]
  }

  return (
    <m.div
      ref={cardRef}
      className={`
        relative rounded-2xl transition-all duration-300 cursor-pointer
        ${getVariantStyles()}
        ${getDynamicShadow()}
        ${className}
      `}
      style={{ 
        transformStyle: 'preserve-3d',
        transition: 'transform 0.2s ease-out, box-shadow 0.3s ease, background 0.3s ease',
        willChange: 'transform'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 24,
        opacity: { duration: 0.3 },
        y: { type: 'spring', stiffness: 200, damping: 20 }
      }}
    >
      {/* 內部光暈效果 */}
      {enableGlow && (
        <div className={`
          absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300
          ${isHovered ? 'opacity-20' : 'opacity-0'}
          ${variant === 'premium' ? 'bg-gradient-to-br from-purple-500/30 to-blue-500/30' : 
            variant === 'glass' ? 'bg-white/10' : 'bg-white/5'}
        `} />
      )}
      
      {/* 邊框光暈 */}
      {enableGlow && (
        <div className={`
          absolute -inset-0.5 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none
          ${isHovered ? 'opacity-100' : 'opacity-0'}
          ${variant === 'premium' ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 
            variant === 'glass' ? 'bg-gradient-to-r from-white/30 to-white/10' : 
            'bg-gradient-to-r from-gray-500 to-gray-700'}
          blur-sm
        `} />
      )}
      
      {/* 內容 */}
      <div className="relative z-10 h-full">
        {children}
      </div>
      
      {/* 懸浮提示裝飾 */}
      {isHovered && (
        <m.div 
          className="absolute top-2 right-2 text-xs text-white/40"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          ↗
        </m.div>
      )}
    </m.div>
  )
}

// 預設導出
export default EnhancedCardHover