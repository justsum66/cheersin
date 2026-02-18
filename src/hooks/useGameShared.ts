/**
 * CLEAN-016: Shared game hooks — reusable logic extracted from individual game components.
 * Import these instead of duplicating timer/score/turn logic in each game.
 * Extended with additional game-specific utilities.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { usePersistentStorage } from './usePersistentStorage'
import { useTimerManager } from './useTimerManager'

// ── Countdown Timer Hook ──
export interface UseCountdownOptions {
  initialSeconds: number
  autoStart?: boolean
  onComplete?: () => void
  /** Persist timer state */
  persistKey?: string
}

export function useCountdown({ 
  initialSeconds, 
  autoStart = false, 
  onComplete,
  persistKey
}: UseCountdownOptions) {
  // Use persistent storage if key provided
  const [storedSeconds, setStoredSeconds] = persistKey 
    ? usePersistentStorage(persistKey, initialSeconds)
    : [initialSeconds, () => {}]

  const [seconds, setSeconds] = useState(storedSeconds)
  const [isRunning, setIsRunning] = useState(autoStart)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Sync with stored value
  useEffect(() => {
    if (!persistKey) return
    setSeconds(storedSeconds)
  }, [storedSeconds, persistKey])

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        const next = prev <= 1 ? 0 : prev - 1
        if (prev <= 1) {
          setIsRunning(false)
          onCompleteRef.current?.()
        }
        // Update stored value if persisting
        if (persistKey) {
          setStoredSeconds(next)
        }
        return next
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, persistKey, setStoredSeconds])

  const start = useCallback(() => setIsRunning(true), [])
  const pause = useCallback(() => setIsRunning(false), [])
  const reset = useCallback((newSeconds?: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    const resetValue = newSeconds ?? initialSeconds
    setSeconds(resetValue)
    if (persistKey) {
      setStoredSeconds(resetValue)
    }
    setIsRunning(false)
  }, [initialSeconds, persistKey, setStoredSeconds])

  return { seconds, isRunning, start, pause, reset, formatted: formatTime(seconds) }
}

// ── Turn Manager Hook ──
export interface UseTurnManagerOptions {
  playerCount: number
  initialTurn?: number
  /** Persist turn state */
  persistKey?: string
}

export function useTurnManager({ 
  playerCount, 
  initialTurn = 0,
  persistKey
}: UseTurnManagerOptions) {
  // Use persistent storage if key provided
  const [storedTurn, setStoredTurn] = persistKey 
    ? usePersistentStorage(`${persistKey}_turn`, initialTurn)
    : [initialTurn, () => {}]
    
  const [storedRound, setStoredRound] = persistKey 
    ? usePersistentStorage(`${persistKey}_round`, 1)
    : [1, () => {}]

  const [currentTurn, setCurrentTurn] = useState(storedTurn)
  const [round, setRound] = useState(storedRound)

  // Sync with stored values
  useEffect(() => {
    if (!persistKey) return
    setCurrentTurn(storedTurn)
    setRound(storedRound)
  }, [storedTurn, storedRound, persistKey])

  const nextTurn = useCallback(() => {
    setCurrentTurn((prev) => {
      const next = (prev + 1) % playerCount
      const newRound = next === 0 ? round + 1 : round
      
      if (persistKey) {
        setStoredTurn(next)
        if (newRound !== round) {
          setStoredRound(newRound)
        }
      }
      
      if (next === 0) setRound(newRound)
      return next
    })
  }, [playerCount, round, persistKey, setStoredTurn, setStoredRound])

  const resetTurns = useCallback(() => {
    const resetTurn = initialTurn
    const resetRound = 1
    
    setCurrentTurn(resetTurn)
    setRound(resetRound)
    
    if (persistKey) {
      setStoredTurn(resetTurn)
      setStoredRound(resetRound)
    }
  }, [initialTurn, persistKey, setStoredTurn, setStoredRound])

  return { currentTurn, round, nextTurn, resetTurns }
}

// ── Score Tracker Hook ──
export interface UseScoreTrackerOptions {
  playerCount: number
  /** Persist scores */
  persistKey?: string
}

export function useScoreTracker({ 
  playerCount, 
  persistKey
}: UseScoreTrackerOptions) {
  // Use persistent storage if key provided
  const [storedScores, setStoredScores] = persistKey 
    ? usePersistentStorage(`${persistKey}_scores`, Array(playerCount).fill(0))
    : [Array(playerCount).fill(0), () => {}]

  const [scores, setScores] = useState<number[]>(storedScores)

  // Sync with stored values
  useEffect(() => {
    if (!persistKey) return
    setScores(storedScores)
  }, [storedScores, persistKey])

  const addScore = useCallback((playerIndex: number, points: number) => {
    setScores((prev) => {
      const next = [...prev]
      next[playerIndex] = (next[playerIndex] ?? 0) + points
      
      if (persistKey) {
        setStoredScores(next)
      }
      
      return next
    })
  }, [persistKey, setStoredScores])

  const resetScores = useCallback(() => {
    const resetScores = Array(playerCount).fill(0)
    setScores(resetScores)
    if (persistKey) {
      setStoredScores(resetScores)
    }
  }, [playerCount, persistKey, setStoredScores])

  const getWinner = useCallback(() => {
    const max = Math.max(...scores)
    return scores.indexOf(max)
  }, [scores])

  const getWinners = useCallback(() => {
    const max = Math.max(...scores)
    return scores.map((score, index) => score === max ? index : -1).filter(index => index !== -1)
  }, [scores])

  return { scores, addScore, resetScores, getWinner, getWinners }
}

// ── Phase Machine Hook ──
export type Phase = string

export interface UsePhaseOptions<T extends Phase> {
  initialPhase: T
  /** Persist phase state */
  persistKey?: string
}

export function usePhase<T extends Phase>({ 
  initialPhase, 
  persistKey
}: UsePhaseOptions<T>) {
  // Use persistent storage if key provided
  const [storedPhase, setStoredPhase] = persistKey 
    ? usePersistentStorage(`${persistKey}_phase`, initialPhase)
    : [initialPhase, () => {}]
    
  const [storedHistory, setStoredHistory] = persistKey 
    ? usePersistentStorage(`${persistKey}_history`, [initialPhase] as T[])
    : [[initialPhase], () => {}]

  const [phase, setPhase] = useState<T>(storedPhase)
  const [history, setHistory] = useState<T[]>(storedHistory)

  // Sync with stored values
  useEffect(() => {
    if (!persistKey) return
    setPhase(storedPhase)
    setHistory(storedHistory)
  }, [storedPhase, storedHistory, persistKey])

  const goTo = useCallback((next: T) => {
    setPhase(next)
    setHistory((h) => {
      const newHistory = [...h, next]
      if (persistKey) {
        setStoredPhase(next)
        setStoredHistory(newHistory)
      }
      return newHistory
    })
  }, [persistKey, setStoredPhase, setStoredHistory])

  const goBack = useCallback(() => {
    setHistory((h) => {
      if (h.length <= 1) return h
      const newH = h.slice(0, -1)
      const previousPhase = newH[newH.length - 1]
      setPhase(previousPhase)
      
      if (persistKey) {
        setStoredPhase(previousPhase)
        setStoredHistory(newH)
      }
      
      return newH
    })
  }, [persistKey, setStoredPhase, setStoredHistory])

  return { phase, goTo, goBack, history }
}

// ── Game State Manager Hook ──
export interface UseGameStateOptions<T> {
  /** Initial game state */
  initialState: T
  /** Persist state */
  persistKey?: string
  /** Validation function for state */
  validate?: (state: unknown) => state is T
}

export function useGameState<T>({ 
  initialState, 
  persistKey,
  validate
}: UseGameStateOptions<T>) {
  const [state, setState] = persistKey 
    ? usePersistentStorage(persistKey, initialState, { validate })
    : [initialState, () => {}]

  const updateState = useCallback((updater: (prevState: T) => T) => {
    setState((prev: T) => {
      const newState = updater(prev)
      return newState
    })
  }, [setState])

  const resetState = useCallback(() => {
    setState(initialState)
  }, [initialState, setState])

  return { state, setState: updateState, resetState }
}

// ── Player Manager Hook ──
export interface Player {
  id: string
  name: string
  avatar?: string
  isReady?: boolean
}

export interface UsePlayerManagerOptions {
  maxPlayers: number
  /** Persist player list */
  persistKey?: string
}

export function usePlayerManager({ 
  maxPlayers, 
  persistKey
}: UsePlayerManagerOptions) {
  const [storedPlayers, setStoredPlayers] = persistKey 
    ? usePersistentStorage<Player[]>(`${persistKey}_players`, [])
    : [[], () => {}]

  const [players, setPlayers] = useState<Player[]>(storedPlayers)

  // Sync with stored values
  useEffect(() => {
    if (!persistKey) return
    setPlayers(storedPlayers)
  }, [storedPlayers, persistKey])

  const addPlayer = useCallback((player: Omit<Player, 'id'>) => {
    if (players.length >= maxPlayers) return false
    
    const newPlayer: Player = {
      ...player,
      id: Math.random().toString(36).substr(2, 9),
      isReady: false
    }
    
    setPlayers(prev => {
      const newPlayers = [...prev, newPlayer]
      if (persistKey) {
        setStoredPlayers(newPlayers)
      }
      return newPlayers
    })
    
    return true
  }, [players.length, maxPlayers, persistKey, setStoredPlayers])

  const removePlayer = useCallback((playerId: string) => {
    setPlayers(prev => {
      const newPlayers = prev.filter(p => p.id !== playerId)
      if (persistKey) {
        setStoredPlayers(newPlayers)
      }
      return newPlayers
    })
  }, [persistKey, setStoredPlayers])

  const updatePlayer = useCallback((playerId: string, updates: Partial<Player>) => {
    setPlayers(prev => {
      const newPlayers = prev.map(p => 
        p.id === playerId ? { ...p, ...updates } : p
      )
      if (persistKey) {
        setStoredPlayers(newPlayers)
      }
      return newPlayers
    })
  }, [persistKey, setStoredPlayers])

  const setPlayerReady = useCallback((playerId: string, isReady: boolean) => {
    updatePlayer(playerId, { isReady })
  }, [updatePlayer])

  const isAllReady = useMemo(() => {
    return players.length > 0 && players.every(p => p.isReady)
  }, [players])

  const resetPlayers = useCallback(() => {
    setPlayers([])
    if (persistKey) {
      setStoredPlayers([])
    }
  }, [persistKey, setStoredPlayers])

  return {
    players,
    addPlayer,
    removePlayer,
    updatePlayer,
    setPlayerReady,
    isAllReady,
    resetPlayers,
    playerCount: players.length
  }
}

// ── Game Timer Hook (uses TimerManager) ──
export interface UseGameTimerOptions {
  /** Timer configuration */
  timerConfig: {
    type: 'countdown' | 'interval'
    duration?: number // for countdown
    interval?: number // for interval
  }
  /** Auto-start timer */
  autoStart?: boolean
  /** Persist timer state */
  persistKey?: string
  /** Callbacks */
  onComplete?: () => void
  onTick?: (remaining: number) => void
}

export function useGameTimer({ 
  timerConfig,
  autoStart = false,
  persistKey,
  onComplete,
  onTick
}: UseGameTimerOptions) {
  const timerManager = useTimerManager()
  const timerIdRef = useRef<string | null>(null)
  
  const [remainingTime, setRemainingTime] = persistKey 
    ? usePersistentStorage(`${persistKey}_remaining`, timerConfig.duration || 0)
    : [timerConfig.duration || 0, () => {}]

  const [isRunning, setIsRunning] = useState(autoStart)

  // Initialize timer
  useEffect(() => {
    if (timerConfig.type === 'countdown' && timerConfig.duration) {
      timerIdRef.current = timerManager.createCountdown({
        initialSeconds: timerConfig.duration,
        onComplete: () => {
          setIsRunning(false)
          onComplete?.()
        },
        callback: () => {}, // Required but empty for countdown
        autoStart,
        id: persistKey
      })
    } else if (timerConfig.type === 'interval' && timerConfig.interval) {
      timerIdRef.current = timerManager.createInterval({
        delay: timerConfig.interval,
        callback: () => {
          onTick?.(0)
        },
        autoStart,
        id: persistKey
      })
    }
    
    return () => {
      if (timerIdRef.current) {
        timerManager.removeTimer(timerIdRef.current)
      }
    }
  }, [timerConfig, autoStart, timerManager, onComplete, onTick, persistKey])

  // Control methods
  const start = useCallback(() => {
    if (timerIdRef.current) {
      timerManager.startTimer(timerIdRef.current)
      setIsRunning(true)
    }
  }, [timerManager])

  const pause = useCallback(() => {
    if (timerIdRef.current) {
      timerManager.pauseTimer(timerIdRef.current)
      setIsRunning(false)
    }
  }, [timerManager])

  const reset = useCallback(() => {
    if (timerIdRef.current) {
      timerManager.resetTimer(timerIdRef.current)
      if (timerConfig.type === 'countdown') {
        setRemainingTime(timerConfig.duration || 0)
      }
      setIsRunning(false)
    }
  }, [timerManager, timerConfig, setRemainingTime])

  return {
    remainingTime,
    isRunning,
    start,
    pause,
    reset,
    formatted: timerConfig.type === 'countdown' ? formatTime(remainingTime) : undefined
  }
}

// ── Utility Functions ──
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}