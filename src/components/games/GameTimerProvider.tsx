'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

/** 任務 22：暫停狀態，子遊戲可讀 isPaused 凍結計時器 */
export const GamePauseContext = createContext<{ isPaused: boolean; setPaused: (v: boolean) => void } | null>(null)
export function useGamePause() {
  return useContext(GamePauseContext)
}

export interface GameTimerProviderProps {
  children: ReactNode
  /** 受控：由 parent 傳入則使用 */
  isPaused?: boolean
  setPaused?: (v: boolean) => void
}

export function GameTimerProvider({ children, isPaused: controlledPaused, setPaused: controlledSetPaused }: GameTimerProviderProps) {
  const [internalPaused, setInternalPaused] = useState(false)
  const setInternal = useCallback((v: boolean) => setInternalPaused(v), [])
  const isPaused = controlledPaused ?? internalPaused
  const setPaused = controlledSetPaused ?? setInternal
  return (
    <GamePauseContext.Provider value={{ isPaused, setPaused }}>
      {children}
    </GamePauseContext.Provider>
  )
}
