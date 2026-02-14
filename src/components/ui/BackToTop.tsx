'use client'

/** UX_LAYOUT_200 #58：返回頂部按鈕（可選）— 捲動超過閾值顯示、平滑回頂、無障礙；R2-100 P1：從右下角滑入動畫 */
import { useState, useEffect, useCallback } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { ChevronUp } from 'lucide-react'

const SCROLL_THRESHOLD_PX = 400
const Z_INDEX = 35

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  const checkScroll = useCallback(() => {
    setVisible(typeof window !== 'undefined' ? window.scrollY > SCROLL_THRESHOLD_PX : false)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', checkScroll, { passive: true })
    checkScroll()
    return () => window.removeEventListener('scroll', checkScroll)
  }, [checkScroll])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <m.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 24, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed right-4 bottom-20 md:bottom-8 z-[35] games-touch-target rounded-full bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/15 games-focus-ring safe-area-pb flex items-center justify-center print:hidden"
          style={{ zIndex: Z_INDEX }}
          aria-label="返回頂部"
        >
          <ChevronUp className="w-5 h-5" aria-hidden />
        </m.button>
      )}
    </AnimatePresence>
  )
}
