'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

/** 93 遊戲進行中隱藏導航：最大化解戲區域 */
type NavVisibilityContextValue = {
  hideForGame: boolean
  setHideForGame: (v: boolean) => void
}

const NavVisibilityContext = createContext<NavVisibilityContextValue | null>(null)

export function NavVisibilityProvider({ children }: { children: ReactNode }) {
  const [hideForGame, setHideForGameState] = useState(false)
  const setHideForGame = useCallback((v: boolean) => setHideForGameState(v), [])
  return (
    <NavVisibilityContext.Provider value={{ hideForGame, setHideForGame }}>
      {children}
    </NavVisibilityContext.Provider>
  )
}

export function useNavVisibility() {
  return useContext(NavVisibilityContext)
}
