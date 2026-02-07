'use client'

/** P1-088：下拉選單 — 玻璃風格、與表單一致；原生 select 語意 + 美觀樣式 */
import { forwardRef, type SelectHTMLAttributes } from 'react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  options: SelectOption[]
  label?: string
  error?: string
  className?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, label, error, className = '', ...props },
  ref
) {
  return (
    <div className={`min-w-0 ${className}`}>
      {label != null && (
        <label className="block text-sm text-white/80 mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        {...props}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-primary-500/50 focus:bg-white/10 min-h-[44px] games-focus-ring appearance-none cursor-pointer bg-[length:1rem_1rem] bg-[right_0.75rem_center] bg-no-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        }}
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
            className="bg-[#1a0a2e] text-white"
          >
            {opt.label}
          </option>
        ))}
      </select>
      {error != null && error !== '' && (
        <p className="mt-1.5 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})
