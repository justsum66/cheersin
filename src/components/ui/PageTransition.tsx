'use client'

import { m , useReducedMotion } from 'framer-motion'

/** 頁面過渡用 m.div：直接 import 避免 next/dynamic 回傳 undefined 導致 webpack requireModule .call 崩潰（Next 15） */
const MotionDiv = m.div

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  /** 過渡類型：slide, fade, scale, flip */
  type?: 'slide' | 'fade' | 'scale' | 'flip'
  /** 過渡方向：for slide type */
  direction?: 'left' | 'right' | 'up' | 'down'
  /** 動畫持續時間（秒） */
  duration?: number
  /** 延遲時間（秒） */
  delay?: number
  /** 是否啟用3D效果 */
  enable3d?: boolean
}

/** C1. 路由過渡動畫增強 - 多種過渡效果和自定義選項 */
/** 頁面過渡動畫（111）：framer-motion layout 流暢切換；A-01 prefers-reduced-motion 時關閉動畫 */
/** Phase 1 B1.1 & B1.3: 增強頁面轉場效果，不延遲導航 */
/** Phase 1 B3.1: 頁面轉場動畫優化 - 更流暢的過渡 */
export function PageTransition({ 
  children, 
  className = '',
  type = 'slide',
  direction = 'right',
  duration = 0.4,
  delay = 0,
  enable3d = true
}: PageTransitionProps) {
  const reducedMotion = useReducedMotion()
  
  // 根據類型和方向生成過渡配置
  const getTransitionConfig = () => {
    if (reducedMotion) {
      return {
        initial: { opacity: 1, x: 0, y: 0, z: 0, rotateY: 0 },
        animate: { opacity: 1, x: 0, y: 0, z: 0, rotateY: 0 },
        exit: { opacity: 1, x: 0, y: 0, z: 0, rotateY: 0 },
        transition: { duration: 0 }
      }
    }

    const baseTransition = {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1] as const
    }

    switch (type) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { ...baseTransition, duration: duration * 0.8 }
        }
      
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.95, ...(enable3d && { z: -20 }) },
          animate: { opacity: 1, scale: 1, ...(enable3d && { z: 0 }) },
          exit: { opacity: 0, scale: 1.02, ...(enable3d && { z: 20 }) },
          transition: { 
            ...baseTransition,
            scale: { type: 'spring' as const, stiffness: 300, damping: 25 }
          }
        }
      
      case 'flip':
        return {
          initial: { opacity: 0, rotateY: direction === 'right' ? -90 : 90 },
          animate: { opacity: 1, rotateY: 0 },
          exit: { opacity: 0, rotateY: direction === 'right' ? 90 : -90 },
          transition: { 
            ...baseTransition,
            rotateY: { type: 'spring' as const, stiffness: 200, damping: 20 }
          }
        }
      
      case 'slide':
      default:
        const getSlideValues = () => {
          const distance = 30
          switch (direction) {
            case 'left': return { x: -distance }
            case 'right': return { x: distance }
            case 'up': return { y: -distance }
            case 'down': return { y: distance }
            default: return { x: distance }
          }
        }
        
        return {
          initial: { 
            opacity: 0, 
            ...getSlideValues(),
            ...(enable3d && { z: -10, scale: 0.98 })
          },
          animate: { 
            opacity: 1, 
            x: 0, 
            y: 0, 
            ...(enable3d && { z: 0, scale: 1 })
          },
          exit: { 
            opacity: 0, 
            ...getSlideValues(),
            x: (getSlideValues().x || 0) * -0.5,
            y: (getSlideValues().y || 0) * -0.5,
            ...(enable3d && { z: 10, scale: 1.01 })
          },
          transition: { 
            ...baseTransition,
            x: { type: 'spring' as const, stiffness: 400, damping: 30 },
            y: { type: 'spring' as const, stiffness: 400, damping: 30 }
          }
        }
    }
  }

  const config = getTransitionConfig()

  return (
    <MotionDiv
      initial={config.initial}
      animate={config.animate}
      exit={config.exit}
      transition={config.transition}
      className={className}
      style={{ 
        transformStyle: enable3d ? 'preserve-3d' : 'flat',
        backfaceVisibility: 'hidden'
      }}
    >
      {children}
    </MotionDiv>
  )
}

// 預設導出保持相容性
export default PageTransition
