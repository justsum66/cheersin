/**
 * B10. CTA按鈕呼吸光暈動畫
 * 為重要CTA按鈕添加吸引注意力的脈動光暈效果
 */

import { m, useAnimation } from 'framer-motion'
import { useEffect } from 'react'

interface CtaButtonProps {
  /** 按鈕文字 */
  children: React.ReactNode
  /** 按鈕類型 */
  variant?: 'primary' | 'secondary' | 'premium'
  /** 是否啟用呼吸動畫 */
  breathing?: boolean
  /** 動畫強度 (1-3) */
  intensity?: number
  /** 動畫速度 (秒) */
  speed?: number
  /** 其他按鈕屬性 */
  [key: string]: any
}

/**
 * 帶呼吸光暈效果的CTA按鈕
 * 適用於：購買按鈕、主要行動號召、重要功能入口
 */
export function CtaButton({
  children,
  variant = 'primary',
  breathing = true,
  intensity = 2,
  speed = 2,
  ...props
}: CtaButtonProps) {
  const controls = useAnimation()

  // 呼吸動畫控制
  useEffect(() => {
    if (!breathing) return

    const animate = async () => {
      await controls.start({
        scale: [1, 1 + (intensity * 0.05), 1],
        boxShadow: [
          getBoxShadow(variant, 0),
          getBoxShadow(variant, intensity),
          getBoxShadow(variant, 0)
        ],
        transition: {
          duration: speed,
          repeat: Infinity,
          ease: "easeInOut"
        }
      })
    }

    animate()

    return () => {
      controls.stop()
    }
  }, [breathing, intensity, speed, variant, controls])

  // 根據變體取得對應的陰影值
  function getBoxShadow(variant: string, intensity: number) {
    const baseShadows = {
      primary: '0 4px 20px rgba(139, 0, 0, 0.3)',
      secondary: '0 4px 20px rgba(255, 255, 255, 0.2)',
      premium: '0 4px 20px rgba(255, 215, 0, 0.4)'
    }
    
    const base = baseShadows[variant as keyof typeof baseShadows] || baseShadows.primary
    const glowIntensity = intensity * 0.3
    
    return `${base}, 0 0 ${20 + glowIntensity * 20}px ${getGlowColor(variant, glowIntensity)}`
  }

  // 取得光暈顏色
  function getGlowColor(variant: string, intensity: number) {
    const colors = {
      primary: `rgba(139, 0, 0, ${0.2 + intensity * 0.3})`,
      secondary: `rgba(255, 255, 255, ${0.1 + intensity * 0.2})`,
      premium: `rgba(255, 215, 0, ${0.3 + intensity * 0.4})`
    }
    return colors[variant as keyof typeof colors] || colors.primary
  }

  // 按鈕基礎樣式
  const baseClasses = "relative overflow-hidden font-bold rounded-xl px-8 py-4 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus:outline-none min-h-[48px] inline-flex items-center justify-center"

  const variantClasses = {
    primary: "bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-500 hover:to-primary-600 focus-visible:ring-primary-500",
    secondary: "bg-white/10 text-white hover:bg-white/20 focus-visible:ring-white/50 border border-white/20",
    premium: "bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:from-yellow-400 hover:to-amber-500 focus-visible:ring-yellow-500"
  }

  return (
    <m.button
      animate={controls}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variantClasses[variant]}`}
      {...props}
    >
      {/* 內部光暈效果 */}
      {breathing && (
        <m.div
          className="absolute inset-0 rounded-xl opacity-30"
          animate={{
            background: [
              `radial-gradient(circle at 30% 30%, ${getGlowColor(variant, intensity * 0.5)}, transparent 50%)`,
              `radial-gradient(circle at 70% 70%, ${getGlowColor(variant, intensity * 0.7)}, transparent 50%)`,
              `radial-gradient(circle at 30% 70%, ${getGlowColor(variant, intensity * 0.5)}, transparent 50%)`,
            ]
          }}
          transition={{
            duration: speed * 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* 按鈕內容 */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      
      {/* 脈動光圈（外層） */}
      {breathing && (
        <m.div
          className="absolute inset-0 rounded-xl border-2"
          style={{
            borderColor: getGlowColor(variant, intensity * 0.8),
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: speed * 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      )}
    </m.button>
  )
}

// 預設匯出
export default CtaButton