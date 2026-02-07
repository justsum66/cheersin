'use client'

import { useEffect, useRef } from 'react'

/** 搖一搖偵測閾值（加速度量級），依裝置可調 */
const DEFAULT_THRESHOLD = 25
/** 兩次觸發最小間隔（ms） */
const COOLDOWN_MS = 1500

/**
 * 監聽 DeviceMotionEvent，當加速度超過閾值時觸發 callback（搖一搖）。
 * 需在 HTTPS 或 localhost 下使用；iOS 13+ 需請求權限。
 */
export function useShake(callback: () => void, options?: { threshold?: number; enabled?: boolean }) {
  const callbackRef = useRef(callback)
  const lastFiredRef = useRef(0)
  const threshold = options?.threshold ?? DEFAULT_THRESHOLD
  const enabled = options?.enabled !== false

  callbackRef.current = callback

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (!a) return
      const magnitude = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2)
      const now = Date.now()
      if (magnitude >= threshold && now - lastFiredRef.current >= COOLDOWN_MS) {
        lastFiredRef.current = now
        callbackRef.current()
      }
    }

    window.addEventListener('devicemotion', handler)
    return () => window.removeEventListener('devicemotion', handler)
  }, [enabled, threshold])
}
