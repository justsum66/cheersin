'use client'

/** P1-082 / R2-068：進度條組件 — 課程進度、經驗值等；m.div width animate */
import { useEffect, useState } from 'react'
import { m , useReducedMotion } from 'framer-motion'

export interface ProgressBarProps {
  /** 0–100 */
  value: number
  max?: number
  showLabel?: boolean
  label?: string
  className?: string
  /** 進度條高度 */
  height?: 'sm' | 'md' | 'lg'
}

const heightClass = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
} as const

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  label,
  className = '',
  height = 'md',
}: ProgressBarProps) {
  const [mounted, setMounted] = useState(false)
  const reducedMotion = useReducedMotion()
  useEffect(() => setMounted(true), [])
  const pct = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0))

  return (
    <div className={`min-w-0 max-w-full ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center gap-2 mb-1">
          {label != null && <span className="text-sm text-white/70 truncate">{label}</span>}
          {showLabel && <span className="text-sm tabular-nums text-white/80">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`w-full rounded-full bg-white/10 overflow-hidden ${heightClass[height]}`}>
        <m.div
          className={`rounded-full bg-primary-500 ${heightClass[height]}`}
          initial={reducedMotion ? false : { width: 0 }}
          animate={{ width: mounted ? `${pct}%` : '0%' }}
          transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 25, mass: 0.8 }}
        />
      </div>
    </div>
  )
}
