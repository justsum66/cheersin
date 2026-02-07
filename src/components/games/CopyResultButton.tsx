'use client'

import { motion } from 'framer-motion'
import { Copy } from 'lucide-react'
import { useCopyResult } from './useCopyResult'

interface CopyResultButtonProps {
  /** 要複製的文字 */
  text: string
  /** 按鈕顯示文字，預設「複製結果」 */
  label?: string
  /** 額外 class */
  className?: string
}

/** 分享／複製結果按鈕，點擊後複製文字並顯示 toast。 */
export default function CopyResultButton({ text, label = '複製結果', className = '' }: CopyResultButtonProps) {
  const copy = useCopyResult()

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={() => copy(text)}
      className={`min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white/90 text-sm font-medium inline-flex items-center gap-2 games-focus-ring ${className}`}
      aria-label={`${label}：${text}`}
      data-i18n-key="games.copyResult"
    >
      <Copy className="w-4 h-4" />
      {label}
    </motion.button>
  )
}
