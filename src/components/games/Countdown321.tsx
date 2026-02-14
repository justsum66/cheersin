'use client'

/** R2-040：遊戲開始 3-2-1 倒計時 overlay，結束後呼叫 onComplete */
import { useEffect, useState } from 'react'
import { m , AnimatePresence } from 'framer-motion'

const STEPS = [3, 2, 1] as const
const STEP_MS = 800

export interface Countdown321Props {
  onComplete: () => void
  /** 若為 true 則不顯示動畫，直接完成 */
  skip?: boolean
}

export function Countdown321({ onComplete, skip = false }: Countdown321Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (skip) {
      onComplete()
      return
    }
    if (step < STEPS.length) {
      const t = setTimeout(() => setStep((s) => s + 1), STEP_MS)
      return () => clearTimeout(t)
    }
    const t = setTimeout(onComplete, STEP_MS)
    return () => clearTimeout(t)
  }, [step, skip, onComplete])

  if (skip) return null

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={step < STEPS.length ? `倒數 ${STEPS[step]}` : '開始'}
    >
      <AnimatePresence mode="wait">
        {step < STEPS.length ? (
          <m.span
            key={STEPS[step]}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-8xl md:text-9xl font-display font-bold text-white drop-shadow-lg tabular-nums"
          >
            {STEPS[step]}
          </m.span>
        ) : (
          <m.span
            key="go"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-5xl md:text-6xl font-display font-bold text-primary-400 drop-shadow-lg"
          >
            開始！
          </m.span>
        )}
      </AnimatePresence>
    </div>
  )
}
