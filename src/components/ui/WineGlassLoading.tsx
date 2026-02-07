'use client'

import { motion } from 'framer-motion'

/** 119 API 載入動畫：酒杯填充（用於全站 API 請求時） */
export function WineGlassLoading({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 safe-area-px bg-dark-950/70 backdrop-blur-sm pointer-events-auto"
      role="status"
      aria-live="polite"
      aria-label="載入中"
    >
      <motion.div
        className="flex flex-col items-center gap-4 max-w-full min-w-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="relative w-14 h-20 flex items-end justify-center">
          {/* 酒杯外框 */}
          <svg width="56" height="80" viewBox="0 0 56 80" fill="none" className="absolute inset-0">
            <path
              d="M8 0h40l-4 56H12L8 0z"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          {/* 填充動畫：自下而上 */}
          <motion.div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 rounded-b bg-gradient-to-t from-primary-600 to-primary-400"
            initial={{ height: 0 }}
            animate={{ height: 48 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.2, ease: 'easeInOut' }}
            style={{ transformOrigin: 'bottom' }}
          />
        </div>
        <motion.span
          className="text-sm text-white/70"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          載入中…
        </motion.span>
      </motion.div>
    </div>
  )
}
