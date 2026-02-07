'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useGameSound } from '@/hooks/useGameSound'
import { ModalCloseButton } from '@/components/ui/ModalCloseButton'
import { getFontSize, setFontSize, getReduceMotion, setReduceMotion, type FontSize } from '@/lib/games-settings'

interface SettingsModalProps {
  onClose: () => void
}

/** 101–103 遊戲頁設定：音效開關、音量滑桿、字級、減少動畫。存 localStorage。P3 無障礙：開啟時焦點移至關閉鈕。GAMES_500 #238：設定內音量與實際音效同步 — 需與 useGameSound/實際播放器綁定。 */
export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { enabled: soundEnabled, toggle: toggleSound, volume, setVolume, bgmEnabled, toggleBGM } = useGameSound()
  const [fontSize, setFontSizeState] = useState<FontSize>('md')
  const [reduceMotion, setReduceMotionState] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  /** P3 無障礙：關閉時還原焦點到開啟前的觸發元素 */
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  /** P3 無障礙：Tab 循環限制在彈窗內（focus trap） */
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setFontSizeState(getFontSize())
    setReduceMotionState(getReduceMotion())
  }, [])

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

  const handleFontSize = (v: FontSize) => {
    setFontSizeState(v)
    setFontSize(v)
  }

  const handleReduceMotion = (v: boolean) => {
    setReduceMotionState(v)
    setReduceMotion(v)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center sm:items-center sm:p-4 safe-area-px safe-area-pb"
      onClick={handleClose}
    >
      {/* Phase 1 A3.2: 增強 Spring 動畫參數 */}
      <motion.div
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
          <section aria-labelledby="settings-audio-label">
            <p id="settings-audio-label" className="text-white/70 text-sm mb-2">音效</p>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={toggleSound}
                className={`min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl text-sm font-medium ${soundEnabled ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70'}`}
              >
                {soundEnabled ? '開' : '關'}
              </button>
              {soundEnabled && (
                <div className="flex-1 min-w-[120px] flex items-center gap-2">
                  <span className="text-white/50 text-xs w-8">音量</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(volume * 100)}
                    onChange={(e) => setVolume(Number(e.target.value) / 100)}
                    className="flex-1 h-2 rounded-full bg-white/10 accent-primary-500 min-w-0"
                    aria-label="音量"
                  />
                </div>
              )}
            </div>
            {/* 101 背景音樂開關 */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-white/50 text-xs">背景音樂</span>
              <button
                type="button"
                onClick={toggleBGM}
                className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-sm font-medium ${bgmEnabled ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70'}`}
              >
                {bgmEnabled ? '開' : '關'}
              </button>
            </div>
          </section>
          <section aria-labelledby="settings-font-label">
            <p id="settings-font-label" className="text-white/70 text-sm mb-2">字級</p>
            <div className="flex gap-2">
              {(['sm', 'md', 'lg'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleFontSize(s)}
                  className={`min-h-[48px] min-w-[48px] flex-1 px-3 rounded-lg text-sm font-medium transition-colors ${fontSize === s ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                >
                  {s === 'sm' ? '小' : s === 'md' ? '中' : '大'}
                </button>
              ))}
            </div>
          </section>
          <section aria-labelledby="settings-motion-label">
            <p id="settings-motion-label" className="text-white/70 text-sm mb-2">簡化動畫（直播友善）</p>
            <button
              type="button"
              onClick={() => handleReduceMotion(!reduceMotion)}
              className={`min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl text-sm font-medium ${reduceMotion ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70'}`}
            >
              {reduceMotion ? '開' : '關'}
            </button>
          </section>
        </div>
      </motion.div>
    </motion.div>
  )
}
