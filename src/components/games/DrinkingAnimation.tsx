'use client'

import { m , useReducedMotion } from 'framer-motion'

/** R2-092：喝酒動畫 — 懲罰/結果時簡單視覺（酒杯傾斜 + 液面下降）；R2-128：傾斜時酒液流動效果 */
export function DrinkingAnimation({ duration = 1.2, className = '' }: { duration?: number; className?: string }) {
  const reducedMotion = useReducedMotion()

  return (
    <m.div
      className={`relative w-16 h-20 flex justify-center items-end ${className}`}
      initial="rest"
      animate="drink"
      variants={{
        rest: { rotate: 0 },
        drink: {
          rotate: [-2, -35, -35, -2],
          transition: {
            duration,
            times: [0, 0.25, 0.75, 1],
            ease: 'easeInOut',
          },
        },
      }}
      aria-hidden
    >
      {/* 杯身 */}
      <div className="absolute bottom-0 w-10 h-16 rounded-b-lg border-2 border-white/30 bg-white/5 overflow-hidden">
        {/* 液面：隨傾斜「下降」視覺 */}
        <m.div
          className="absolute left-0 right-0 bottom-0 bg-amber-400/60"
          variants={{
            rest: { height: '55%' },
            drink: {
              height: ['55%', '30%', '30%', '55%'],
              transition: {
                duration,
                times: [0, 0.25, 0.75, 1],
                ease: 'easeInOut',
              },
            },
          }}
        />
      </div>
      {/* R2-128：傾斜時杯緣酒液流動／滴落視覺；reducedMotion 時不顯示 */}
      {!reducedMotion && (
        <m.div
          className="absolute left-1/2 top-0 w-0.5 h-4 -translate-x-1/2 -translate-y-1 origin-top bg-amber-400/70 rounded-full"
          initial="rest"
          animate="drink"
          variants={{
            rest: { opacity: 0, y: 0 },
            drink: {
              opacity: [0, 0, 0.9, 0.9, 0],
              y: [0, 0, 2, 6, 10],
              transition: {
                duration,
                times: [0, 0.2, 0.4, 0.6, 0.8],
                ease: 'easeOut',
              },
            },
          }}
          aria-hidden
        />
      )}
      {/* 杯腳裝飾 */}
      <div className="absolute -bottom-1 w-6 h-2 rounded-full bg-white/20" />
    </m.div>
  )
}
