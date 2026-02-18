'use client'

import { useState, useEffect, useRef } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const SIDES = ['正面', '反面'] as const
const HISTORY_MAX = 5

/** 拋硬幣：猜正面或反面，猜錯喝。來源：Drynk app。本局最近結果可選顯示。 */
export default function CoinFlip() {
  const { play: playSound } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const [choice, setChoice] = useState<typeof SIDES[number] | null>(null)
  const [result, setResult] = useState<typeof SIDES[number] | null>(null)
  const [show, setShow] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  // GAME-055: Streak counter
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  // GAME-056: Wagering mode
  const [coins, setCoins] = useState(100)
  const [wager, setWager] = useState(10)
  const soundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flip = () => {
    if (choice === null || coins < wager) return
    if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current)
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    playSound('click')
    const side = Math.random() < 0.5 ? '正面' : '反面'
    const isWin = side === choice
    setResult(side)
    setShow(true)
    setHistory((prev) => [`猜${choice}開${side}${isWin ? '安全' : '喝'}`, ...prev].slice(0, HISTORY_MAX))
    // GAME-055: Update streak
    if (isWin) {
      setStreak((s) => {
        const next = s + 1
        setBestStreak((b) => Math.max(b, next))
        return next
      })
      setCoins((c) => c + wager)
    } else {
      setStreak(0)
      setCoins((c) => Math.max(0, c - wager))
    }
    soundTimeoutRef.current = setTimeout(() => {
      playSound(isWin ? 'win' : 'wrong')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(isWin ? 50 : 100)
      soundTimeoutRef.current = null
    }, 350)
    hideTimeoutRef.current = setTimeout(() => {
      setShow(false)
      hideTimeoutRef.current = null
    }, 4000)
  }

  useEffect(() => {
    return () => {
      if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current)
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    }
  }, [])

  const win = show && result !== null && choice !== null && result === choice

  /** Esc 或鍵盤 1/2 選正面/反面 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show) {
        e.preventDefault()
        setShow(false)
        setChoice(null)
        setResult(null)
      }
      if (!show && (e.key === '1' || e.key === '2')) {
        e.preventDefault()
        setChoice(e.key === '1' ? '正面' : '反面')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show])
  const resultText = show && result !== null && choice !== null
    ? `拋硬幣：猜${choice}，開${result}，${win ? '安全' : '喝！'}`
    : ''

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="拋硬幣">
      <GameRules rules={`猜硬幣是正面還是反面，系統隨機開獎。\n猜錯的人喝。`} />
      {/* GAME-055: Streak counter display */}
      <div className="flex items-center gap-4 mb-3 text-xs text-white/50">
        <span>🪙 {coins} 金幣</span>
        <span>🔥 連勝 {streak}</span>
        <span>🏆 最佳 {bestStreak}</span>
      </div>
      {/* GAME-056: Wager selector */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-white/50 text-xs">下注:</span>
        {[5, 10, 25, 50].map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setWager(w)}
            disabled={coins < w}
            className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-colors games-focus-ring ${wager === w ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'} disabled:opacity-30`}
            aria-pressed={wager === w}
            aria-label={`下注 ${w} 金幣`}
          >
            {w}
          </button>
        ))}
      </div>
      <p className="text-white/50 text-sm mb-2 text-center">猜正面或反面，猜錯喝</p>
      {!show && (
        <>
          <div className="flex gap-4 mb-6">
            {SIDES.map((s) => (
              <m.button
                key={s}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setChoice(s)}
                className={`min-h-[48px] min-w-[100px] px-6 py-3 rounded-xl font-bold text-lg transition-colors games-focus-ring ${choice === s ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'}`}
                aria-pressed={choice === s}
                aria-label={`猜${s}`}
              >
                {s}
              </m.button>
            ))}
          </div>
          <m.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={flip}
            disabled={choice === null}
            className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg games-focus-ring"
            aria-label="拋硬幣"
          >
            拋硬幣
          </m.button>
        </>
      )}
      <AnimatePresence>
        {show && result !== null && choice !== null && (
          <m.div
            initial={reducedMotion ? false : { scale: 0.5, opacity: 0, rotateY: 0 }}
            animate={{ 
              scale: reducedMotion ? 1 : [0.5, 1.2, 1],
              opacity: 1,
              rotateY: reducedMotion ? 0 : [0, 720, 720]
            }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
            transition={reducedMotion ? { duration: 0 } : {
              duration: 0.8,
              times: [0, 0.7, 1],
              rotateY: { duration: 0.6, ease: "easeOut" }
            }}
            className={`text-center mb-4 p-6 rounded-2xl border-2 shadow-2xl ${win ? 'bg-green-500/15 border-green-500/50' : 'bg-red-500/15 border-red-500/50'}`}
            role="status"
            aria-live="polite"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Phase 1 C1.5: 硬幣 3D 翻转动画 */}
            <m.p 
              className="text-2xl font-bold text-primary-300 mb-2"
              initial={reducedMotion ? false : { rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={reducedMotion ? { duration: 0 } : { delay: 0.6, duration: 0.3 }}
            >
              开{result}
            </m.p>
            <m.p 
              className={`font-bold text-xl ${win ? 'text-green-400' : 'text-red-400'}`}
              initial={reducedMotion ? false : { scale: 0 }}
              animate={{ scale: reducedMotion ? 1 : [0, 1.3, 1] }}
              transition={reducedMotion ? { duration: 0 } : { delay: 0.7, duration: 0.4 }}
            >
              {win ? '✓ 安全' : '喝！'}
            </m.p>
            <CopyResultButton text={resultText} className="mt-3 games-focus-ring" />
          </m.div>
        )}
      </AnimatePresence>
      {show && (
        <button
          type="button"
          onClick={() => { setShow(false); setChoice(null); setResult(null); }}
          className="mt-4 min-h-[48px] min-w-[48px] px-4 py-2 text-white/60 text-sm hover:text-white/80 rounded-lg games-focus-ring"
        >
          再玩一次
        </button>
      )}
      {history.length > 0 && (
        <div className="mt-4 w-full max-w-xs">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="min-h-[48px] min-w-[48px] px-3 py-2 text-white/50 text-xs hover:text-white/70 rounded-lg games-focus-ring"
          >
            {showHistory ? '隱藏' : '顯示'}本局最近結果
          </button>
          {showHistory && (
            <ul className="mt-1 max-h-24 overflow-y-auto text-white/60 text-xs space-y-0.5" role="list" aria-live="polite">
              {history.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
