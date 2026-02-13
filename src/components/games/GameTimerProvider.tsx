'use client'

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useGameStore } from '@/store/useGameStore'

/** 任務 22：暫停狀態，子遊戲可讀 isPaused 凍結計時器 (Bridged to Zustand) */
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

  const gameState = useGameStore(state => state.gameState)
  const setGameState = useGameStore(state => state.setGameState)

  // Map store state to boolean
  const isPausedStore = gameState === 'paused'

  // Decide effective state
  const isPaused = controlledPaused ?? isPausedStore

  const setPaused = (v: boolean) => {
    if (controlledSetPaused) {
      controlledSetPaused(v)
    }

    // Update store
    if (v) {
      setGameState('paused')
    } else {
      // Only switch to playing if we were paused. 
      // If we are in lobby or finished, unpausing might not mean playing.
      // But typically timer provider implies active game.
      if (gameState === 'paused') {
        setGameState('playing')
      }
    }
  }

  // Sync if controlled changes (optional, but good for consistency)
  useEffect(() => {
    if (controlledPaused !== undefined) {
      if (controlledPaused && gameState !== 'paused') setGameState('paused')
      if (!controlledPaused && gameState === 'paused') setGameState('playing')
    }
  }, [controlledPaused, gameState, setGameState])

  return (
    <GamePauseContext.Provider value={{ isPaused, setPaused }}>
      {children}
    </GamePauseContext.Provider>
  )
}
