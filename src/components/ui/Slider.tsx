'use client'

/** P1-089：Slider 組件 — 篩選價格、酒精度等範圍；支援單值或範圍 */
import { useCallback, type ChangeEvent } from 'react'

export interface SliderProps {
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  step?: number
  label?: string
  showValue?: boolean
  className?: string
}

import { useRef, useEffect } from 'react'
import { m, useMotionValue, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface SliderProps {
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  step?: number
  label?: string
  showValue?: boolean
  className?: string
}

export function Slider({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  showValue = true,
  className = '',
}: SliderProps) {
  const constraintsRef = useRef<HTMLDivElement>(null)
  const range = max - min
  const percentage = (value - min) / range

  // Handle constraints for dragging
  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: { point: { x: number; y: number } }) => {
    if (!constraintsRef.current) return
    const rect = constraintsRef.current.getBoundingClientRect()
    const x = info.point.x - rect.left
    const newPercentage = Math.max(0, Math.min(1, x / rect.width))
    const rawValue = min + newPercentage * range
    const steppedValue = Math.round(rawValue / step) * step
    const clampedValue = Math.max(min, Math.min(max, steppedValue))

    if (clampedValue !== value) {
      onChange(clampedValue)
    }
  }

  // Handle click on track
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!constraintsRef.current) return
    const rect = constraintsRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newPercentage = Math.max(0, Math.min(1, x / rect.width))
    const rawValue = min + newPercentage * range
    const steppedValue = Math.round(rawValue / step) * step
    const clampedValue = Math.max(min, Math.min(max, steppedValue))
    onChange(clampedValue)
  }

  return (
    <div className={cn("min-w-0 max-w-full touch-none select-none", className)}>
      {(label != null || showValue) && (
        <div className="flex justify-between items-center gap-2 mb-2">
          {label != null && <span className="text-sm text-white/70">{label}</span>}
          {showValue && <span className="text-sm tabular-nums text-white/80">{value}</span>}
        </div>
      )}
      <div
        ref={constraintsRef}
        className="relative h-6 flex items-center cursor-pointer"
        onClick={handleTrackClick}
      >
        {/* Track */}
        <div className="absolute w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <m.div
            className="h-full bg-primary-500"
            style={{ width: `${percentage * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Thumb */}
        <m.div
          className="absolute w-5 h-5 bg-white rounded-full shadow-lg border-2 border-primary-500 cursor-grab active:cursor-grabbing flex items-center justify-center z-10"
          style={{ left: `calc(${percentage * 100}% - 10px)` }}
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0}
          dragMomentum={false}
          onDrag={handleDrag}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Inner dot */}
          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
        </m.div>
      </div>
    </div>
  )
}
