'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']
const TARGET_TAPS = 7
const TIME_LIMIT_MS = 7000

/** 七拍：7 秒內點滿 7 下即過關，未滿或超時喝。 */
export default function SevenTap() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [taps, setTaps] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'playing' | 'result'>('idle')
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tapsRef = useRef(0)

  tapsRef.current = taps

  const start = () => {
    play('click')
    setTaps(0)
    setResult(null)
    setPhase('playing')
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null
      const currentTaps = tapsRef.current
      const ok = currentTaps >= TARGET_TAPS
      setResult(ok ? 'win' : 'lose')
      setPhase('result')
      if (!ok) {
        play('wrong')
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
      } else play('win')
    }, TIME_LIMIT_MS)
  }

  const handleTap = () => {
    if (phase !== 'playing') return
    const next = taps + 1
    setTaps(next)
    play('click')
    if (next >= TARGET_TAPS) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      setResult('win')
      setPhase('result')
      play('win')
    }
  }

  const nextPlayer = () => {
    setResult(null)
    setPhase('idle')
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (phase !== 'result' || result === null) return
    const t = setTimeout(() => {
      setPhase('result')
    }, 0)
    return () => clearTimeout(t)
  }, [phase, result])

  const currentPlayer = players[currentPlayerIndex]

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="七拍">
      <GameRules rules={`7 秒內點滿 7 下即過關；未滿或超時喝。\n輪流由每人挑戰。`} />
      <p className="text-white/50 text-sm mb-2">跟節奏點 7 下，脫拍喝</p>
      <p className="text-white/70 text-lg mb-4" aria-live="polite">輪到：{currentPlayer}</p>
      {phase === 'idle' && (
        <button type="button" onClick={start} className="btn-primary min-h-[48px] px-8 games-focus-ring" data-testid="seven-tap-start" aria-label="開始">開始</button>
      )}
      {phase === 'playing' && (
        <motion.button type="button" onClick={handleTap} className="min-h-[64px] min-w-[64px] rounded-full bg-primary-500 text-white text-2xl font-bold games-focus-ring" data-testid="seven-tap-btn" aria-label={`點擊，目前 ${taps} 下`} whileTap={reducedMotion ? undefined : { scale: 0.95 }}>
          {taps} / {TARGET_TAPS}
        </motion.button>
      )}
      {phase === 'result' && result && (
        <motion.div
          initial={reducedMotion ? false : { scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={reducedMotion ? { duration: 0 } : undefined}
          className="mt-4 p-4 rounded-2xl text-center"
          role="status"
          aria-live="assertive"
          data-testid="seven-tap-result"
        >
          <p className={result === 'win' ? 'text-green-400 font-bold text-xl' : 'text-red-400 font-bold text-xl'}>{result === 'win' ? '過關！' : '未滿 7 下，喝！'}</p>
          <CopyResultButton text={`七拍：${currentPlayer} ${result === 'win' ? '過關' : '喝'}`} label="複製結果" className="mt-2 games-focus-ring" />
          <button type="button" onClick={nextPlayer} className="mt-2 min-h-[48px] px-4 rounded-xl bg-white/10 text-white games-focus-ring" aria-label="下一位">下一位</button>
        </motion.div>
      )}
    </div>
  )
}
