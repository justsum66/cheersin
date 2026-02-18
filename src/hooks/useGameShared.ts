/**
 * CLEAN-016: Shared game hooks — reusable logic extracted from individual game components.
 * Import these instead of duplicating timer/score/turn logic in each game.
 */

import { useState, useCallback, useRef, useEffect } from 'react'

// ── Countdown Timer Hook ──
export interface UseCountdownOptions {
  initialSeconds: number
  autoStart?: boolean
  onComplete?: () => void
}

export function useCountdown({ initialSeconds, autoStart = false, onComplete }: UseCountdownOptions) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(autoStart)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          onCompleteRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning])

  const start = useCallback(() => setIsRunning(true), [])
  const pause = useCallback(() => setIsRunning(false), [])
  const reset = useCallback((newSeconds?: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setSeconds(newSeconds ?? initialSeconds)
    setIsRunning(false)
  }, [initialSeconds])

  return { seconds, isRunning, start, pause, reset }
}

// ── Turn Manager Hook ──
export interface UseTurnManagerOptions {
  playerCount: number
  initialTurn?: number
}

export function useTurnManager({ playerCount, initialTurn = 0 }: UseTurnManagerOptions) {
  const [currentTurn, setCurrentTurn] = useState(initialTurn)
  const [round, setRound] = useState(1)

  const nextTurn = useCallback(() => {
    setCurrentTurn((prev) => {
      const next = (prev + 1) % playerCount
      if (next === 0) setRound((r) => r + 1)
      return next
    })
  }, [playerCount])

  const resetTurns = useCallback(() => {
    setCurrentTurn(initialTurn)
    setRound(1)
  }, [initialTurn])

  return { currentTurn, round, nextTurn, resetTurns }
}

// ── Score Tracker Hook ──
export function useScoreTracker(playerCount: number) {
  const [scores, setScores] = useState<number[]>(() => Array(playerCount).fill(0))

  const addScore = useCallback((playerIndex: number, points: number) => {
    setScores((prev) => {
      const next = [...prev]
      next[playerIndex] = (next[playerIndex] ?? 0) + points
      return next
    })
  }, [])

  const resetScores = useCallback(() => {
    setScores(Array(playerCount).fill(0))
  }, [playerCount])

  const getWinner = useCallback(() => {
    const max = Math.max(...scores)
    return scores.indexOf(max)
  }, [scores])

  return { scores, addScore, resetScores, getWinner }
}

// ── Phase Machine Hook ──
export type Phase = string

export function usePhase<T extends Phase>(initialPhase: T) {
  const [phase, setPhase] = useState<T>(initialPhase)
  const [history, setHistory] = useState<T[]>([initialPhase])

  const goTo = useCallback((next: T) => {
    setPhase(next)
    setHistory((h) => [...h, next])
  }, [])

  const goBack = useCallback(() => {
    setHistory((h) => {
      if (h.length <= 1) return h
      const newH = h.slice(0, -1)
      setPhase(newH[newH.length - 1])
      return newH
    })
  }, [])

  return { phase, goTo, goBack, history }
}
