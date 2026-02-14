'use client'

import { m } from 'framer-motion'

/** 114 物理彈簧：可拖曳元素，釋放後以 spring 回彈至原點 */
const spring = { type: 'spring' as const, stiffness: 400, damping: 25 }

export function SpringDrag({
  children,
  className = '',
  dragDirection = 'x',
  dragConstraints = { left: -80, right: 80, top: 0, bottom: 0 },
  ...props
}: {
  children: React.ReactNode
  className?: string
  dragDirection?: 'x' | 'y' | boolean
  dragConstraints?: { left?: number; right?: number; top?: number; bottom?: number }
} & Omit<React.ComponentProps<typeof m.div>, 'dragConstraints'>) {
  return (
    <m.div
      drag={dragDirection}
      dragConstraints={dragConstraints}
      dragElastic={0.2}
      whileTap={{ scale: 1.02 }}
      transition={spring}
      className={className}
      {...props}
    >
      {children}
    </m.div>
  )
}
