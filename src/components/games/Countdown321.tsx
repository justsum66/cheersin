'use client'

/** R2-040：遊戲開始 3-2-1 倒計時 overlay，結束後呼叫 onComplete */
/** GAME-091: Enhanced visual countdown effect with pulse + color */
/** GAME-092: Penalty system — too-slow penalty callback */
import { useEffect, useState } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { useGameReduceMotion } from './GameWrapper'

const STEPS = [3, 2, 1] as const
const STEP_MS = 800
/** GAME-091: Color gradient per step for visual impact */
const STEP_COLORS = ['text-red-400', 'text-yellow-400', 'text-green-400'] as const

export interface Countdown321Props {
  onComplete: () => void
  /** 若為 true 則不顯示動畫，直接完成 */
  skip?: boolean
  /** GAME-092: Optional penalty callback if user taps during countdown */
  onPenalty?: () => void
}

export function Countdown321({ onComplete, skip = false, onPenalty }: Countdown321Props) {
  const [step, setStep] = useState(0)
  const reducedMotion = useGameReduceMotion()
  /** GAME-092: Track premature taps */
  const [tapped, setTapped] = useState(false)

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

  /** GAME-092: Penalty for premature tap */
  const handlePrematureTap = () => {
    if (step < STEPS.length && !tapped) {
      setTapped(true)
      onPenalty?.()
    }
  }

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={step < STEPS.length ? `倒數 ${STEPS[step]}` : '開始'}
      onClick={handlePrematureTap}
    >
      <AnimatePresence mode="wait">
        {step < STEPS.length ? (
          <m.span
            key={STEPS[step]}
            initial={reducedMotion ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: reducedMotion ? 1 : [1, 1.2, 1], opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { scale: 1.5, opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.4, times: [0, 0.6, 1] }}
            className={`text-8xl md:text-9xl font-display font-bold drop-shadow-lg tabular-nums ${STEP_COLORS[step] ?? 'text-white'}`}
          >
            {STEPS[step]}
          </m.span>
        ) : (
          <m.span
            key="go"
            initial={reducedMotion ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 20 }}
            className="text-5xl md:text-6xl font-display font-bold text-primary-400 drop-shadow-lg"
          >
            開始！
          </m.span>
        )}
      </AnimatePresence>
      {/** GAME-091: Radial pulse ring behind number */}
      {!reducedMotion && step < STEPS.length && (
        <m.div
          key={`ring-${STEPS[step]}`}
          initial={{ scale: 0.5, opacity: 0.6 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute w-32 h-32 rounded-full border-2 border-white/30 pointer-events-none"
        />
      )}
      {/** GAME-092: Penalty warning if tapped early */}
      {tapped && (
        <m.p
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : undefined}
          className="absolute bottom-20 text-red-400 text-sm font-medium"
        >
          太早了！搶跑懲罰 🍺
        </m.p>
      )}
    </div>
  )
}
