'use client'

import { useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Flag } from 'lucide-react'
import Link from 'next/link'
import { ModalCloseButton } from '@/components/ui/ModalCloseButton'
import { stripHtml } from '@/lib/games-sanitize'
import BrandWatermark from './BrandWatermark'
import { Countdown321 } from './Countdown321'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'

export interface GameWrapperBodyProps {
  showReportModal: boolean
  setShowReportModal: (v: boolean) => void
  reportContext?: { roomSlug?: string; gameId?: string }
  reportSubmitted: boolean
  setReportSubmitted: (v: boolean) => void
  reportType: string
  reportDesc: string
  reportSending: boolean
  setReportSending: (v: boolean) => void
  setReportType: (v: string) => void
  setReportDesc: (v: string) => void
  showTrialEndModal: boolean
  setShowTrialEndModal: (v: boolean) => void
  onExit: () => void
  rulesContent: string | null
  showRulesModal: boolean
  closeRulesModal: () => void
  rulesModalRef: React.RefObject<HTMLDivElement | null>
  isPaused: boolean
  togglePause: () => void
  contentScale: number
  children: React.ReactNode
  multiTouchActiveRef: React.MutableRefObject<boolean>
  multiTouchClearTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  handleTouchStart: () => void
  handleTouchEnd: () => void
  handleTouchMove: (e: React.TouchEvent) => void
  handleTouchStartPinch: (e: React.TouchEvent) => void
  handleTouchEndPinch: () => void
  handleTouchStartThree: (e: React.TouchEvent) => void
  handleTouchMoveThree: (e: React.TouchEvent) => void
  handleTouchEndThree: () => void
  /** R2-040：3-2-1 倒數結束後呼叫 */
  showCountdown?: boolean
  onCountdownComplete?: () => void
  reducedMotion?: boolean
}

export default function GameWrapperBody({
  showReportModal,
  setShowReportModal,
  reportContext,
  reportSubmitted,
  setReportSubmitted,
  reportType,
  reportDesc,
  reportSending,
  setReportSending,
  setReportType,
  setReportDesc,
  showTrialEndModal,
  setShowTrialEndModal,
  onExit,
  rulesContent,
  showRulesModal,
  closeRulesModal,
  rulesModalRef,
  isPaused,
  togglePause,
  contentScale,
  children,
  multiTouchActiveRef,
  multiTouchClearTimerRef,
  handleTouchStart,
  handleTouchEnd,
  handleTouchMove,
  handleTouchStartPinch,
  handleTouchEndPinch,
  handleTouchStartThree,
  handleTouchMoveThree,
  handleTouchEndThree,
  showCountdown = false,
  onCountdownComplete,
  reducedMotion = false,
}: GameWrapperBodyProps) {
  /** A11Y-006：檢舉 / 暫停 / 試玩結束 Modal Esc 關閉 */
  useEffect(() => {
    if (!showReportModal && !isPaused && !showTrialEndModal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (showReportModal) {
        setShowReportModal(false)
        setReportSubmitted(false)
        setReportType('其他')
        setReportDesc('')
      } else if (isPaused) togglePause()
      else if (showTrialEndModal) setShowTrialEndModal(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showReportModal, isPaused, showTrialEndModal, setShowReportModal, setReportSubmitted, setReportType, setReportDesc, togglePause, setShowTrialEndModal])

  return (
    <>
      {showCountdown && onCountdownComplete && (
        <Countdown321 onComplete={onCountdownComplete} skip={reducedMotion} />
      )}
      {showReportModal && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="檢舉">
          <GlassCard variant="layer-2" className="w-full max-w-sm rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary-400" /> 檢舉
              </h3>
              <ModalCloseButton onClick={() => { setShowReportModal(false); setReportSubmitted(false); setReportDesc(''); setReportType('其他'); }} aria-label="關閉" className="rounded-full" />
            </div>
            {reportSubmitted ? (
              <p className="text-primary-400 font-medium">已收到，感謝您的回報。</p>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setReportSending(true)
                  try {
                    await fetch('/api/report', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ type: reportType, description: reportDesc.trim() || undefined, context: reportContext }),
                    })
                    setReportSubmitted(true)
                  } catch {
                    /* ignore */
                  } finally {
                    setReportSending(false)
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="report-type" className="block text-white/70 text-sm mb-1">類型</label>
                  <select id="report-type" value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" aria-label="檢舉類型">
                    <option value="不當內容">不當內容</option>
                    <option value="騷擾">騷擾</option>
                    <option value="作弊或濫用">作弊或濫用</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="report-desc" className="block text-white/70 text-sm mb-1">說明（選填）</label>
                  <textarea id="report-desc" value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} rows={3} maxLength={500} placeholder="簡述情況" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50" aria-label="檢舉說明" />
                </div>
                <Button type="submit" disabled={reportSending} variant="primary" className="w-full">
                  {reportSending ? '送出中…' : '送出'}
                </Button>
              </form>
            )}
          </GlassCard>
        </div>
      )}

      <AnimatePresence>
        {isPaused && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            role="dialog"
            aria-label="遊戲已暫停"
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="text-center"
            >
              <p className="text-white text-xl font-bold mb-4">遊戲已暫停</p>
              <Button
                type="button"
                onClick={togglePause}
                className="px-8 font-bold"
                variant="primary"
              >
                繼續
              </Button>
              <p className="text-white/50 text-xs mt-2">也可按 P 鍵繼續</p>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      <div
        className="flex-1 px-4 sm:px-6 md:px-8 py-4 md:py-6 lg:py-8 relative overflow-y-auto min-h-0 touch-manipulation safe-area-pb safe-area-px"
        onTouchStart={(e) => {
          if (e.touches.length >= 2) multiTouchActiveRef.current = true
          if (e.touches.length === 1) handleTouchStart()
          if (e.touches.length === 2) handleTouchStartPinch(e)
          if (e.touches.length === 3) handleTouchStartThree(e)
        }}
        onTouchEnd={(e) => {
          handleTouchEnd()
          if (e.touches.length === 0) {
            if (multiTouchClearTimerRef.current) clearTimeout(multiTouchClearTimerRef.current)
            multiTouchClearTimerRef.current = setTimeout(() => {
              multiTouchActiveRef.current = false
              multiTouchClearTimerRef.current = null
            }, 400)
            handleTouchEndPinch()
            handleTouchEndThree()
          }
        }}
        onTouchMove={(e) => {
          handleTouchMove(e)
          if (e.touches.length === 3) handleTouchMoveThree(e)
        }}
        onTouchCancel={(e) => {
          handleTouchEnd()
          if (e.touches.length === 0) { handleTouchEndPinch(); handleTouchEndThree(); }
        }}
        onTouchEndCapture={handleTouchEndPinch}
        style={{ touchAction: 'manipulation' }}
      >
        <div
          className="origin-top transition-transform duration-150 w-full max-w-xl mx-auto text-center min-w-0"
          style={{ transform: `scale(${contentScale})` }}
        >
          {children}
        </div>
        <BrandWatermark />
      </div>

      <AnimatePresence>
        {showTrialEndModal && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 safe-area-px safe-area-pb"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trial-end-title"
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm safe-area-px"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="p-6 text-center rounded-2xl shadow-xl" variant="layer-2">
                <h2 id="trial-end-title" className="text-xl font-bold text-white mb-2">試玩限 3 局已結束</h2>
                <p className="text-white/70 text-sm mb-6">登入以繼續玩、開房間、保存進度。升級方案可解鎖更多局數。</p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="contents" // Wrapper for Button if needed, or pass Link directly
                    onClick={() => setShowTrialEndModal(false)}
                  >
                    <Button variant="primary" className="w-full justify-center">登入</Button>
                  </Link>
                  <Link
                    href="/pricing"
                    className="contents"
                    onClick={() => setShowTrialEndModal(false)}
                  >
                    <Button variant="secondary" className="w-full justify-center">升級方案</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => { setShowTrialEndModal(false); onExit(); }}
                    className="w-full justify-center"
                  >
                    返回大廳
                  </Button>
                </div>
              </GlassCard>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRulesModal && rulesContent && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 sm:p-4 safe-area-px safe-area-pb"
            onClick={closeRulesModal}
          >
            <m.div
              ref={rulesModalRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-lg max-h-[85vh] sm:max-h-[70vh] safe-area-pb safe-area-px outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="p-6 h-full overflow-y-auto rounded-t-3xl sm:rounded-2xl" variant="layer-2">
                <div className="w-12 h-1 rounded-full bg-white/30 mx-auto mb-4 sm:hidden" aria-hidden />
                {/* COPY-006：遊戲說明可於遊戲內查看 — 規則按鈕開啟此 modal */}
                <h2 id="rules-modal-heading" className="text-lg font-bold text-white mb-3">規則說明</h2>
                <div className="games-body text-white/80 space-y-2" role="region" aria-labelledby="rules-modal-heading">
                  {(stripHtml(rulesContent) || '')
                    .split(/\n\n+/)
                    .filter((p) => p.trim())
                    .map((para, i) => (
                      <p key={i} className="whitespace-pre-line">{para.trim()}</p>
                    ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeRulesModal}
                  className="mt-4 w-full justify-center"
                  aria-label="關閉規則"
                >
                  關閉
                </Button>
              </GlassCard>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
