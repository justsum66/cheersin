'use client'

/**
 * R2-115：全局空狀態插圖 — 無數據時品牌化插圖 + 微小浮動動畫
 */
import { motion } from 'framer-motion'

export interface EmptyStateProps {
  /** 標題（如「尚無資料」） */
  title: string
  /** 副標或說明 */
  description?: string
  /** 自訂插圖（可選）；不傳則用預設酒杯圖示 */
  icon?: React.ReactNode
  /** 主要動作（如「開始測驗」按鈕） */
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ title, description, icon, action, className = '' }: EmptyStateProps) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="mb-4 text-white/40"
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      >
        {icon ?? (
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M8 22h8M12 11v11M9 4l1.5 3.5L14 8l-2 1.5L9 4z" />
            <path d="M15 4l-1.5 3.5L10 8l2 1.5L15 4z" />
          </svg>
        )}
      </motion.div>
      <h3 className="text-lg font-semibold text-white/90 mb-1">{title}</h3>
      {description && <p className="text-sm text-white/60 max-w-sm mb-4">{description}</p>}
      {action}
    </motion.div>
  )
}
