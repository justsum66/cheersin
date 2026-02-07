'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Smartphone } from 'lucide-react'

/** 傳手機的視覺動畫：手機圖示從左傳到右，表示傳給下一位 */
export default function PassPhoneAnimation() {
  const reduced = useReducedMotion()

  if (reduced) {
    return (
      <div className="flex justify-center py-6" aria-hidden>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <Smartphone className="w-12 h-12 text-white/40" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center py-6 overflow-hidden" aria-hidden>
      <motion.div
        className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10"
        initial={{ x: -80, opacity: 0.6 }}
        animate={{ x: 80, opacity: 1 }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatType: 'reverse',
          repeatDelay: 0.3,
        }}
      >
        <Smartphone className="w-10 h-10 text-primary-400" strokeWidth={1.5} />
      </motion.div>
    </div>
  )
}
