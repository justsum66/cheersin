'use client'

/**
 * R2-111：打字機效果 — 文字逐字出現，進入視窗或 mount 時觸發
 */
import { useState, useEffect, useRef } from 'react'

interface TypewriterTextProps {
  text: string
  /** 每字間隔 ms */
  intervalMs?: number
  /** 為 true 時不播放動畫 */
  reducedMotion?: boolean
  className?: string
  /** 用於標題時可設為 heading 標籤 */
  as?: 'span' | 'h2' | 'h3'
}

export function TypewriterText({
  text,
  intervalMs = 80,
  reducedMotion = false,
  className = '',
  as: Tag = 'span',
}: TypewriterTextProps) {
  const [displayLength, setDisplayLength] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setInView(true)
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    if (reducedMotion) {
      setDisplayLength(text.length)
      return
    }
    if (displayLength >= text.length) return
    const id = setInterval(() => {
      setDisplayLength((n) => {
        if (n >= text.length) return n
        return n + 1
      })
    }, intervalMs)
    return () => clearInterval(id)
    // displayLength intentionally omitted: we only start one interval and clear when done via setState callback
  // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  }, [inView, reducedMotion, text.length, intervalMs])

  return (
    <div ref={ref} className={className}>
      <Tag>{text.slice(0, displayLength)}</Tag>
    </div>
  )
}
