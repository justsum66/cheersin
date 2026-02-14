'use client'

import { useEffect, useState } from 'react'
import { m , useReducedMotion } from 'framer-motion'

/** R2-035：數字變化時 m.span 動畫 opacity/y；P1-168 統計數字滾動動畫 */
interface AnimatedNumberProps {
  value: number
  duration?: number
  className?: string
  /** 格式化函數，如 (n) => n.toLocaleString() */
  format?: (n: number) => string
}

export function AnimatedNumber({ value, duration = 600, className = '', format = (n) => String(Math.round(n)) }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const reducedMotion = useReducedMotion()

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

  if (reducedMotion) return <span className={className}>{format(display)}</span>

  return (
    <m.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={className}
    >
      {format(display)}
    </m.span>
  )
}
