/**
 * Phase 3 Stage 2: useTimerManager Hook
 * Unified timer management with advanced features and automatic cleanup
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'
type TimerType = 'interval' | 'timeout' | 'countdown'

interface BaseTimerConfig {
  /** Timer type */
  type: TimerType
  /** Callback function to execute */
  callback: () => void
  /** Auto-start the timer */
  autoStart?: boolean
  /** Execute callback immediately on start */
  immediate?: boolean
  /** Persist timer state across component re-renders */
  persist?: boolean
  /** Unique identifier for persistence */
  id?: string
}

interface IntervalConfig extends BaseTimerConfig {
  type: 'interval'
  /** Interval delay in milliseconds */
  delay: number
}

interface TimeoutConfig extends BaseTimerConfig {
  type: 'timeout'
  /** Timeout delay in milliseconds */
  delay: number
}

interface CountdownConfig extends BaseTimerConfig {
  type: 'countdown'
  /** Initial countdown value in seconds */
  initialSeconds: number
  /** Callback when countdown completes */
  onComplete?: () => void
  /** Update interval in milliseconds */
  updateInterval?: number
}

type TimerConfig = IntervalConfig | TimeoutConfig | CountdownConfig

interface TimerInstance {
  id: string
  config: TimerConfig
  status: TimerStatus
  ref: ReturnType<typeof setInterval> | ReturnType<typeof setTimeout> | null
  startTime?: number
  remainingTime?: number
}

interface TimerManagerState {
  timers: Map<string, TimerInstance>
  activeCount: number
}

/**
 * Advanced timer manager hook with multiple timer types and persistence
 */
export function useTimerManager() {
  const [state, setState] = useState<TimerManagerState>({
    timers: new Map(),
    activeCount: 0
  })
  
  const stateRef = useRef(state)
  stateRef.current = state

  // Generate unique timer ID
  const generateId = useCallback((config: TimerConfig): string => {
    return config.id || `${config.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Update state helper
  const updateState = useCallback((updater: (prevState: TimerManagerState) => TimerManagerState) => {
    setState(prev => {
      const newState = updater(prev)
      stateRef.current = newState
      return newState
    })
  }, [])

  // Clear timer reference
  const clearTimerRef = useCallback((timerId: string) => {
    updateState(prev => {
      const timer = prev.timers.get(timerId)
      if (timer?.ref) {
        if (timer.config.type === 'interval') {
          clearInterval(timer.ref as ReturnType<typeof setInterval>)
        } else {
          clearTimeout(timer.ref as ReturnType<typeof setTimeout>)
        }
      }
      
      const newTimers = new Map(prev.timers)
      const updatedTimer = { ...timer!, ref: null }
      newTimers.set(timerId, updatedTimer)
      
      return {
        timers: newTimers,
        activeCount: prev.activeCount > 0 ? prev.activeCount - 1 : 0
      }
    })
  }, [updateState])

  // Create interval timer
  const createInterval = useCallback((config: Omit<IntervalConfig, 'type'>) => {
    const fullConfig: IntervalConfig = {
      type: 'interval',
      ...config
    }
    
    const timerId = generateId(fullConfig)
    
    updateState(prev => {
      const newTimers = new Map(prev.timers)
      const timerInstance: TimerInstance = {
        id: timerId,
        config: fullConfig,
        status: 'idle',
        ref: null
      }
      
      newTimers.set(timerId, timerInstance)
      
      return {
        timers: newTimers,
        activeCount: prev.activeCount
      }
    })
    
    return timerId
  }, [generateId, updateState])

  // Create timeout timer
  const createTimeout = useCallback((config: Omit<TimeoutConfig, 'type'>) => {
    const fullConfig: TimeoutConfig = {
      type: 'timeout',
      ...config
    }
    
    const timerId = generateId(fullConfig)
    
    updateState(prev => {
      const newTimers = new Map(prev.timers)
      const timerInstance: TimerInstance = {
        id: timerId,
        config: fullConfig,
        status: 'idle',
        ref: null
      }
      
      newTimers.set(timerId, timerInstance)
      
      return {
        timers: newTimers,
        activeCount: prev.activeCount
      }
    })
    
    return timerId
  }, [generateId, updateState])

  // Create countdown timer
  const createCountdown = useCallback((config: Omit<CountdownConfig, 'type'>) => {
    const fullConfig: CountdownConfig = {
      type: 'countdown',
      updateInterval: 1000,
      ...config
    }
    
    const timerId = generateId(fullConfig)
    
    updateState(prev => {
      const newTimers = new Map(prev.timers)
      const timerInstance: TimerInstance = {
        id: timerId,
        config: fullConfig,
        status: 'idle',
        ref: null,
        remainingTime: fullConfig.initialSeconds
      }
      
      newTimers.set(timerId, timerInstance)
      
      return {
        timers: newTimers,
        activeCount: prev.activeCount
      }
    })
    
    return timerId
  }, [generateId, updateState])

  // Start timer
  const startTimer = useCallback((timerId: string) => {
    updateState(prev => {
      const timer = prev.timers.get(timerId)
      if (!timer || timer.status === 'running') return prev
      
      const newTimers = new Map(prev.timers)
      
      // Handle immediate execution
      if (timer.config.immediate) {
        timer.config.callback()
      }
      
      let newRef: ReturnType<typeof setInterval> | ReturnType<typeof setTimeout> | null = null
      let startTime = Date.now()
      
      switch (timer.config.type) {
        case 'interval':
          newRef = setInterval(timer.config.callback, (timer.config as IntervalConfig).delay)
          break
          
        case 'timeout':
          newRef = setTimeout(() => {
            timer.config.callback()
            clearTimerRef(timerId)
          }, (timer.config as TimeoutConfig).delay)
          break
          
        case 'countdown':
          const countdownConfig = timer.config as CountdownConfig
          startTime = Date.now()
          
          newRef = setInterval(() => {
            updateState(currentState => {
              const currentTimer = currentState.timers.get(timerId)
              if (!currentTimer) return currentState
              
              const elapsed = Math.floor((Date.now() - startTime) / 1000)
              const remaining = Math.max(0, countdownConfig.initialSeconds - elapsed)
              
              if (remaining <= 0) {
                countdownConfig.onComplete?.()
                clearTimerRef(timerId)
                return currentState
              }
              
              const updatedTimers = new Map(currentState.timers)
              updatedTimers.set(timerId, {
                ...currentTimer,
                remainingTime: remaining
              })
              
              return {
                timers: updatedTimers,
                activeCount: currentState.activeCount
              }
            })
          }, countdownConfig.updateInterval)
          break
      }
      
      const updatedTimer = {
        ...timer,
        status: 'running' as TimerStatus,
        ref: newRef,
        startTime
      }
      
      newTimers.set(timerId, updatedTimer)
      
      return {
        timers: newTimers,
        activeCount: prev.activeCount + 1
      }
    })
  }, [updateState, clearTimerRef])

  // Pause timer
  const pauseTimer = useCallback((timerId: string) => {
    updateState(prev => {
      const timer = prev.timers.get(timerId)
      if (!timer || timer.status !== 'running') return prev
      
      const newTimers = new Map(prev.timers)
      
      // Calculate remaining time for countdown timers
      let remainingTime = timer.remainingTime
      if (timer.config.type === 'countdown' && timer.startTime) {
        const elapsed = Math.floor((Date.now() - timer.startTime) / 1000)
        remainingTime = Math.max(0, (timer.config as CountdownConfig).initialSeconds - elapsed)
      }
      
      const updatedTimer = {
        ...timer,
        status: 'paused' as TimerStatus,
        remainingTime
      }
      
      newTimers.set(timerId, updatedTimer)
      clearTimerRef(timerId)
      
      return {
        timers: newTimers,
        activeCount: prev.activeCount > 0 ? prev.activeCount - 1 : 0
      }
    })
  }, [updateState, clearTimerRef])

  // Resume timer
  const resumeTimer = useCallback((timerId: string) => {
    updateState(prev => {
      const timer = prev.timers.get(timerId)
      if (!timer || timer.status !== 'paused') return prev
      
      const newTimers = new Map(prev.timers)
      const updatedTimer = { ...timer, status: 'running' as TimerStatus }
      newTimers.set(timerId, updatedTimer)
      
      // For countdown timers, adjust start time based on remaining time
      if (timer.config.type === 'countdown' && timer.remainingTime !== undefined) {
        const countdownConfig = timer.config as CountdownConfig
        const adjustedStartTime = Date.now() - (countdownConfig.initialSeconds - timer.remainingTime) * 1000
        updatedTimer.startTime = adjustedStartTime
      }
      
      return {
        timers: newTimers,
        activeCount: prev.activeCount + 1
      }
    })
    
    startTimer(timerId)
  }, [updateState, startTimer])

  // Reset timer
  const resetTimer = useCallback((timerId: string) => {
    updateState(prev => {
      const timer = prev.timers.get(timerId)
      if (!timer) return prev
      
      const newTimers = new Map(prev.timers)
      
      // Clear existing timer
      if (timer.ref) {
        if (timer.config.type === 'interval') {
          clearInterval(timer.ref as ReturnType<typeof setInterval>)
        } else {
          clearTimeout(timer.ref as ReturnType<typeof setTimeout>)
        }
      }
      
      // Reset to initial state
      const resetTimer: TimerInstance = {
        ...timer,
        status: 'idle',
        ref: null,
        startTime: undefined,
        remainingTime: timer.config.type === 'countdown' 
          ? (timer.config as CountdownConfig).initialSeconds 
          : undefined
      }
      
      newTimers.set(timerId, resetTimer)
      
      const activeCount = prev.activeCount > 0 ? prev.activeCount - 1 : 0
      
      return {
        timers: newTimers,
        activeCount
      }
    })
  }, [updateState])

  // Remove timer
  const removeTimer = useCallback((timerId: string) => {
    updateState(prev => {
      const timer = prev.timers.get(timerId)
      if (!timer) return prev
      
      // Clear timer reference
      if (timer.ref) {
        if (timer.config.type === 'interval') {
          clearInterval(timer.ref as ReturnType<typeof setInterval>)
        } else {
          clearTimeout(timer.ref as ReturnType<typeof setTimeout>)
        }
      }
      
      const newTimers = new Map(prev.timers)
      newTimers.delete(timerId)
      
      const activeCount = prev.activeCount > 0 ? prev.activeCount - 1 : 0
      
      return {
        timers: newTimers,
        activeCount
      }
    })
  }, [updateState])

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      stateRef.current.timers.forEach((timer, timerId) => {
        if (timer.ref) {
          if (timer.config.type === 'interval') {
            clearInterval(timer.ref as ReturnType<typeof setInterval>)
          } else {
            clearTimeout(timer.ref as ReturnType<typeof setTimeout>)
          }
        }
      })
    }
  }, [])

  // Get timer info
  const getTimer = useCallback((timerId: string) => {
    return state.timers.get(timerId)
  }, [state.timers])

  // Get all timers
  const getAllTimers = useCallback(() => {
    return Array.from(state.timers.values())
  }, [state.timers])

  // Timer hooks for easy usage
  const useTimer = useCallback((config: TimerConfig) => {
    const timerIdRef = useRef<string | null>(null)
    
    useEffect(() => {
      if (!timerIdRef.current) {
        let id: string
        switch (config.type) {
          case 'interval':
            id = createInterval(config as Omit<IntervalConfig, 'type'>)
            break
          case 'timeout':
            id = createTimeout(config as Omit<TimeoutConfig, 'type'>)
            break
          case 'countdown':
            id = createCountdown(config as Omit<CountdownConfig, 'type'>)
            break
          default:
            throw new Error('Invalid timer type')
        }
        timerIdRef.current = id
        
        if (config.autoStart) {
          startTimer(id)
        }
      }
      
      return () => {
        if (timerIdRef.current) {
          removeTimer(timerIdRef.current)
        }
      }
    }, [config, createInterval, createTimeout, createCountdown, startTimer, removeTimer])
    
    return {
      timerId: timerIdRef.current,
      start: () => timerIdRef.current && startTimer(timerIdRef.current),
      pause: () => timerIdRef.current && pauseTimer(timerIdRef.current),
      resume: () => timerIdRef.current && resumeTimer(timerIdRef.current),
      reset: () => timerIdRef.current && resetTimer(timerIdRef.current),
      remove: () => timerIdRef.current && removeTimer(timerIdRef.current)
    }
  }, [createInterval, createTimeout, createCountdown, startTimer, pauseTimer, resumeTimer, resetTimer, removeTimer])

  return {
    // Timer creation methods
    createInterval,
    createTimeout,
    createCountdown,
    
    // Timer control methods
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    removeTimer,
    
    // Timer info methods
    getTimer,
    getAllTimers,
    
    // Easy-to-use hook
    useTimer,
    
    // State
    timers: state.timers,
    activeCount: state.activeCount,
    totalTimers: state.timers.size
  }
}

/**
 * Simplified countdown timer hook for common use cases
 */
export function useCountdownTimer(
  initialSeconds: number,
  onComplete?: () => void,
  autoStart: boolean = false
) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(autoStart)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
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
    formatted: formatTime(seconds)
  }
}

/**
 * Format seconds to MM:SS format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}