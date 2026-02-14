'use client'

import { m } from 'framer-motion'
import { Wine } from 'lucide-react'

/** 品牌 3D Logo（110）：首頁 Hero 展示 3D 旋轉酒杯圖示；尺寸放大 20% */
export default function Logo3D() {
  return (
    <m.div
      className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center origin-center"
      style={{ perspective: '600px', transform: 'scale(1.2)' }}
      animate={{ rotateY: 360 }}
      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
    >
      <div
        className="w-full h-full flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/30 to-secondary-500/30 border border-white/20 shadow-2xl"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(15deg) rotateY(0deg)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset',
        }}
      >
        <Wine className="w-12 h-12 sm:w-16 sm:h-16 text-white/90 drop-shadow-lg" style={{ transform: 'translateZ(10px)' }} />
      </div>
    </m.div>
  )
}
