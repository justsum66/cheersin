'use client'

/** UX_LAYOUT_200 #115：危險操作二次確認 — 可重用確認對話框；A-09 模態框開關 transition 順暢 */
import { useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '確認',
  cancelLabel = '取消',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  const isDanger = variant === 'danger'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 safe-area-px bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-desc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Phase 1 A3.2: 增強 Modal Spring 動畫 */}
          <motion.div
            className="modal-padding modal-content-overflow w-full max-w-md rounded-2xl bg-[#1a0a2e] border border-white/10 shadow-xl"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ 
              type: 'spring', 
              stiffness: 450, 
              damping: 28,
              opacity: { duration: 0.2 }
            }}
          >
            <h2 id="confirm-dialog-title" className="text-lg font-semibold text-white mb-2">
              {title}
            </h2>
            <p id="confirm-dialog-desc" className="text-white/70 text-sm mb-6">
              {message}
            </p>
            <div className="form-actions justify-end">
              <button
                ref={cancelRef}
                type="button"
                onClick={onCancel}
                className="btn-ghost min-h-[48px] px-4 games-focus-ring"
                aria-label={cancelLabel}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={isDanger ? 'btn-danger min-h-[48px] px-4 games-focus-ring' : 'btn-primary min-h-[48px] px-4 games-focus-ring'}
                aria-label={confirmLabel}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** 使用 confirm() 的簡單包裝 — 適用於非關鍵危險操作 */
export function useConfirm() {
  return useCallback((message: string, title = '確認') => {
    return typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)
  }, [])
}
