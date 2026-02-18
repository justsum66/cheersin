'use client'

import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface GameTimerProps {
  /** Initial time in seconds */
  initialSeconds: number
  /** Auto-start on mount */
  autoStart?: boolean
  /** Callback when timer reaches 0 */
  onTimeUp?: () => void
  /** Callback on each tick */
  onTick?: (remaining: number) => void
  /** External pause control */
  isPaused?: boolean
  /** Show controls (play/pause/reset) */
  showControls?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Warning threshold in seconds (turns red) */
  warningAt?: number
  className?: string
}

/** GAME-051: Reusable game timer with visual countdown, pause, reset */
export const GameTimer = memo(function GameTimer({
  initialSeconds,
  autoStart = false,
  onTimeUp,
  onTick,
  isPaused: externalPaused,
  showControls = true,
  size = 'md',
  warningAt = 5,
  className = '',
}: GameTimerProps) {
  const [remaining, setRemaining] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(autoStart)
  const reducedMotion = useReducedMotion()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onTimeUpRef = useRef(onTimeUp)
  const onTickRef = useRef(onTick)
  onTimeUpRef.current = onTimeUp
  onTickRef.current = onTick

  const effectivePaused = externalPaused ?? !isRunning

  useEffect(() => {
    if (effectivePaused || remaining <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1
        onTickRef.current?.(next)
        if (next <= 0) {
          onTimeUpRef.current?.()
          return 0
        }
        return next
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [effectivePaused, remaining])

  const toggle = useCallback(() => setIsRunning(p => !p), [])
  const reset = useCallback(() => {
    setRemaining(initialSeconds)
    setIsRunning(false)
  }, [initialSeconds])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const isWarning = remaining <= warningAt && remaining > 0
  const progress = remaining / initialSeconds

  const sizeClasses = {
    sm: 'w-16 h-16 text-lg',
    md: 'w-24 h-24 text-2xl',
    lg: 'w-32 h-32 text-4xl',
  }

  const radius = size === 'sm' ? 28 : size === 'md' ? 42 : 56
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Circular progress */}
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        <svg className="absolute inset-0 -rotate-90" viewBox={`0 0 ${(radius + 4) * 2} ${(radius + 4) * 2}`}>
          {/* Background circle */}
          <circle
            cx={radius + 4}
            cy={radius + 4}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={3}
          />
          {/* Progress circle */}
          <circle
            cx={radius + 4}
            cy={radius + 4}
            r={radius}
            fill="none"
            stroke={isWarning ? '#ef4444' : '#D4AF37'}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <m.span
          className={`font-mono font-bold tabular-nums ${isWarning ? 'text-red-400' : 'text-white'}`}
          animate={isWarning && !reducedMotion ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : seconds}
        </m.span>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors games-touch-target games-focus-ring"
            aria-label={isRunning ? '暫停' : '開始'}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={reset}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors games-touch-target games-focus-ring"
            aria-label="重設"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
})
