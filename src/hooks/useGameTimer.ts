/**
 * Phase 3 Stage 2: useGameTimer Hook
 * Specialized game timer hook building on useTimerManager
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTimerManager } from './useTimerManager'
import { usePersistentStorage } from './usePersistentStorage'

type GameTimerType = 'countdown' | 'stopwatch' | 'interval'

interface BaseGameTimerOptions {
  /** Timer type */
  type: GameTimerType
  /** Auto-start the timer */
  autoStart?: boolean
  /** Persist timer state */
  persistKey?: string
}

interface CountdownTimerOptions extends BaseGameTimerOptions {
  type: 'countdown'
  /** Initial time in seconds */
  initialTime: number
  /** Callback when timer completes */
  onComplete?: () => void
}

interface StopwatchTimerOptions extends BaseGameTimerOptions {
  type: 'stopwatch'
  /** Callback on each tick */
  onTick?: (elapsed: number) => void
}

interface IntervalTimerOptions extends BaseGameTimerOptions {
  type: 'interval'
  /** Interval duration in milliseconds */
  interval: number
  /** Callback on each interval */
  onInterval: () => void
}

type GameTimerOptions = CountdownTimerOptions | StopwatchTimerOptions | IntervalTimerOptions

interface GameTimerState {
  /** Current time value */
  time: number
  /** Timer is currently running */
  isRunning: boolean
  /** Timer has been started at least once */
  hasStarted: boolean
  /** Number of times timer has completed */
  completionCount: number
}

/**
 * Specialized game timer hook with persistence and game-specific features
 */
export function useGameTimer(options: GameTimerOptions) {
  const timerManager = useTimerManager()
  const timerIdRef = useRef<string | null>(null)
  
  // Persistent state
  const [storedTime, setStoredTime] = options.persistKey 
    ? usePersistentStorage(`${options.persistKey}_time`, 
        options.type === 'countdown' ? options.initialTime : 0)
    : [options.type === 'countdown' ? (options as CountdownTimerOptions).initialTime : 0, () => {}]
  
  const [storedHasStarted, setStoredHasStarted] = options.persistKey 
    ? usePersistentStorage(`${options.persistKey}_started`, false)
    : [false, () => {}]
  
  const [storedCompletionCount, setStoredCompletionCount] = options.persistKey 
    ? usePersistentStorage(`${options.persistKey}_completions`, 0)
    : [0, () => {}]

  const [state, setState] = useState<GameTimerState>({
    time: storedTime,
    isRunning: options.autoStart || false,
    hasStarted: storedHasStarted,
    completionCount: storedCompletionCount
  })

  // Sync with stored values
  useEffect(() => {
    if (!options.persistKey) return
    setState(prev => ({
      ...prev,
      time: storedTime,
      hasStarted: storedHasStarted,
      completionCount: storedCompletionCount
    }))
  }, [storedTime, storedHasStarted, storedCompletionCount, options.persistKey])

  // Initialize timer based on type
  useEffect(() => {
    // Clean up existing timer
    if (timerIdRef.current) {
      timerManager.removeTimer(timerIdRef.current)
      timerIdRef.current = null
    }

    switch (options.type) {
      case 'countdown':
        const countdownOptions = options as CountdownTimerOptions
        timerIdRef.current = timerManager.createCountdown({
          initialSeconds: countdownOptions.initialTime,
          onComplete: () => {
            setState(prev => {
              const newCount = prev.completionCount + 1
              if (options.persistKey) {
                setStoredCompletionCount(newCount)
              }
              return {
                ...prev,
                isRunning: false,
                completionCount: newCount
              }
            })
            countdownOptions.onComplete?.()
          },
          callback: () => {}, // Required but handled by onComplete
          autoStart: options.autoStart,
          id: options.persistKey ? `${options.persistKey}_timer` : undefined
        })
        break

      case 'stopwatch':
        const stopwatchOptions = options as StopwatchTimerOptions
        timerIdRef.current = timerManager.createInterval({
          delay: 1000,
          callback: () => {
            setState(prev => {
              const newTime = prev.time + 1
              if (options.persistKey) {
                setStoredTime(newTime)
              }
              stopwatchOptions.onTick?.(newTime)
              return {
                ...prev,
                time: newTime
              }
            })
          },
          autoStart: options.autoStart,
          id: options.persistKey ? `${options.persistKey}_timer` : undefined
        })
        break

      case 'interval':
        const intervalOptions = options as IntervalTimerOptions
        timerIdRef.current = timerManager.createInterval({
          delay: intervalOptions.interval,
          callback: intervalOptions.onInterval,
          autoStart: options.autoStart,
          id: options.persistKey ? `${options.persistKey}_timer` : undefined
        })
        break
    }

    return () => {
      if (timerIdRef.current) {
        timerManager.removeTimer(timerIdRef.current)
      }
    }
  }, [options, timerManager, setStoredTime, setStoredCompletionCount])

  // Control methods
  const start = useCallback(() => {
    if (timerIdRef.current) {
      timerManager.startTimer(timerIdRef.current)
      setState(prev => {
        const newState = {
          ...prev,
          isRunning: true,
          hasStarted: true
        }
        if (options.persistKey) {
          setStoredHasStarted(true)
        }
        return newState
      })
    }
  }, [timerManager, options.persistKey, setStoredHasStarted])

  const pause = useCallback(() => {
    if (timerIdRef.current) {
      timerManager.pauseTimer(timerIdRef.current)
      setState(prev => ({
        ...prev,
        isRunning: false
      }))
    }
  }, [timerManager])

  const reset = useCallback(() => {
    if (timerIdRef.current) {
      timerManager.resetTimer(timerIdRef.current)
      
      const resetTime = options.type === 'countdown' 
        ? (options as CountdownTimerOptions).initialTime 
        : 0
      
      setState(prev => {
        const newState = {
          ...prev,
          time: resetTime,
          isRunning: false,
          hasStarted: false,
          completionCount: 0
        }
        if (options.persistKey) {
          setStoredTime(resetTime)
          setStoredHasStarted(false)
          setStoredCompletionCount(0)
        }
        return newState
      })
    }
  }, [options, timerManager, setStoredTime, setStoredHasStarted, setStoredCompletionCount])

  // Format time for display
  const formatTime = useCallback((timeInSeconds: number): string => {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    const seconds = timeInSeconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [])

  // Get progress percentage (for countdown timers)
  const getProgress = useCallback((): number => {
    if (options.type !== 'countdown') return 0
    
    const initialTime = (options as CountdownTimerOptions).initialTime
    if (initialTime === 0) return 0
    
    return Math.max(0, Math.min(100, (state.time / initialTime) * 100))
  }, [options, state.time])

  return {
    ...state,
    start,
    pause,
    reset,
    formatTime: (time?: number) => formatTime(time ?? state.time),
    getProgress,
    formattedTime: formatTime(state.time)
  }
}

/**
 * Simple countdown timer for quick game use cases
 */
export function useSimpleCountdown(
  initialSeconds: number,
  onComplete?: () => void,
  autoStart: boolean = false
) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(autoStart)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onCompleteRef = useRef(onComplete)
  
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!isRunning) return
    
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          setIsRunning(false)
          onCompleteRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const start = useCallback(() => setIsRunning(true), [])
  const pause = useCallback(() => setIsRunning(false), [])
  const reset = useCallback((newSeconds?: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setSeconds(newSeconds ?? initialSeconds)
    setIsRunning(false)
  }, [initialSeconds])

  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
    formatted: formatSimpleTime(seconds)
  }
}

/**
 * Format seconds to MM:SS format
 */
function formatSimpleTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}