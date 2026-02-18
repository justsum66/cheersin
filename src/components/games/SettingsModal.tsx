'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { m } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, Lock } from 'lucide-react'
import { useSubscriptionStore } from '@/store/useSubscriptionStore'
import { ModalCloseButton } from '@/components/ui/ModalCloseButton'
import { toast } from 'react-hot-toast'
import { 
  AudioSettings,
  FontSizeSettings,
  MotionSettings,
  HapticSettings,
  NonAlcoholSettings,
  ToolsSettings
} from './settings'

interface SettingsModalProps {
  onClose: () => void
}

/** 101–103 遊戲頁設定：音效開關、音量滑桿、字級、減少動畫。存 localStorage。P3 無障礙：開啟時焦點移至關閉鈕。GAMES_500 #238：設定內音量與實際音效同步 — 需與 useGameSound/實際播放器綁定。 */
export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { tier } = useSubscriptionStore()
  const [adFreeEnabled, setAdFreeEnabled] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Task 48: Init Ad-Free state
    const storedAdFree = localStorage.getItem('cheersin_ad_free')
    if (storedAdFree === 'true' && tier !== 'free') {
      setAdFreeEnabled(true)
    }
  }, [tier])

  useEffect(() => {
    previousActiveElementRef.current = document.activeElement as HTMLElement | null
    const t = requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })

    const FOCUSABLE =
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [])

  const handleClose = useCallback(() => {
    onClose()
    const prev = previousActiveElementRef.current
    previousActiveElementRef.current = null
    requestAnimationFrame(() => {
      if (prev?.focus) prev.focus()
    })
  }, [onClose])

  /** GAMES_500 #203：設定 modal 關閉 Esc 與焦點還原 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose])

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center sm:items-center sm:p-4 safe-area-px safe-area-pb"
      onClick={handleClose}
    >
      {/* Phase 1 A3.2: 增強 Spring 動畫參數 */}
      <m.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        aria-label="遊戲設定"
        initial={{ y: '100%', opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0.8 }}
        transition={{
          type: 'spring',
          stiffness: 380,
          damping: 32,
          mass: 0.8,
          opacity: { duration: 0.2 }
        }}
        className="bg-[#0a0a1a] border border-white/10 border-b-0 sm:border-b sm:rounded-2xl rounded-t-[24px] p-4 md:p-6 w-full max-w-sm shadow-2xl max-h-[85vh] overflow-y-auto safe-area-px safe-area-pb"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="settings-modal-title" className="text-xl font-bold text-white">設定</h2>
          <ModalCloseButton ref={closeButtonRef} onClick={handleClose} aria-label="關閉" className="rounded-full text-white/70" />
        </div>
        <div className="flex flex-col gap-[var(--space-card)]">
          <AudioSettings />
          <FontSizeSettings />
          <MotionSettings />
          <HapticSettings />
          <NonAlcoholSettings />
          
          {/* Task 48: Ad-Free Toggle */}
          <section aria-labelledby="settings-ad-free-label">
            <div className="flex items-center justify-between mb-2">
              <p id="settings-ad-free-label" className="text-white/70 text-sm">無廣告模式</p>
              {tier === 'free' && (
                <Link href="/pricing" onClick={handleClose} className="text-xs text-amber-400 flex items-center gap-1 hover:text-amber-300">
                  <Sparkles className="w-3 h-3" />
                  升級解鎖
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (tier === 'free') {
                  // Redirect or show toast? Link above handles redirect.
                  // Here maybe just shake or toast.
                  toast.error('此功能僅限 Pro/VIP 會員使用')
                  return
                }
                const newValue = !adFreeEnabled
                setAdFreeEnabled(newValue)
                localStorage.setItem('cheersin_ad_free', String(newValue))
                if (newValue) {
                  toast.success('已開啟無廣告模式')
                }
              }}
              className={`w-full min-h-[48px] px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-between transition-colors ${tier === 'free'
                ? 'bg-white/5 text-white/40 cursor-not-allowed border border-white/5'
                : adFreeEnabled
                  ? 'bg-primary-500/80 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
            >
              <span>{adFreeEnabled && tier !== 'free' ? '已開啟' : '已關閉'}</span>
              {tier === 'free' && <Lock className="w-4 h-4 ml-2 opacity-50" />}
            </button>
            {tier === 'free' && (
              <p className="text-xs text-white/30 mt-2">
                Pro 會員可隱藏所有廣告，享受純淨派對體驗。
              </p>
            )}
          </section>
          
          <ToolsSettings onClose={handleClose} />
        </div>
      </m.div>
    </m.div>
  )
}
