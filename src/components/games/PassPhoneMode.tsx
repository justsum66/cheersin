'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { SkipForward, BarChart3 } from 'lucide-react'
import { usePassPhone } from './PassPhoneContext'
import PassPhoneAnimation from './PassPhoneAnimation'

const COUNTDOWN_SEC = 3
/** GAMES_500 #234：TTS 語速與語言可選 — 可改為從設定讀取或 UI 滑桿。 */
const TTS_RATE = 0.9
const TTS_PITCH = 1

/** 朗讀「輪到 XXX 了」 */
function speakTurn(name: string, enabled: boolean) {
  if (typeof window === 'undefined' || !enabled) return
  try {
    const u = window.speechSynthesis
    u.cancel()
    const utterance = new SpeechSynthesisUtterance(`輪到 ${name} 了`)
    utterance.lang = 'zh-TW'
    utterance.rate = TTS_RATE
    utterance.pitch = TTS_PITCH
    utterance.onerror = () => { /* TTS failed silently (e.g. iOS background) */ }
    u.speak(utterance)
  } catch {
    /* ignore - TTS not supported or blocked */
  }
}

/** 傳手機全螢幕 overlay：請傳給 XXX、倒數或防偷看黑屏、跳過、TTS、接力完成回調 */
export default function PassPhoneMode() {
  const ctx = usePassPhone()
  const [countdown, setCountdown] = useState<number | null>(null)
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [showStats, setShowStats] = useState(false)

  const showPassTo = ctx?.showPassTo ?? null
  const enabled = ctx?.enabled ?? false
  const antiPeek = ctx?.antiPeek ?? true
  const ttsEnabled = ctx?.ttsEnabled ?? true

  /** P0-016：輪到某人時手機震動並顯示暱稱；開始倒數或 TTS，防偷看時不自動倒數 */
  useEffect(() => {
    if (!showPassTo || !ctx) return
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 50, 30])
    }
    speakTurn(showPassTo.nextName, ttsEnabled)
    if (antiPeek) {
      setCountdown(null)
      return
    }
    setCountdown(COUNTDOWN_SEC)
    countdownTimerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c === null || c <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current)
            countdownTimerRef.current = null
          }
          ctx.completePass()
          return null
        }
        return c - 1
      })
    }, 1000)
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
        countdownTimerRef.current = null
      }
    }
  }, [showPassTo?.nextIndex, antiPeek, ttsEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  /** 點擊「我準備好了」：震動回饋（BACKLOG 搖晃/音效）後完成傳遞 */
  const handleStart = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50)
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
    setCountdown(null)
    ctx?.completePass()
  }, [ctx])

  const handleSkip = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
    setCountdown(null)
    ctx?.skipCurrent()
  }, [ctx])

  if (!enabled || !showPassTo) return null

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pass-phone-title"
      >
        <h2 id="pass-phone-title" className="sr-only">
          請傳手機給下一位
        </h2>

        {antiPeek ? (
          <>
            <p className="text-white/60 text-lg mb-6 text-center">請將手機傳給</p>
            <p className="text-2xl md:text-3xl font-display font-bold text-primary-300 mb-4 text-center">
              {showPassTo.nextName}
            </p>
            <PassPhoneAnimation />
            <m.button
              type="button"
              className="min-h-[56px] min-w-[200px] mt-8 px-8 py-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xl"
              onClick={handleStart}
              whileTap={{ scale: 0.98 }}
            >
              我準備好了
            </m.button>
          </>
        ) : (
          <>
            <p className="text-white/60 text-lg mb-2 text-center">請傳給</p>
            <p className="text-2xl md:text-3xl font-display font-bold text-primary-300 mb-2 text-center">
              {showPassTo.nextName}
            </p>
            {countdown !== null && countdown > 0 && (
              <m.p
                key={countdown}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className={`text-6xl font-bold my-4 tabular-nums ${countdown <= 2 ? 'text-red-400' : 'text-primary-300'}`}
                aria-live="polite"
              >
                {countdown}
              </m.p>
            )}
            <PassPhoneAnimation />
            <button
              type="button"
              onClick={handleStart}
              className="mt-6 min-h-[48px] min-w-[48px] px-6 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm"
            >
              我準備好了
            </button>
          </>
        )}

        <div className="absolute bottom-6 left-0 right-0 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex items-center gap-2 min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white/80 text-sm"
            aria-label="跳過此人"
          >
            <SkipForward className="w-4 h-4" />
            跳過此人
          </button>
          {ctx?.roundStats && ctx.roundStats.length > 0 && (
            <button
              type="button"
              onClick={() => setShowStats((s) => !s)}
              className="inline-flex items-center gap-2 min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white/80 text-sm"
              aria-label="回合統計"
            >
              <BarChart3 className="w-4 h-4" />
              回合統計
            </button>
          )}
        </div>

        {showStats && ctx?.roundStats && ctx.roundStats.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-24 left-4 right-4 max-h-48 overflow-auto rounded-xl bg-black/80 border border-white/20 p-4 text-sm text-left"
          >
            <p className="text-white/70 font-medium mb-2">回合統計</p>
            <ul className="space-y-1">
              {ctx.roundStats.map((s) => (
                <li key={s.playerIndex} className="text-white/80">
                  {s.playerName}：{s.turns} 輪
                  {s.results.length > 0 && `（${s.results.slice(-3).join('、')}）`}
                </li>
              ))}
            </ul>
          </m.div>
        )}
      </m.div>
    </AnimatePresence>
  )
}
