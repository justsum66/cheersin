'use client'

import { useEffect, useState, useRef } from 'react'

/** 數字滾動動畫：進入視窗時從 0 滾動至 endValue，duration 毫秒；懸停顯示 title；AUDIT #16 reducedMotion 時縮短或關閉 */
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
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const effectiveDuration = reducedMotion ? Math.min(400, duration * 0.3) : duration

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setInView(true)
      },
      { threshold: 0.3, rootMargin: '0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

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
