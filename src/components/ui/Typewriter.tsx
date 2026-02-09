'use client'

/**
 * R2-098：打字機效果 — 文字逐字出現，適用於題目或故事顯示
 */
import { useState, useEffect, useRef } from 'react'

export interface TypewriterProps {
  /** 要逐字顯示的文字 */
  text: string
  /** 每字間隔（ms） */
  delayMs?: number
  /** 是否自動開始（若 false 需手動 trigger） */
  autoStart?: boolean
  /** 完成後回調 */
  onComplete?: () => void
  className?: string
}

export function Typewriter({
  text,
  delayMs = 50,
  autoStart = true,
  onComplete,
  className = '',
}: TypewriterProps) {
  const [visibleLength, setVisibleLength] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!autoStart || started.current) return
    started.current = true
    setVisibleLength(0)
  }, [autoStart])

  useEffect(() => {
    if (visibleLength >= text.length) {
      onComplete?.()
      return
    }
    const t = setTimeout(() => setVisibleLength((n) => n + 1), delayMs)
    return () => clearTimeout(t)
  }, [visibleLength, text.length, delayMs, onComplete])

  useEffect(() => {
    setVisibleLength(0)
    started.current = !autoStart
  }, [text, autoStart])

  return (
    <span className={className} aria-live="polite">
      {text.slice(0, visibleLength)}
    </span>
  )
}
