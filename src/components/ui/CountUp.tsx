'use client'

import { useEffect, useState, useRef } from 'react'
import { useInView } from 'framer-motion'

/** R2-060：useInView 確保只在進入視窗時觸發；數字從 0 滾動至 endValue；AUDIT #16 reducedMotion 時縮短 */
interface CountUpProps {
  endValue: number
  duration?: number
  suffix?: string
  className?: string
  /** 懸停時顯示的詳細說明 */
  title?: string
  /** 為 true 時縮短動畫（duration 改為較短），減少動態干擾 */
  reducedMotion?: boolean
}

function easeOutQuart(t: number): number {
  return 1 - (1 - t) ** 4
}

export function CountUp({ endValue, duration = 1500, suffix = '', className = '', title, reducedMotion }: CountUpProps) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const effectiveDuration = reducedMotion ? Math.min(400, duration * 0.3) : duration
  const inView = useInView(ref, { once: true, amount: 0.3 })

  useEffect(() => {
    if (!inView) return
    const startTime = performance.now()
    let rafId: number

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / effectiveDuration, 1)
      const eased = easeOutQuart(progress)
      setValue(Math.round(eased * endValue))
      if (progress < 1) rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [inView, endValue, effectiveDuration])

  return (
    <span ref={ref} className={className} title={title}>
      {value.toLocaleString()}
      {suffix}
    </span>
  )
}
