'use client'

/** R2-121：全局 Drawer — 底部滑入 + 遮罩、Escape 關閉、焦點鎖定 */
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Drawer({ open, onClose, title, children, className = '' }: DrawerProps) {
  const prevFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    prevFocus.current = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prevFocus.current?.focus?.()
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'drawer-title' : undefined}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className={`relative rounded-t-2xl bg-[#1a0a2e] border border-white/10 border-b-0 shadow-xl max-h-[90vh] overflow-auto safe-area-pb ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {title != null && (
              <div className="flex items-center justify-between gap-4 p-4 border-b border-white/10 sticky top-0 bg-[#1a0a2e] z-10">
                <h2 id="drawer-title" className="text-lg font-semibold text-white">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 games-focus-ring min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="關閉"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            {title == null && (
              <div className="absolute top-3 right-3 z-10">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 games-focus-ring min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="關閉"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="p-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
