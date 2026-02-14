'use client'

import { useEffect, useRef } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Crown, Sparkles } from 'lucide-react'
import { ModalCloseButton } from '@/components/ui/ModalCloseButton'
import type { SubscriptionTier } from '@/lib/subscription'
import { SUBSCRIPTION_TIERS } from '@/lib/subscription'
import { useTranslation } from '@/contexts/I18nContext'
import { SOCIAL_PROOF_USER_COUNT } from '@/lib/constants'

/**
 * 144 升級提示 Modal：觸及付費功能時顯示方案比較與升級按鈕；P3 無障礙；i18n Phase 3 t('upgrade.*')
 */
export function UpgradeModal({
  open,
  onClose,
  title,
  description,
  requiredTier = 'basic',
}: {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  requiredTier?: SubscriptionTier
}) {
  const { t } = useTranslation()
  const modalTitle = title ?? t('upgrade.title')
  const modalDescription = description ?? t('upgrade.description')
  const tierOrder: SubscriptionTier[] = ['free', 'basic', 'premium']
  const requiredIndex = tierOrder.indexOf(requiredTier)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  /** P3 無障礙：關閉時還原焦點到開啟前的觸發元素 */
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  /** P3 無障礙：Tab 循環限制在彈窗內（focus trap） */
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    previousActiveElementRef.current = document.activeElement as HTMLElement | null
    const t = requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })

    const FOCUSABLE =
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        const prev = previousActiveElementRef.current
        previousActiveElementRef.current = null
        requestAnimationFrame(() => { if (prev?.focus) prev.focus() })
        return
      }
      if (e.key !== 'Tab') return
      const container = dialogRef.current
      if (!container?.contains(document.activeElement)) return
      const nodes = container.querySelectorAll<HTMLElement>(FOCUSABLE)
      const list = Array.from(nodes).filter((el) => el.offsetParent !== null)
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
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      cancelAnimationFrame(t)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  const handleClose = () => {
    onClose()
    const prev = previousActiveElementRef.current
    previousActiveElementRef.current = null
    requestAnimationFrame(() => {
      if (prev?.focus) prev.focus()
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Phase 1 A3.2: 增強背景動畫 */}
          <m.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={handleClose}
            aria-hidden
          />
          {/* H89 Modal：背景模糊、動畫從底部滑入，減震曲線 - Phase 1 A3.2: Spring 物理動畫 */}
          <m.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-modal-title"
            className="fixed left-0 right-0 bottom-0 z-[101] w-full max-w-md mx-auto rounded-t-2xl sm:rounded-2xl bg-dark-800 border border-white/10 border-b-0 shadow-2xl overflow-hidden safe-area-px"
            initial={{ opacity: 0, y: '30%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: '20%', scale: 0.97 }}
            transition={{ 
              type: 'spring', 
              stiffness: 400, 
              damping: 30,
              opacity: { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
            }}
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary-500/20">
                    <Crown className="w-6 h-6 text-primary-500" />
                  </div>
                  <h2 id="upgrade-modal-title" className="text-xl font-bold text-white">
                    {modalTitle}
                  </h2>
                </div>
                <ModalCloseButton ref={closeButtonRef} onClick={handleClose} aria-label={t('common.close')} />
              </div>
              <p className="text-white/60 text-sm mb-6">{modalDescription}</p>
              {/* R2-207：升級 modal 顯示社會認證「已有 X 人升級」 */}
              <p className="text-white/50 text-xs mb-4" aria-hidden>
                已有 {SOCIAL_PROOF_USER_COUNT.toLocaleString('zh-TW')}+ 人升級 Pro
              </p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                {tierOrder.map((tier, i) => {
                  const meta = SUBSCRIPTION_TIERS[tier]
                  const isRequired = i >= requiredIndex
                  return (
                    <div
                      key={tier}
                      className={`rounded-xl p-3 text-center border ${isRequired ? 'border-primary-500/50 bg-primary-500/10' : 'border-white/10 bg-white/5'}`}
                    >
                      <span className="block text-sm font-medium text-white">{meta.label}</span>
                      <span className="block text-xs text-white/50 mt-0.5">
                        {meta.maxAICallsPerDay < 0 ? t('upgrade.infinite') : meta.maxAICallsPerDay} {t('upgrade.perDay')}
                      </span>
                    </div>
                  )
                })}
              </div>
              <Link
                href="/pricing"
                onClick={handleClose}
                className="flex items-center justify-center gap-2 w-full min-h-[48px] py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-colors games-focus-ring"
              >
                <Sparkles className="w-5 h-5" />
                {t('upgrade.cta')}
              </Link>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  )
}
