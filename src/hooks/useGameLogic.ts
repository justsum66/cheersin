'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useGameSound } from './useGameSound'

/** 通用遊戲狀態類型 */
export type GamePhase = 'idle' | 'playing' | 'paused' | 'finished'

/** 玩家資訊 */
export interface Player {
  id: string
  name: string
  score: number
  isActive: boolean
}

/** 遊戲配置 */
export interface GameConfig {
  /** 最大玩家數 */
  maxPlayers?: number
  /** 回合時間限制（秒） */
  turnTimeLimit?: number
  /** 是否啟用音效 */
  enableSound?: boolean
  /** 遊戲結束條件 */
  endCondition?: 'rounds' | 'score' | 'time' | 'manual'
  /** 最大回合數 */
  maxRounds?: number
  /** 目標分數 */
  targetScore?: number
  /** 房間 Slug */
  roomSlug?: string
  /** 訂閱等級 */
  tier?: string
}

/** 遊戲歷史記錄 */
export interface GameHistoryEntry {
  playerId: string
  action: string
  timestamp: number
  data?: Record<string, unknown>
}

/** useGameLogic Hook 返回類型 */
export interface UseGameLogicReturn<TState = Record<string, unknown>> {
  // 遊戲狀態
  phase: GamePhase
  players: Player[]
  currentPlayerIndex: number
  currentPlayer: Player | null
  round: number
  history: GameHistoryEntry[]
  customState: TState

  // 遊戲控制
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  endGame: () => void
  resetGame: () => void

  // 玩家管理
  addPlayer: (name: string) => string
  removePlayer: (id: string) => void
  updatePlayerScore: (id: string, delta: number) => void
  nextPlayer: () => void
  setActivePlayer: (id: string) => void

  // 自定義狀態
  setCustomState: (state: Partial<TState> | ((prev: TState) => TState)) => void

  // 歷史記錄
  addHistoryEntry: (playerId: string, action: string, data?: Record<string, unknown>) => void

  // 計時器
  timeRemaining: number | null
  startTimer: (seconds: number) => void
  stopTimer: () => void

  // 音效
  playSound: (sound: 'win' | 'lose' | 'click' | 'tick' | 'buzz') => void
}

/** 生成唯一 ID */
function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * 通用遊戲邏輯 Hook
 * 提供遊戲狀態管理、玩家管理、計時器、音效等通用功能
 * 
 * @example
 * ```tsx
 * const {
 *   phase, players, currentPlayer,
 *   startGame, nextPlayer, updatePlayerScore
 * } = useGameLogic<{ question: string }>({
 *   maxPlayers: 8,
 *   turnTimeLimit: 30,
 *   enableSound: true,
 * })
 * ```
 */
export function useGameLogic<TState = Record<string, unknown>>(
  config: GameConfig = {},
  initialState: TState = {} as TState
): UseGameLogicReturn<TState> {
  const {
    maxPlayers = 12,
    turnTimeLimit,
    enableSound = true,
    endCondition = 'manual',
    maxRounds = Infinity,
    targetScore = Infinity,
  } = config

  const { play } = useGameSound()

  // 遊戲狀態
  const [phase, setPhase] = useState<GamePhase>('idle')
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [round, setRound] = useState(1)
  const [history, setHistory] = useState<GameHistoryEntry[]>([])
  const [customState, setCustomStateInternal] = useState<TState>(initialState)

  // 計時器
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const gameEndedRef = useRef(false)

  // 計算當前玩家
  const currentPlayer = players.length > 0 ? players[currentPlayerIndex] : null

  // 遊戲控制
  const startGame = useCallback(() => {
    if (players.length < 1) return
    gameEndedRef.current = false
    setPhase('playing')
    setRound(1)
    setCurrentPlayerIndex(0)
    setHistory([])
    if (enableSound) play('click')

    // 如果有回合時間限制，啟動計時器
    if (turnTimeLimit) {
      setTimeRemaining(turnTimeLimit)
    }
  }, [players.length, enableSound, play, turnTimeLimit])

  const pauseGame = useCallback(() => {
    setPhase('paused')
    if (timerRef.current) {
      clearInterval(timerRef.current)
timerRef.current = null
    }
  }, [])

  const resumeGame = useCallback(() => {
    setPhase('playing')
    // OPT-003: Clear existing timer before creating new one to prevent accumulation
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    // 恢復計時器
    if (timeRemaining && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }, [timeRemaining])

  const endGame = useCallback(() => {
    if (gameEndedRef.current) return
    gameEndedRef.current = true
    setPhase('finished')
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (enableSound) play('win')
  }, [enableSound, play])

  const resetGame = useCallback(() => {
    gameEndedRef.current = false
    setPhase('idle')
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0, isActive: false })))
    setCurrentPlayerIndex(0)
    setRound(1)
    setHistory([])
    setTimeRemaining(null)
    setCustomStateInternal(initialState)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [initialState])

  // 玩家管理
  const addPlayer = useCallback(
    (name: string): string => {
      if (players.length >= maxPlayers) return ''
      const id = generateId()
      setPlayers((prev) => [...prev, { id, name, score: 0, isActive: false }])
      return id
    },
    [players.length, maxPlayers]
  )

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const updatePlayerScore = useCallback((id: string, delta: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, score: p.score + delta } : p))
    )
  }, [])

  const nextPlayer = useCallback(() => {
    setCurrentPlayerIndex((prev) => {
      const next = (prev + 1) % players.length
      // 如果回到第一個玩家，增加回合數
      if (next === 0) {
        setRound((r) => {
          const newRound = r + 1
          // 檢查是否達到最大回合數
          if (endCondition === 'rounds' && newRound > maxRounds) {
            endGame()
          }
          return newRound
        })
      }
      return next
    })

    // 重置回合計時器
    if (turnTimeLimit) {
      setTimeRemaining(turnTimeLimit)
    }

    if (enableSound) play('click')
  }, [players.length, turnTimeLimit, enableSound, play, endCondition, maxRounds, endGame])

  const setActivePlayer = useCallback((id: string) => {
    const index = players.findIndex((p) => p.id === id)
    if (index !== -1) {
      setCurrentPlayerIndex(index)
    }
  }, [players])

  // 自定義狀態
  const setCustomState = useCallback(
    (state: Partial<TState> | ((prev: TState) => TState)) => {
      setCustomStateInternal((prev) => {
        if (typeof state === 'function') {
          return state(prev)
        }
        return { ...prev, ...state }
      })
    },
    []
  )

  // 歷史記錄
  const addHistoryEntry = useCallback(
    (playerId: string, action: string, data?: Record<string, unknown>) => {
      setHistory((prev) => [
        ...prev,
        { playerId, action, timestamp: Date.now(), data },
      ])
    },
    []
  )

  // 計時器控制
  const startTimer = useCallback((seconds: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setTimeRemaining(seconds)
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setTimeRemaining(null)
  }, [])

  // 音效
  const playSound = useCallback(
    (sound: 'win' | 'lose' | 'click' | 'tick' | 'buzz') => {
      if (enableSound) {
        play(sound as Parameters<typeof play>[0])
      }
    },
    [enableSound, play]
  )

  // 清理計時器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // 檢查分數結束條件
  useEffect(() => {
    if (endCondition === 'score' && phase === 'playing') {
      const winner = players.find((p) => p.score >= targetScore)
      if (winner) {
        endGame()
      }
    }
  }, [players, endCondition, targetScore, phase, endGame])

  return {
    phase,
    players,
    currentPlayerIndex,
    currentPlayer,
    round,
    history,
    customState,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
    addPlayer,
    removePlayer,
    updatePlayerScore,
    nextPlayer,
    setActivePlayer,
    setCustomState,
    addHistoryEntry,
    timeRemaining,
    startTimer,
    stopTimer,
    playSound,
  }
}

export default useGameLogic
