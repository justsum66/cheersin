'use client'

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useGameStore, type GameStatsSnapshot, type ReplayEvent } from '@/store/useGameStore'

/** 任務 30：遊戲是否已開始 (Bridged to Zustand) */
export const GameProgressContext = createContext<{ hasStarted: boolean; setHasStarted: (v: boolean) => void } | null>(null)
export function useGameProgress() {
  return useContext(GameProgressContext)
}

/** 任務 26：本局統計 (Bridged to Zustand) */
export { type GameStatsSnapshot }
export const GameStatsContext = createContext<{
  stats: GameStatsSnapshot
  setStats: (s: Partial<GameStatsSnapshot>) => void
} | null>(null)
export function useGameStats() {
  return useContext(GameStatsContext)
}

/** 任務 29：遊戲記錄回放 (Bridged to Zustand) */
export { type ReplayEvent }
export const REPLAY_UI_DISPLAY_COUNT = 10
export const GameReplayContext = createContext<{
  events: ReplayEvent[]
  addEvent: (e: Omit<ReplayEvent, 'ts'>) => void
} | null>(null)
export function useGameReplay() {
  return useContext(GameReplayContext)
}

/** A1-13：觀戰者狀態 (Bridged to Zustand) */
export const GameSpectatorContext = createContext<boolean>(false)
export function useGameSpectator(): boolean {
  return useContext(GameSpectatorContext)
}

/** Q2：試玩限 N 局 (Bridged to Zustand) */
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
  /** 受控：parent 傳入則使用（用於換遊戲確認等） - Legacy prop support */
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
  // Connect to Zustand
  const gameState = useGameStore(state => state.gameState)
  const setGameState = useGameStore(state => state.setGameState)
  const stats = useGameStore(state => state.stats)
  const setStats = useGameStore(state => state.setStats)
  const events = useGameStore(state => state.replayEvents)
  const addReplayEvent = useGameStore(state => state.addReplayEvent)
  //   const spectator = useGameStore(state => state.isSpectator)
  const setSpec = useGameStore(state => state.setSpectator)
  const setTrial = useGameStore(state => state.setTrial)
  //   const trialState = useGameStore(state => state.trial)
  const setCurrentGameId = useGameStore(state => state.setCurrentGameId)

  // Sync props to store (one-way sync for now)
  useEffect(() => {
    setSpec(isSpectator)
  }, [isSpectator, setSpec])

  useEffect(() => {
    setTrial(isGuestTrial, trialRoundsLeft)
  }, [isGuestTrial, trialRoundsLeft, setTrial])

  useEffect(() => {
    if (currentGameId) setCurrentGameId(currentGameId)
  }, [currentGameId, setCurrentGameId])

  // Handle start state syncing
  // This is tricky because the prop might control it.
  // We'll trust the store primarily, but if prop is provided, we respect that for "hasStarted"
  const hasStarted = controlledStarted ?? (gameState === 'playing' || gameState === 'paused')

  const handleSetStarted = (start: boolean) => {
    if (controlledSetStarted) {
      controlledSetStarted(start)
    }
    setGameState(start ? 'playing' : 'lobby')
  }

  const trialValue: TrialContextValue = isGuestTrial
    ? { roundsLeft: trialRoundsLeft, onRoundEnd: onTrialRoundEnd, isTrialMode: true }
    : { roundsLeft: 0, onRoundEnd: () => { }, isTrialMode: false }

  return (
    <GameProgressContext.Provider value={{ hasStarted, setHasStarted: handleSetStarted }}>
      <GameStatsContext.Provider value={{ stats, setStats }}>
        <GameReplayContext.Provider value={{ events, addEvent: addReplayEvent }}>
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
