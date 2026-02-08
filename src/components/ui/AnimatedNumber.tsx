'use client'

import { useEffect, useState } from 'react'

/** P1-168：統計數字變化時數字滾動動畫，讓數據更有動感 */
interface AnimatedNumberProps {
  value: number
  duration?: number
  className?: string
  /** 格式化函數，如 (n) => n.toLocaleString() */
  format?: (n: number) => string
}

export function AnimatedNumber({ value, duration = 600, className = '', format = (n) => String(Math.round(n)) }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    let raf: number
    const startVal = display
    const endVal = value
    const startTime = Date.now()

    const tick = () => {
      const t = Math.min((Date.now() - startTime) / duration, 1)
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      setDisplay(startVal + (endVal - startVal) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- animate from current display to value
  }, [value, duration])

  return <span className={className}>{format(display)}</span>
}
