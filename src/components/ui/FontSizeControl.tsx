'use client'

import { useState, useEffect, useCallback } from 'react'
import { m } from 'framer-motion'
import { Type, Minus, Plus } from 'lucide-react'

const FONT_SIZE_KEY = 'cheersin_font_size'
const MIN_SIZE = 14
const MAX_SIZE = 22
const STEP = 2

interface FontSizeControlProps {
  className?: string
}

/**
 * Phase 2 D4.2: 字體大小調整控制項
 * 提供 A+ A- 控制項，讓使用者調整閱讀字體大小
 */
export function FontSizeControl({ className = '' }: FontSizeControlProps) {
  const [fontSize, setFontSize] = useState(16)
  const [mounted, setMounted] = useState(false)

  // 應用字體大小到 document
  const applyFontSize = useCallback((size: number) => {
    if (typeof window === 'undefined') return
    // 設定 CSS 變數
    document.documentElement.style.setProperty('--content-font-size', `${size}px`)
    // 設定 body 字體大小（影響繼承）
    document.body.style.fontSize = `${size}px`
  }, [])

  // 從 localStorage 載入設定
  useEffect(() => {
    setMounted(true)
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem(FONT_SIZE_KEY)
      if (saved) {
        const size = parseInt(saved, 10)
        if (size >= MIN_SIZE && size <= MAX_SIZE) {
          setFontSize(size)
          applyFontSize(size)
        }
      }
    } catch {
      /* ignore */
    }
  }, [applyFontSize])

  // 調整字體大小
  const adjustSize = useCallback((delta: number) => {
    setFontSize(prev => {
      const newSize = Math.max(MIN_SIZE, Math.min(MAX_SIZE, prev + delta))
      if (typeof window !== 'undefined') {
        localStorage.setItem(FONT_SIZE_KEY, String(newSize))
        applyFontSize(newSize)
      }
      return newSize
    })
  }, [applyFontSize])

  // 重設為預設值
  const resetSize = useCallback(() => {
    const defaultSize = 16
    setFontSize(defaultSize)
    if (typeof window !== 'undefined') {
      localStorage.setItem(FONT_SIZE_KEY, String(defaultSize))
      applyFontSize(defaultSize)
    }
  }, [applyFontSize])

  if (!mounted) return null

  const isMin = fontSize <= MIN_SIZE
  const isMax = fontSize >= MAX_SIZE

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* 縮小按鈕 */}
      <m.button
        type="button"
        onClick={() => adjustSize(-STEP)}
        disabled={isMin}
        whileHover={!isMin ? { scale: 1.1 } : {}}
        whileTap={!isMin ? { scale: 0.95 } : {}}
        className={`p-2 rounded-lg transition-colors ${isMin
            ? 'bg-white/5 text-white/30 cursor-not-allowed'
            : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
          }`}
        aria-label="縮小字體"
        title="縮小字體"
      >
        <span className="flex items-center gap-0.5">
          <Type className="w-4 h-4" />
          <Minus className="w-3 h-3" />
        </span>
      </m.button>

      {/* 目前大小指示 / 重設按鈕 */}
      <button
        type="button"
        onClick={resetSize}
        className="min-w-[48px] px-2 py-2 rounded-lg bg-white/5 text-white/60 text-xs font-medium hover:bg-white/10 hover:text-white transition-colors"
        title="點擊重設為預設大小"
      >
        {fontSize}px
      </button>

      {/* 放大按鈕 */}
      <m.button
        type="button"
        onClick={() => adjustSize(STEP)}
        disabled={isMax}
        whileHover={!isMax ? { scale: 1.1 } : {}}
        whileTap={!isMax ? { scale: 0.95 } : {}}
        className={`p-2 rounded-lg transition-colors ${isMax
            ? 'bg-white/5 text-white/30 cursor-not-allowed'
            : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
          }`}
        aria-label="放大字體"
        title="放大字體"
      >
        <span className="flex items-center gap-0.5">
          <Type className="w-4 h-4" />
          <Plus className="w-3 h-3" />
        </span>
      </m.button>
    </div>
  )
}

/**
 * 取得目前設定的字體大小
 */
export function getStoredFontSize(): number {
  if (typeof window === 'undefined') return 16
  try {
    const saved = localStorage.getItem(FONT_SIZE_KEY)
    if (saved) {
      const size = parseInt(saved, 10)
      if (size >= MIN_SIZE && size <= MAX_SIZE) return size
    }
  } catch {
    /* ignore */
  }
  return 16
}


