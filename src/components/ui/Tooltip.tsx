'use client'

/** P1-091：Tooltip 組件 — 懸停顯示說明；無障礙、鍵盤可觸發 */
import { useState, useRef, useEffect, type ReactNode } from 'react'

export interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ content, children, side = 'top', className = '' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const show = () => setVisible(true)
    const hide = () => setVisible(false)
    wrapper.addEventListener('mouseenter', show)
    wrapper.addEventListener('mouseleave', hide)
    wrapper.addEventListener('focus', show)
    wrapper.addEventListener('blur', hide)
    return () => {
      wrapper.removeEventListener('mouseenter', show)
      wrapper.removeEventListener('mouseleave', hide)
      wrapper.removeEventListener('focus', show)
      wrapper.removeEventListener('blur', hide)
    }
  }, [])

  const positionClass = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[side]

  return (
    <div ref={wrapperRef} className={`relative inline-flex ${className}`}>
      {children}
      {visible && (
        <span
          role="tooltip"
          className={`
            absolute z-50 px-3 py-2 text-sm text-white bg-gray-900/95 rounded-lg shadow-lg
            whitespace-nowrap pointer-events-none
            ${positionClass}
          `}
        >
          {content}
        </span>
      )}
    </div>
  )
}
