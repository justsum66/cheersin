'use client'

import { useCallback, useRef } from 'react'

/**
 * F166 節流：在 intervalMs 內最多執行一次，適用滾動/resize
 */
export function useThrottle<A extends unknown[]>(
  fn: (...args: A) => void,
  intervalMs: number
): (...args: A) => void {
  const lastRun = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const throttled = useCallback(
    (...args: A) => {
      const now = Date.now()
      const elapsed = now - lastRun.current

      const run = () => {
        lastRun.current = Date.now()
        fn(...args)
      }

      if (elapsed >= intervalMs) {
        run()
        return
      }
      if (timeoutRef.current == null) {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null
          run()
        }, intervalMs - elapsed)
      }
    },
    [fn, intervalMs]
  )

  return throttled
}
