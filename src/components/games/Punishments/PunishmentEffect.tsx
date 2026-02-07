'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameSound } from '@/hooks/useGameSound'

const FLASH_DURATION_MS = 400
const VIBRATE_PATTERN = [80, 40, 80]

interface PunishmentEffectProps {
  /** 是否顯示懲罰特效（紅閃 + 震動 + 音效） */
  active: boolean
  /** 懲罰文字（可選，顯示在閃爍中） */
  text?: string
  /** 結束回調 */
  onComplete?: () => void
}

/** 懲罰特效：全螢幕紅色閃爍 + 震動 + 音效 */
export default function PunishmentEffect({ active, text, onComplete }: PunishmentEffectProps) {
  const [visible, setVisible] = useState(false)
  const { play } = useGameSound()

  useEffect(() => {
    if (!active) {
      setVisible(false)
      return
    }
    setVisible(true)
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(VIBRATE_PATTERN)
      }
    } catch {
      /* ignore */
    }
    play('wrong')
    const t = setTimeout(() => {
      setVisible(false)
      onComplete?.()
    }, FLASH_DURATION_MS)
    return () => clearTimeout(t)
  }, [active, onComplete, play])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.08 }}
          className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center bg-red-600/70"
          aria-hidden
        >
          {text && (
            <motion.p
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-white font-bold text-xl md:text-2xl text-center px-4 drop-shadow-lg"
            >
              {text}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
