'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { m } from 'framer-motion'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { DrinkingAnimation } from './DrinkingAnimation'
import { Timer } from 'lucide-react'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']
/** R2-160：反應力測試 — 倒數後變色搶按，記錄反應時間，最慢者喝 */
const COUNTDOWN_SEC = 3
const MIN_DELAY_MS = 800
const MAX_DELAY_MS = 3500

export default function ReactionSpeed() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [phase, setPhase] = useState<'idle' | 'countdown' | 'wait' | 'green' | 'result'>('idle')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC)
  const [reactionTimes, setReactionTimes] = useState<Record<number, number>>({})
  const [greenAt, setGreenAt] = useState<number>(0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const greenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentPlayer = players[currentPlayerIndex]
  const slowestIndex = (() => {
    const entries = Object.entries(reactionTimes).filter(([, t]) => t > 0)
    if (entries.length === 0) return null
    return entries.reduce((a, b) => (reactionTimes[Number(a[0])] >= reactionTimes[Number(b[0])] ? a : b))[0] as string
  })()
  const fastestIndex = (() => {
    const entries = Object.entries(reactionTimes).filter(([, t]) => t > 0)
    if (entries.length === 0) return null
    return entries.reduce((a, b) => (reactionTimes[Number(a[0])] <= reactionTimes[Number(b[0])] ? a : b))[0] as string
  })()

  const cleanup = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    if (greenTimeoutRef.current) {
      clearTimeout(greenTimeoutRef.current)
      greenTimeoutRef.current = null
    }
  }, [])

  useEffect(() => () => cleanup(), [cleanup])

  const startRound = useCallback(() => {
    play('click')
    setPhase('countdown')
    setCountdown(COUNTDOWN_SEC)
    setCurrentPlayerIndex(0)
    setReactionTimes({})
  }, [play])

  /** Countdown 3-2-1 then go to wait (random delay then green) */
  useEffect(() => {
    if (phase !== 'countdown') return
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          countdownRef.current = null
          setPhase('wait')
          const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
          greenTimeoutRef.current = setTimeout(() => {
            greenTimeoutRef.current = null
            setGreenAt(Date.now())
            setPhase('green')
            play('correct')
          }, delay)
          return 0
        }
        play('click')
        return c - 1
      })
    }, 1000)
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [phase, play])

  const onTap = useCallback(() => {
    if (phase !== 'green') return
    const ms = Date.now() - greenAt
    setReactionTimes((prev) => ({ ...prev, [currentPlayerIndex]: ms }))
    if (currentPlayerIndex + 1 < players.length) {
      setCurrentPlayerIndex((i) => i + 1)
      setPhase('countdown')
      setCountdown(COUNTDOWN_SEC)
      return
    }
    setPhase('result')
  }, [phase, greenAt, currentPlayerIndex, players.length])

  const reset = useCallback(() => {
    cleanup()
    setPhase('idle')
  }, [cleanup])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="反應力測試">
      <GameRules
        rules="倒數後畫面變綠，越快按越好！每人一輪後比反應時間，最慢的人喝。"
        rulesKey="reaction-speed.rules"
      />
      {phase === 'idle' && (
        <div className="text-center">
          <Timer className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <p className="text-white/70 mb-6">變色搶按，最慢喝酒</p>
          <button type="button" onClick={startRound} className="btn-primary px-8 py-3 text-lg games-focus-ring">
            開始
          </button>
        </div>
      )}
      {(phase === 'countdown' || phase === 'wait') && (
        <div className="text-center">
          <p className="text-white/60 mb-2">輪到 {currentPlayer}</p>
          <p className="text-4xl font-bold text-white tabular-nums">
            {phase === 'countdown' ? countdown : '…'}
          </p>
          <p className="text-white/40 text-sm mt-2">{phase === 'wait' ? '等變綠再按' : ''}</p>
        </div>
      )}
      {phase === 'green' && (
        <m.button
          type="button"
          onClick={onTap}
          className="w-full min-h-[60vh] rounded-2xl bg-green-500 hover:bg-green-400 active:scale-[0.98] transition-transform games-focus-ring"
          initial={reducedMotion ? false : { scale: 0.95 }}
          animate={{ scale: 1 }}
          aria-label="按下去記錄反應時間"
        >
          <span className="text-white text-xl font-bold">按！</span>
        </m.button>
      )}
      {phase === 'result' && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-md w-full"
        >
          <p className="text-white/50 text-xs mb-1">本局趣味數據</p>
          <p className="text-white/60 text-sm mb-2">反應時間</p>
          <ul className="space-y-1 mb-4 text-left">
            {players.map((name, i) => (
              <li key={i} className="flex justify-between text-white/80">
                <span>{name}</span>
                <span className="tabular-nums">{reactionTimes[i] != null ? `${reactionTimes[i]} ms` : '—'}</span>
              </li>
            ))}
          </ul>
          {fastestIndex != null && (
            <p className="text-primary-400 text-sm mb-1">最快反應：{players[Number(fastestIndex)]}（{reactionTimes[Number(fastestIndex)]} ms）</p>
          )}
          {slowestIndex != null && (
            <>
              <p className="text-red-400 font-bold text-xl mb-2">{players[Number(slowestIndex)]} 最慢，喝！</p>
              {!reducedMotion && <DrinkingAnimation duration={1.2} className="my-3 mx-auto" />}
            </>
          )}
          <div className="flex gap-3 justify-center mt-4">
            <CopyResultButton
              text={slowestIndex != null ? `反應力測試：${players[Number(slowestIndex)]} 最慢，喝！` : '反應力測試'}
              label="複製"
              className="games-focus-ring"
            />
            <button type="button" onClick={reset} className="btn-primary px-6 py-2 games-focus-ring">
              再一輪
            </button>
          </div>
        </m.div>
      )}
    </div>
  )
}
