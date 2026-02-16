'use client'

/**
 * R2-091：全局 Tooltip 組件 — 出現時從觸發元素方向滑入
 */
import { useState, useRef, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  placement?: TooltipPlacement
  delayMs?: number
  className?: string
}

const slideFrom: Record<TooltipPlacement, { x?: number; y?: number }> = {
  top: { y: 6 },
  bottom: { y: -6 },
  left: { x: 6 },
  right: { x: -6 },
}

export function Tooltip({ children, content, placement = 'top', delayMs = 50, className = '' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(true), delayMs)
  }, [delayMs])

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setVisible(false)
  }, [])

  const from = slideFrom[placement]

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <m.div
            role="tooltip"
            initial={{ opacity: 0, scale: 0.96, x: from.x ?? 0, y: from.y ?? 0 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, x: (from.x ?? 0) * 0.5, y: (from.y ?? 0) * 0.5 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className={`pointer-events-none absolute z-[100] px-3 py-1.5 text-xs font-medium text-white bg-[#1a0a2e]/90 backdrop-blur-md border border-white/20 rounded shadow-xl whitespace-nowrap
              ${placement === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' : ''}
              ${placement === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' : ''}
              ${placement === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' : ''}
              ${placement === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2' : ''}
            `}
          >
            {content}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
