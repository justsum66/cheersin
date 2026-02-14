'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { m } from 'framer-motion'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGameSound } from '@/hooks/useGameSound'

const DICE_COUNT = 5
const GUESS_DEADLINE_SEC = 5
const MAX = DICE_COUNT * 6
const LOW_BOUND = Math.floor(MAX * 0.33)
const HIGH_BOUND = Math.ceil(MAX * 0.66)

type RoundRecord = { total: number; guess: 'low' | 'mid' | 'high'; correct: boolean }

/** 吹牛骰子：骰面動畫、猜前顯示低/中/高區間說明。82 掀蓋時緊張計時 5 秒。 */
export default function LiarDice() {
  const { play } = useGameSound()
  const [dices, setDices] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const [guess, setGuess] = useState<'low' | 'mid' | 'high' | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [rolling, setRolling] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [roundHistory, setRoundHistory] = useState<RoundRecord[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [lastCopyText, setLastCopyText] = useState('')
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resultHideRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rollDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const roll = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = null
    setCountdown(null)
    setRolling(true)
    setDices([])
    setRevealed(false)
    setGuess(null)
    setResult(null)
    play('click')
    if (rollDelayRef.current) clearTimeout(rollDelayRef.current)
    rollDelayRef.current = setTimeout(() => {
      rollDelayRef.current = null
      const arr = Array.from({ length: DICE_COUNT }, () => Math.floor(Math.random() * 6) + 1)
      setDices(arr)
      setRolling(false)
      setCountdown(GUESS_DEADLINE_SEC)
      countdownRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c === null || c <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current)
            countdownRef.current = null
            return null
          }
          return c - 1
        })
      }, 1000)
    }, 400)
  }, [play])

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
      if (resultHideRef.current) clearTimeout(resultHideRef.current)
      if (rollDelayRef.current) {
        clearTimeout(rollDelayRef.current)
        rollDelayRef.current = null
      }
    }
  }, [])

  const reveal = (g: 'low' | 'mid' | 'high') => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = null
    setCountdown(null)
    setGuess(g)
    setRevealed(true)
    const total = dices.reduce((a, b) => a + b, 0)
    const correct =
      (g === 'low' && total <= LOW_BOUND) ||
      (g === 'mid' && total > LOW_BOUND && total < HIGH_BOUND) ||
      (g === 'high' && total >= HIGH_BOUND)
    play(correct ? 'correct' : 'wrong')
    if (!correct && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
    setResult(correct ? '對！不用喝' : `總點數 ${total}，喝！`)
    setRoundHistory((prev) => [...prev, { total, guess: g, correct }].slice(-10))
    setLastCopyText(`吹牛骰子 總點數 ${total}，猜${g === 'low' ? '低' : g === 'mid' ? '中' : '高'}，${correct ? '猜對不用喝' : '喝！'}`)
    if (resultHideRef.current) clearTimeout(resultHideRef.current)
    resultHideRef.current = setTimeout(() => { setResult(null); resultHideRef.current = null }, 3000)
  }

  useEffect(() => {
    if (!result) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setResult(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [result])

  const canGuess = dices.length > 0 && !revealed && !rolling

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="吹牛骰子">
      <GameRules rules={`先擲骰，再猜總點數是「低」「中」或「高」。\n低＝總和 ≤${LOW_BOUND}、中＝${LOW_BOUND + 1}～${HIGH_BOUND - 1}、高＝≥${HIGH_BOUND}（共 ${DICE_COUNT} 顆，總和 1～${MAX}）。猜錯喝。`} />
      <p className="text-white/50 text-sm mb-2 text-center">
        猜總點數是低／中／高，猜錯喝
      </p>
      {!revealed && dices.length > 0 && (
        <>
          <p className="text-white/40 text-xs mb-2 text-center" aria-live="polite">
            低 ≤{LOW_BOUND} · 中 {LOW_BOUND + 1}～{HIGH_BOUND - 1} · 高 ≥{HIGH_BOUND}
          </p>
          {countdown !== null && (
            <p className="text-amber-400 text-sm font-medium mb-2" aria-live="polite">
              {countdown} 秒內決定…
            </p>
          )}
        </>
      )}
      {(dices.length > 0 || rolling) && (
        <div className="flex gap-2 mb-4 min-h-[48px] items-center justify-center" role="group" aria-label="骰子點數">
          {rolling ? (
            Array.from({ length: DICE_COUNT }).map((_, i) => (
              <m.span
                key={i}
                initial={{ scale: 0.5, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.06, repeat: Infinity, duration: 0.3 }}
                className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-bold text-white"
              >
                ?
              </m.span>
            ))
          ) : (
            dices.map((d, i) => (
              <m.span
                key={`${i}-${d}`}
                initial={{ scale: 0.3, rotateX: -180 }}
                animate={{ scale: 1, rotateX: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25, delay: i * 0.05 }}
                className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-bold text-white shadow-lg"
              >
                {d}
              </m.span>
            ))
          )}
        </div>
      )}
      {result && (
        <div className="mb-4">
          <m.p
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={`font-bold text-lg ${result.includes('喝') ? 'text-red-400' : 'text-green-400'}`}
          >
            {result}
          </m.p>
          <CopyResultButton text={lastCopyText} className="mt-2 games-focus-ring" label="複製結果" />
        </div>
      )}
      {roundHistory.length > 0 && (
        <div className="mt-2 w-full max-w-xs">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="min-h-[48px] min-w-[48px] px-3 py-2 text-white/50 text-xs hover:text-white/70 rounded-lg games-focus-ring"
          >
            {showHistory ? '隱藏' : '顯示'}本局歷史
          </button>
          {showHistory && (
            <>
              <ul className="mt-1 max-h-24 overflow-y-auto text-white/60 text-xs space-y-0.5" role="list">
                {roundHistory.slice().reverse().map((r, i) => (
                  <li key={i}>總和 {r.total}，猜{r.guess === 'low' ? '低' : r.guess === 'mid' ? '中' : '高'}，{r.correct ? '對' : '喝'}</li>
                ))}
              </ul>
              <CopyResultButton
                text={`吹牛骰子 本局歷史：${roundHistory.slice().reverse().map((r) => `總和${r.total}猜${r.guess === 'low' ? '低' : r.guess === 'mid' ? '中' : '高'}${r.correct ? '對' : '喝'}`).join('、')}`}
                label="複製歷史"
                className="mt-2 games-focus-ring"
              />
            </>
          )}
        </div>
      )}
      {/* 85 叫／開按鈕放大 */}
      {dices.length === 0 || rolling ? (
        <m.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={roll}
          disabled={rolling}
          className="min-h-[56px] min-w-[56px] px-10 py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 disabled:opacity-70 text-white font-bold text-xl games-focus-ring"
        >
          {rolling ? '擲骰中…' : '擲骰'}
        </m.button>
      ) : canGuess ? (
        <div className="flex gap-4">
          {(['low', 'mid', 'high'] as const).map((g) => (
            <m.button
              key={g}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => reveal(g)}
              className="min-h-[56px] min-w-[80px] px-8 py-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold text-xl games-focus-ring"
            >
              {g === 'low' ? '低' : g === 'mid' ? '中' : '高'}
            </m.button>
          ))}
        </div>
      ) : (
        <m.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={roll}
          className="min-h-[56px] min-w-[56px] px-10 py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xl games-focus-ring"
        >
          再一局
        </m.button>
      )}
    </div>
  )
}
