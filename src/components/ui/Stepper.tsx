'use client'

/**
 * P1-157：多步驟流程視覺化步驟指示器（如註冊引導、創建房間）。
 * 與 StepIndicator 互補：Stepper 支援可選的連接線與垂直佈局。
 */
export interface StepperProps {
  /** 步驟標籤 */
  steps: string[]
  /** 當前步驟（0-based） */
  currentStep: number
  /** 垂直排列（預設為水平） */
  vertical?: boolean
  className?: string
  ariaLabel?: string
}

export function Stepper({
  steps,
  currentStep,
  vertical = false,
  className = '',
  ariaLabel = '步驟',
}: StepperProps) {
  return (
    <nav
      className={`${vertical ? 'flex flex-col gap-0' : 'flex items-center gap-2 flex-wrap'} ${className}`}
      aria-label={ariaLabel}
      role="navigation"
    >
      {steps.map((label, i) => {
        const isCurrent = i === currentStep
        const isPast = i < currentStep
        const isLast = i === steps.length - 1
        return (
          <div
            key={i}
            className={vertical ? 'flex flex-col gap-0' : 'flex items-center gap-2'}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'bg-primary-500 text-white ring-2 ring-primary-400/50'
                    : isPast
                      ? 'bg-primary-500/40 text-primary-200'
                      : 'bg-white/10 text-white/50'
                }`}
                aria-hidden
              >
                {isPast && !isCurrent ? (
                  <span className="text-primary-300" aria-hidden>✓</span>
                ) : (
                  i + 1
                )}
              </span>
              <span className={`text-sm ${isCurrent ? 'text-white font-medium' : 'text-white/60'}`}>
                {label}
              </span>
            </div>
            {vertical && !isLast && (
              <div
                className="ml-4 w-px h-4 bg-white/20 shrink-0"
                aria-hidden
              />
            )}
            {!vertical && !isLast && (
              <span className="w-4 h-px bg-white/20 shrink-0" aria-hidden />
            )}
          </div>
        )
      })}
    </nav>
  )
}
