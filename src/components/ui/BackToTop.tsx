'use client'

/** UX_LAYOUT_200 #58：返回頂部按鈕（可選）— 捲動超過閾值顯示、平滑回頂、無障礙；R2-100 P1：從右下角滑入動畫 */
/** T11: 加入 scroll debounce（100ms）減少高頻 DOM 讀取，提升滾動效能 */
import { useState, useEffect, useRef } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { ChevronUp } from 'lucide-react'

const SCROLL_THRESHOLD_PX = 400
const Z_INDEX = 35
const DEBOUNCE_MS = 100

export function BackToTop() {
  const [visible, setVisible] = useState(false)
  const rafId = useRef<number>(0)
  const lastCheck = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const now = Date.now()
      if (now - lastCheck.current < DEBOUNCE_MS) return
      lastCheck.current = now
      if (rafId.current) cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => {
        setVisible(window.scrollY > SCROLL_THRESHOLD_PX)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // initial check
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

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
          aria-label="Back to top"
        >
          <ChevronUp className="w-5 h-5" aria-hidden />
        </m.button>
      )}
    </AnimatePresence>
  )
}
