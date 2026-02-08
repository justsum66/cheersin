'use client'

/** P1-090：日期選擇器 — 玻璃風格、與表單一致；原生 type="date" 語意 + 美觀樣式 */
import { forwardRef, type InputHTMLAttributes } from 'react'

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  label?: string
  error?: string
  className?: string
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { label, error, className = '', ...props },
  ref
) {
  return (
    <div className={`min-w-0 ${className}`}>
      {label != null && (
        <label className="block text-sm text-white/80 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type="date"
        {...props}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-primary-500/50 focus:bg-white/10 min-h-[44px] games-focus-ring [color-scheme:dark]"
      />
      {error != null && error !== '' && (
        <p className="mt-1.5 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})
