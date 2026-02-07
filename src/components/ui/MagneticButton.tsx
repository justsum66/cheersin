'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

type El = 'button' | 'span' | 'div'

/** 磁吸效果（113）：按鈕在滑鼠/手指接近時吸附；A-07 prefers-reduced-motion 時關閉磁吸與 whileTap */
export function MagneticButton<T extends El = 'button'>({
  children,
  className = '',
  strength = 0.2,
  as = 'button' as T,
  ...props
}: { children: React.ReactNode; className?: string; strength?: number; as?: T } & Omit<React.ComponentProps<'button'>, 'children'>) {
  const ref = useRef<HTMLButtonElement | HTMLSpanElement | HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reducedMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = (e.clientX - centerX) * strength
    const dy = (e.clientY - centerY) * strength
    x.set(dx)
    y.set(dy)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const Comp = motion[as] as typeof motion.button
  return (
    <Comp
      ref={ref as React.Ref<HTMLButtonElement>}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={reducedMotion ? undefined : { x: springX, y: springY }}
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      {...(props as object)}
    >
      {children}
    </Comp>
  )
}
