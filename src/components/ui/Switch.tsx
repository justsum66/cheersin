'use client'

/** P1-081：開關 (Switch/Toggle) 組件 — 流暢動畫、無障礙、用於設定頁等 */
import { useId } from 'react'

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  'aria-label'?: string
  className?: string
}

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  'aria-label': ariaLabel,
  className = '',
}: SwitchProps) {
  const id = useId()
  const labelId = label ? `${id}-label` : undefined

  return (
    <label
      htmlFor={id}
      id={labelId}
      className={`inline-flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <span
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        aria-labelledby={label ? labelId : undefined}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        id={id}
        onClick={() => !disabled && onCheckedChange(!checked)}
        onKeyDown={(e) => {
          if (disabled) return
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            onCheckedChange(!checked)
          }
        }}
        className={`
          relative inline-flex h-7 w-12 shrink-0 rounded-full
          border-2 border-transparent
          transition-colors duration-200 ease-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
          ${checked ? 'bg-primary-500 shadow-[0_0_12px_rgba(139,0,0,0.6)]' : 'bg-white/20'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow
            transform transition-transform duration-200 ease-out
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}
          `}
          style={{ marginTop: 2 }}
        />
      </span>
      {label != null && (
        <span className="text-sm text-white/90">{label}</span>
      )}
    </label>
  )
}
