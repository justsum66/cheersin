'use client'

import { useEffect, useRef } from 'react'

/** 30 Hero 動態酒液流動粒子：深酒紅/香檳金氣泡；任務 9：prefers-reduced-motion 時停用 */
/** Phase 1 A1.4: 增強粒子效果 - 更多色彩、微妙發光 */
/** absolute：用於 Hero 區內，填滿父層（absolute inset-0）；預設 fixed 全螢幕 */
/** 30 Hero 動態酒液流動粒子：派對霓虹配色 (Purple, Pink, Gold, Cyan) */
const WINE_COLORS = ['rgba(147,51,234,', 'rgba(236,72,153,', 'rgba(234,179,8,', 'rgba(34,211,238,']
const PARTICLE_COUNT = 40

export default function ParticleBubbles({ reducedMotion = false, absolute = false }: { reducedMotion?: boolean; absolute?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reducedMotion) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationId: number
    const bubbles: {
      x: number
      y: number
      r: number
      vx: number
      vy: number
      opacity: number
      colorIdx: number
    }[] = []
    const count = PARTICLE_COUNT

    const resize = () => {
      const w = absolute && containerRef.current ? containerRef.current.offsetWidth : window.innerWidth
      const h = absolute && containerRef.current ? containerRef.current.offsetHeight : window.innerHeight
      const safeW = Math.max(1, w)
      const safeH = Math.max(1, h)
      canvas.width = safeW
      canvas.height = safeH
      if (bubbles.length === 0 && safeW > 1 && safeH > 1) {
        for (let i = 0; i < count; i++) {
          bubbles.push({
            x: Math.random() * safeW,
            y: Math.random() * safeH,
            r: 2 + Math.random() * 10,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.15 - Math.random() * 0.5,
            opacity: 0.08 + Math.random() * 0.2,
            colorIdx: Math.floor(Math.random() * WINE_COLORS.length),
          })
        }
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const b of bubbles) {
        b.x += b.vx
        b.y += b.vy
        if (b.x < -b.r || b.x > canvas.width + b.r) b.vx *= -1
        if (b.y < -b.r) b.y = canvas.height + b.r
        if (b.y > canvas.height + b.r) b.y = -b.r

        // Phase 1 A1.4: 增加粒子發光效果
        const prefix = WINE_COLORS[b.colorIdx]
        // 外層發光
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r * 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `${prefix}${b.opacity * 0.3})`
        ctx.fill()
        // 內層實體
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = `${prefix}${b.opacity})`
        ctx.fill()
      }
      animationId = requestAnimationFrame(draw)
    }

    resize()
    if (absolute) {
      const tid = setTimeout(resize, 150)
      window.addEventListener('resize', resize)
      draw()
      return () => {
        clearTimeout(tid)
        window.removeEventListener('resize', resize)
        cancelAnimationFrame(animationId)
      }
    }
    window.addEventListener('resize', resize)
    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [reducedMotion, absolute])

  return (
    <div ref={containerRef} className={absolute ? 'absolute inset-0 pointer-events-none z-[2]' : 'contents'}>
      <canvas
        ref={canvasRef}
        className={absolute ? 'absolute inset-0 w-full h-full pointer-events-none' : 'fixed inset-0 pointer-events-none z-0'}
        data-print-skip
        style={{
          opacity: reducedMotion ? 0 : 0.7,
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
        aria-hidden
      />
    </div>
  )
}
