'use client'

/** UX_LAYOUT_200 #72：表單步驟指示器（多步驟時）— 顯示當前步驟與總數 */
export interface StepIndicatorProps {
  steps: string[]
  currentStep: number
  className?: string
  ariaLabel?: string
}

export function StepIndicator({ steps, currentStep, className = '', ariaLabel = '表單步驟' }: StepIndicatorProps) {
  return (
    <nav
      className={`flex items-center gap-2 ${className}`}
      aria-label={ariaLabel}
      role="navigation"
    >
      {steps.map((label, i) => {
        const isCurrent = i === currentStep
        const isPast = i < currentStep
        return (
          <div
            key={i}
            className="flex items-center gap-2"
            aria-current={isCurrent ? 'step' : undefined}
          >
            <span
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                isCurrent
                  ? 'bg-primary-500 text-white'
                  : isPast
                    ? 'bg-primary-500/30 text-primary-300'
                    : 'bg-white/10 text-white/50'
              }`}
              aria-hidden
            >
              {i + 1}
            </span>
            <span className={`text-sm ${isCurrent ? 'text-white font-medium' : 'text-white/50'}`}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className="mx-1 w-4 h-px bg-white/20" aria-hidden />
            )}
          </div>
        )
      })}
    </nav>
  )
}
