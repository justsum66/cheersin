'use client'

import { BRAND_NAME } from '@/components/BrandLogo'

/** 25 品牌浮水印：遊戲截圖時顯示品牌名，不阻擋操作 */
export default function BrandWatermark() {
  return (
    <div
      className="pointer-events-none absolute bottom-3 right-3 z-10 select-none"
      aria-hidden
    >
      {/* G-Common-11：小螢幕縮小不擋主內容 */}
      <span
        className="font-display text-xs sm:text-sm font-medium tracking-widest text-white/25"
        style={{ textShadow: '0 0 8px rgba(0,0,0,0.5)' }}
      >
        {BRAND_NAME}
      </span>
    </div>
  )
}
