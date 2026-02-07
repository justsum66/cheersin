'use client'

import { useEffect, useRef } from 'react'

/** 30 Hero 動態酒液流動粒子：深酒紅/香檳金氣泡；任務 9：prefers-reduced-motion 時停用 */
/** Phase 1 A1.4: 增強粒子效果 - 更多色彩、微妙發光 */
const WINE_COLORS = ['rgba(139,0,0,', 'rgba(212,175,55,', 'rgba(255,255,255,', 'rgba(138,43,226,']
const PARTICLE_COUNT = 40

export default function ParticleBubbles({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      if (bubbles.length === 0) {
        for (let i = 0; i < count; i++) {
          bubbles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
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
    window.addEventListener('resize', resize)
    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      data-print-skip
      style={{
        opacity: reducedMotion ? 0 : 0.7,
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
      aria-hidden
    />
  )
}
