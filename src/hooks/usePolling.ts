'use client'

/**
 * DC-08：輪詢抽成共用 hook，用於 script-murder、party-room 等定時拉取 room/state
 * 當 enabled 為 true 時每 intervalMs 執行一次 fn，卸載或 enabled 變 false 時清除
 */
import { useEffect, useRef } from 'react'

export interface UsePollingOptions {
  /** 輪詢間隔（毫秒） */
  intervalMs: number
  /** 是否啟用輪詢，預設 true */
  enabled?: boolean
}

export function usePolling(
  fn: () => void | Promise<void>,
  options: UsePollingOptions
): void {
  const { intervalMs, enabled = true } = options
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return
    const tick = () => {
      void Promise.resolve(fnRef.current()).catch(() => {})
    }
    tick()
    const t = setInterval(tick, intervalMs)
    return () => clearInterval(t)
  }, [enabled, intervalMs])
}
