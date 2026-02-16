'use client'

/** P1-031 / A11Y-006：統一 Modal — 遮罩、關閉按鈕、焦點鎖定、Esc 關閉、進出場動畫 */
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { m, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { modalOverlay, modalContent } from '@/lib/variants'

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className = '' }: ModalProps) {
  const prevFocus = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    prevFocus.current = document.activeElement as HTMLElement | null
    const focusFirst = () => {
      const first = contentRef.current?.querySelector<HTMLElement>(FOCUSABLE)
      first?.focus()
    }
    const t = requestAnimationFrame(focusFirst)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const container = contentRef.current
      if (!container?.contains(document.activeElement)) return
      const nodes = container.querySelectorAll<HTMLElement>(FOCUSABLE)
      const list = Array.from(nodes).filter((el) => el.offsetParent != null)
      if (list.length === 0) return
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prevFocus.current?.focus?.()
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          <m.div
            ref={contentRef}
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`rounded-2xl bg-[#1a0a2e] border border-white/10 shadow-xl max-h-[90vh] overflow-auto ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {title != null && (
              <div className="flex items-center justify-between gap-4 p-4 border-b border-white/10">
                <h2 id="modal-title" className="text-lg font-semibold text-white">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 games-focus-ring min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            {title == null && (
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 games-focus-ring"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="p-4">{children}</div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
