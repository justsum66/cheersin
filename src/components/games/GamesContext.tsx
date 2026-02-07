'use client'

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'

const SHAKE_THRESHOLD = 25
const SHAKE_COOLDOWN_MS = 2000

export interface GamesContextValue {
  players: string[]
  registerShakeHandler: (fn: () => void) => void
  unregisterShakeHandler: () => void
}

const GamesContext = createContext<GamesContextValue | null>(null)

export function GamesProvider({ players, children }: { players: string[]; children: ReactNode }) {
  const shakeHandlerRef = useRef<(() => void) | null>(null)

  const registerShakeHandler = (fn: () => void) => {
    shakeHandlerRef.current = fn
  }
  const unregisterShakeHandler = () => {
    shakeHandlerRef.current = null
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    let lastFired = 0
    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (!a) return
      const magnitude = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2)
      const now = Date.now()
      if (magnitude >= SHAKE_THRESHOLD && now - lastFired >= SHAKE_COOLDOWN_MS) {
        lastFired = now
        shakeHandlerRef.current?.()
      }
    }
    window.addEventListener('devicemotion', handler)
    return () => window.removeEventListener('devicemotion', handler)
  }, [])

  return (
    <GamesContext.Provider value={{ players, registerShakeHandler, unregisterShakeHandler }}>
      {children}
    </GamesContext.Provider>
  )
}

export function useGamesPlayers(): string[] {
  const ctx = useContext(GamesContext)
  return ctx?.players ?? []
}

export function useGamesShake(): Pick<GamesContextValue, 'registerShakeHandler' | 'unregisterShakeHandler'> {
  const ctx = useContext(GamesContext)
  return {
    registerShakeHandler: ctx?.registerShakeHandler ?? (() => {}),
    unregisterShakeHandler: ctx?.unregisterShakeHandler ?? (() => {}),
  }
}
