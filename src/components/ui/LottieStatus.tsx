'use client'

import { motion } from 'framer-motion'

/** 成功/錯誤狀態動畫（109）：SVG + framer-motion 動畫；A-06 RWD 不溢出 */
export function LottieStatus({ type, className = '' }: { type: 'success' | 'error'; className?: string }) {
  const isSuccess = type === 'success'
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`flex items-center justify-center max-w-full min-w-0 shrink-0 ${className}`}
      role="img"
      aria-label={isSuccess ? '成功' : '錯誤'}
    >
      {isSuccess ? (
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500/40">
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
            className="w-8 h-8 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </motion.svg>
        </div>
      ) : (
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500/40">
          <motion.svg
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-8 h-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </motion.svg>
        </div>
      )}
    </motion.div>
  )
}
