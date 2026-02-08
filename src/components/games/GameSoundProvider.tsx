'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

/** 遊戲音效開關；子元件可讀寫。預設開啟。 */
export const GameSoundContext = createContext<{ enabled: boolean; setEnabled: (v: boolean) => void } | null>(null)
export function useGameSound() {
  return useContext(GameSoundContext)
}

export function GameSoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true)
  const setEnabledStable = useCallback((v: boolean) => setEnabled(v), [])
  return (
    <GameSoundContext.Provider value={{ enabled, setEnabled: setEnabledStable }}>
      {children}
    </GameSoundContext.Provider>
  )
}
