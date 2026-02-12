'use client'

import { motion } from 'framer-motion'

/** R2-092：喝酒動畫 — 懲罰/結果時簡單視覺（酒杯傾斜 + 液面下降），可於 Punishment 或遊戲結果使用 */
export function DrinkingAnimation({ duration = 1.2, className = '' }: { duration?: number; className?: string }) {
  return (
    <motion.div
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
        <motion.div
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
      {/* 杯腳裝飾 */}
      <div className="absolute -bottom-1 w-6 h-2 rounded-full bg-white/20" />
    </motion.div>
  )
}
