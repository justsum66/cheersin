'use client'

import { useState, useRef, useEffect } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { fireFullscreenConfetti, showFailureEffect } from '@/lib/celebration'
import { useGameSound } from '@/hooks/useGameSound'
import { useGamesPlayers } from './GamesContext'
import { useGameStore } from '@/store/useGameStore'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { DrinkingAnimation } from './DrinkingAnimation'
import { useGameReduceMotion } from './GameWrapper'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2']
const ROUND_HISTORY_MAX = 5
type RoundOutcome = 'correct' | 'wrong' | 'freePass' | 'tie'
type RoundEntry = { from: number; to: number; outcome: RoundOutcome }

/** 比大小：牌面樣式、揭曉翻牌動畫、連勝統計與複製結果。77 三連勝免喝一輪。games_70 #64 本局歷史。 */
export default function HighLow() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const { addReplayEvent } = useGameStore()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [current, setCurrent] = useState(() => Math.floor(Math.random() * 13) + 1)
  const [next, setNext] = useState<number | null>(null)
  const [playerIndex, setPlayerIndex] = useState(0)
  const [result, setResult] = useState<'correct' | 'wrong' | 'freePass' | null>(null)
  const [streak, setStreak] = useState(0)
  const [freePass, setFreePass] = useState(false)
  const [totalRounds, setTotalRounds] = useState(0)
  const [roundHistory, setRoundHistory] = useState<RoundEntry[]>([])

  const currentPlayer = players[playerIndex]
  const displayNum = next !== null ? next : current
  const isRevealing = next !== null
  const swipeStartY = useRef(0)

  const guess = (high: boolean) => {
    const nextCard = Math.floor(Math.random() * 13) + 1
    setNext(nextCard)
    const correct = high ? nextCard > current : nextCard < current
    const newStreak = nextCard === current ? 0 : (correct ? streak + 1 : 0)
    if (nextCard === current) {
      setResult('wrong')
      setStreak(0)
      addReplayEvent({ type: 'highlow_guess', label: `比大小：${current}→${nextCard} 平手喝` })
      showFailureEffect()
    } else {
      setStreak(newStreak)
      if (correct && newStreak >= 3) {
        setFreePass(true)
        play('win')
        fireFullscreenConfetti()
      } else if (correct) {
        play('correct')
      } else if (!freePass) {
        play('wrong')
        showFailureEffect()
      }
      if (!correct && freePass) {
        setResult('freePass')
        setFreePass(false)
        addReplayEvent({ type: 'highlow_guess', label: `比大小：${current}→${nextCard} 免喝` })
      } else {
        setResult(correct ? 'correct' : 'wrong')
        const resultLabel = correct ? '猜對' : '猜錯'
        addReplayEvent({ type: 'highlow_guess', label: `比大小：${current}→${nextCard} ${resultLabel}` })
      }
    }
    const outcome: RoundOutcome = nextCard === current ? 'tie' : correct ? (newStreak >= 3 ? 'freePass' : 'correct') : (freePass ? 'freePass' : 'wrong')
    setRoundHistory((prev) => [...prev, { from: current, to: nextCard, outcome }].slice(-ROUND_HISTORY_MAX))
    setTotalRounds((r) => r + 1)
    if (nextRoundTimeoutRef.current) clearTimeout(nextRoundTimeoutRef.current)
    nextRoundTimeoutRef.current = setTimeout(() => {
      nextRoundTimeoutRef.current = null
      setCurrent(nextCard)
      setNext(null)
      setResult(null)
      setPlayerIndex((playerIndex + 1) % players.length)
    }, 2000)
  }

  const nextRoundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const guessRef = useRef(guess)
  guessRef.current = guess
  /** 鍵盤：1/Left=小、2/Right=大（task 78） */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (next !== null || e.repeat) return
      if (e.key === '1' || e.key === 'ArrowLeft') {
        e.preventDefault()
        guessRef.current(false)
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        e.preventDefault()
        guessRef.current(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next])

  useEffect(() => {
    return () => {
      if (nextRoundTimeoutRef.current) {
        clearTimeout(nextRoundTimeoutRef.current)
        nextRoundTimeoutRef.current = null
      }
    }
  }, [])

  /** Esc 提早進入下一輪（等同 2s 後自動換下一張） */
  useEffect(() => {
    if (result === null || next === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (nextRoundTimeoutRef.current) {
          clearTimeout(nextRoundTimeoutRef.current)
          nextRoundTimeoutRef.current = null
        }
        setCurrent(next)
        setNext(null)
        setResult(null)
        setPlayerIndex((i) => (i + 1) % players.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [result, next, players.length])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="比大小">
      <GameRules rules={`輪流猜下一張數字比現在「大」或「小」。\n猜錯的人喝；若下一張相同也算錯。`} />
      <p className="text-white/50 text-sm mb-2">猜下一張比現在大還是小，猜錯喝</p>
      <div className="flex gap-3 text-white/60 text-sm mb-2" aria-live="polite">
        <span>連勝：{streak}</span>
        <span>總局數：{totalRounds}</span>
        {freePass && <span className="text-amber-400">免喝券 ✓</span>}
      </div>
      {roundHistory.length > 0 && (
        <div className="text-white/40 text-xs mb-2" role="status" aria-live="polite">
          本局最近：{roundHistory.map((e, i) => (
            <span key={i}>
              {e.from}→{e.to} {e.outcome === 'correct' ? '✓' : e.outcome === 'wrong' ? '✗' : e.outcome === 'freePass' ? '免' : '平'}
              {i < roundHistory.length - 1 ? '、' : ''}
            </span>
          ))}
        </div>
      )}
      <p className="text-white/70 text-lg mb-4">輪到 {currentPlayer}</p>
      <m.div
        className="min-w-[100px] min-h-[120px] rounded-xl border-2 border-white/30 bg-white/5 flex items-center justify-center mb-4 overflow-hidden"
        style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }}
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          <m.span
            key={displayNum}
            initial={{ rotateY: isRevealing ? -90 : 0, opacity: isRevealing ? 0.5 : 1 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="text-4xl md:text-5xl font-mono font-bold text-primary-300"
          >
            {displayNum}
          </m.span>
        </AnimatePresence>
      </m.div>
      {result && (
        <m.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="mb-2 text-center"
          aria-live="assertive"
        >
          <span className="sr-only" aria-live="assertive">
            {result === 'correct' ? '猜對' : result === 'freePass' ? '免喝' : '猜錯喝'}
            {next !== null && `，正確數字 ${next}`}
          </span>
          <p className={`font-bold text-xl ${result === 'correct' ? 'text-green-400' : result === 'freePass' ? 'text-amber-400' : 'text-red-400'
            }`}>
            {result === 'correct' ? '對！' : result === 'freePass' ? '3連勝獎勵！本輪免喝' : '喝！'}
          </p>
          {result === 'wrong' && !reducedMotion && <DrinkingAnimation duration={1.2} className="my-3 mx-auto" />}
          {(result === 'wrong' || result === 'freePass') && next !== null && (
            <p className="text-white/60 text-sm mt-1">正確數字：{next}，與上一張差距 {Math.abs(next - current)}</p>
          )}
        </m.div>
      )}
      {(totalRounds > 0 || result) && (
        <CopyResultButton
          text={`比大小：連勝 ${streak}／總局數 ${totalRounds}`}
          label="複製統計"
          className="mb-2 games-focus-ring"
        />
      )}
      {next === null && (
        <div
          className="flex flex-col gap-4 items-center touch-none select-none"
          onTouchStart={(e) => { swipeStartY.current = e.touches[0].clientY }}
          onTouchEnd={(e) => {
            const dy = e.changedTouches[0].clientY - swipeStartY.current
            if (Math.abs(dy) < 40) return
            if (dy < 0) guess(true)
            else guess(false)
          }}
        >
          <p className="text-white/40 text-xs">或上滑＝大、下滑＝小；鍵盤 1/←＝小、2/→＝大</p>
          <div className="flex gap-4">
            <m.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => guess(false)}
              className="min-h-[48px] min-w-[48px] px-8 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold games-focus-ring"
            >
              小
            </m.button>
            <m.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => guess(true)}
              className="min-h-[48px] min-w-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold games-focus-ring"
            >
              大
            </m.button>
          </div>
        </div>
      )}
    </div>
  )
}
