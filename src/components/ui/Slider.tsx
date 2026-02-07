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
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value)
      if (!Number.isNaN(v)) onChange(v)
    },
    [onChange]
  )

  return (
    <div className={`min-w-0 max-w-full ${className}`}>
      {(label != null || showValue) && (
        <div className="flex justify-between items-center gap-2 mb-1">
          {label != null && <span className="text-sm text-white/70">{label}</span>}
          {showValue && <span className="text-sm tabular-nums text-white/80">{value}</span>}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={handleChange}
        className="w-full h-2 rounded-full appearance-none bg-white/10 accent-primary-500 cursor-pointer"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      />
    </div>
  )
}
