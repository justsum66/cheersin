'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

/** 任務 30：遊戲是否已開始 */
export const GameProgressContext = createContext<{ hasStarted: boolean; setHasStarted: (v: boolean) => void } | null>(null)
export function useGameProgress() {
  return useContext(GameProgressContext)
}

/** 任務 26：本局統計；P1-139 趣味數據 */
export interface GameStatsSnapshot {
  durationSec?: number
  correctCount?: number
  punishmentCount?: number
  funFacts?: Array<{ label: string; value: string }>
}
export const GameStatsContext = createContext<{
  stats: GameStatsSnapshot
  setStats: (s: Partial<GameStatsSnapshot>) => void
} | null>(null)
export function useGameStats() {
  return useContext(GameStatsContext)
}

/** 任務 29：遊戲記錄回放 */
export interface ReplayEvent {
  type: string
  label: string
  payload?: unknown
  ts: number
}
const MAX_REPLAY_EVENTS = 50
/** GAMES_500 #225：設定內本局回放顯示筆數 */
export const REPLAY_UI_DISPLAY_COUNT = 10
export const GameReplayContext = createContext<{
  events: ReplayEvent[]
  addEvent: (e: Omit<ReplayEvent, 'ts'>) => void
} | null>(null)
export function useGameReplay() {
  return useContext(GameReplayContext)
}

/** A1-13：觀戰者狀態 */
export const GameSpectatorContext = createContext<boolean>(false)
export function useGameSpectator(): boolean {
  return useContext(GameSpectatorContext)
}

/** Q2：試玩限 N 局 */
export interface TrialContextValue {
  roundsLeft: number
  onRoundEnd: () => void
  isTrialMode: boolean
}
export const GameTrialContext = createContext<TrialContextValue | null>(null)
export function useGameTrial(): TrialContextValue | null {
  return useContext(GameTrialContext)
}

export interface GameStateProviderProps {
  children: ReactNode
  isSpectator: boolean
  isGuestTrial: boolean
  trialRoundsLeft: number
  onTrialRoundEnd: () => void
  currentGameId: string | null
  /** 受控：parent 傳入則使用（用於換遊戲確認等） */
  gameHasStarted?: boolean
  setGameHasStarted?: (v: boolean) => void
}

export function GameStateProvider({
  children,
  isSpectator,
  isGuestTrial,
  trialRoundsLeft,
  onTrialRoundEnd,
  currentGameId,
  gameHasStarted: controlledStarted,
  setGameHasStarted: controlledSetStarted,
}: GameStateProviderProps) {
  const [internalStarted, setInternalStarted] = useState(false)
  const gameHasStarted = controlledStarted ?? internalStarted
  const setGameHasStarted = controlledSetStarted ?? setInternalStarted
  const [gameStats, setGameStats] = useState<GameStatsSnapshot>({})
  const [replayEvents, setReplayEvents] = useState<ReplayEvent[]>([])

  const setStats = useCallback((s: Partial<GameStatsSnapshot>) => {
    setGameStats((prev) => ({ ...prev, ...s }))
  }, [])

  const addReplayEvent = useCallback((e: Omit<ReplayEvent, 'ts'>) => {
    setReplayEvents((prev) => [...prev.slice(-(MAX_REPLAY_EVENTS - 1)), { ...e, ts: Date.now() }])
  }, [])

  const [prevGameId, setPrevGameId] = useState(currentGameId)
  useEffect(() => {
    if (prevGameId === currentGameId) return
    setPrevGameId(currentGameId)
    setGameStats({})
    setReplayEvents([])
  }, [currentGameId, prevGameId])

  const trialValue: TrialContextValue = isGuestTrial
    ? { roundsLeft: trialRoundsLeft, onRoundEnd: onTrialRoundEnd, isTrialMode: true }
    : { roundsLeft: 0, onRoundEnd: () => {}, isTrialMode: false }

  return (
    <GameProgressContext.Provider value={{ hasStarted: gameHasStarted, setHasStarted: setGameHasStarted }}>
      <GameStatsContext.Provider value={{ stats: gameStats, setStats }}>
        <GameReplayContext.Provider value={{ events: replayEvents, addEvent: addReplayEvent }}>
          <GameSpectatorContext.Provider value={isSpectator}>
            <GameTrialContext.Provider value={trialValue}>
              {children}
            </GameTrialContext.Provider>
          </GameSpectatorContext.Provider>
        </GameReplayContext.Provider>
      </GameStatsContext.Provider>
    </GameProgressContext.Provider>
  )
}

