'use client'

/**
 * R2-048：深色/淺色切換時的圓形擴散過渡
 * 從點擊位置向外擴散，覆蓋畫面後切換主題
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { m } from 'framer-motion'

const DARK_BG = '#0a0a0a'
const LIGHT_BG = '#f9fafb'

interface ThemeTransitionOverlayProps {
  /** 目標主題 */
  targetTheme: 'dark' | 'light'
  /** 點擊位置（視窗座標） */
  origin: { x: number; y: number }
  /** 動畫結束回調，傳入目標主題後應呼叫 setTheme 並清除過渡狀態 */
  onComplete: (target: 'dark' | 'light') => void
}

export function ThemeTransitionOverlay({ targetTheme, origin, onComplete }: ThemeTransitionOverlayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => onComplete(targetTheme), 520)
    return () => clearTimeout(t)
    // 僅在掛載時排程，targetTheme 不變
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!mounted || typeof document === 'undefined') return null

  const bg = targetTheme === 'dark' ? DARK_BG : LIGHT_BG

  return createPortal(
    <m.div
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{
        background: bg,
      }}
      initial={{ clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }}
      animate={{ clipPath: `circle(4000px at ${origin.x}px ${origin.y}px)` }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
      aria-hidden
    />,
    document.body
  )
}
