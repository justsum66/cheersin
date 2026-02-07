'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']
const OUTCOMES = ['這輪喝', '安全'] as const
const HISTORY_MAX = 5

/** 喝或安全：隨機抽一位 + 隨機「喝／安全」，純數位。本局最近結果可選顯示。 */
export default function DrinkOrSafe() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [playerIndex, setPlayerIndex] = useState(0)
  const [outcome, setOutcome] = useState<(typeof OUTCOMES)[number] | null>(null)
  const [show, setShow] = useState(false)
  const [history, setHistory] = useState<{ name: string; outcome: (typeof OUTCOMES)[number] }[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const draw = () => {
    play('click')
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    const i = Math.floor(Math.random() * players.length)
    const o = OUTCOMES[Math.floor(Math.random() * OUTCOMES.length)]
    setPlayerIndex(i)
    setOutcome(o)
    setShow(true)
    setHistory((prev) => [{ name: players[i], outcome: o }, ...prev].slice(0, HISTORY_MAX))
    if (o === '這輪喝') {
      play('wrong')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
    } else play('correct')
    hideTimeoutRef.current = setTimeout(() => {
      hideTimeoutRef.current = null
      setShow(false)
    }, 3500)
  }

  /** unmount 時清除自動隱藏計時器，避免 setState on unmounted */
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!show) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShow(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show])

  const resultText = show && outcome ? `${players[playerIndex]}：${outcome}` : ''

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="喝或安全">
      <GameRules rules={`隨機抽一位玩家，再隨機決定「這輪喝」或「安全」。\n抽到「這輪喝」要喝；「安全」本輪免罰。`} />
      <p className="text-white/50 text-sm mb-2 text-center">抽一位＋喝或安全</p>
      {show && outcome && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-center mb-4 p-4 rounded-2xl border-2 ${outcome === '這輪喝' ? 'bg-red-500/15 border-red-500/50' : 'bg-green-500/15 border-green-500/50'}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-xl font-bold text-primary-300">{players[playerIndex]}</p>
          <p className={`font-bold text-lg mt-2 flex items-center justify-center gap-2 ${outcome === '這輪喝' ? 'text-red-400' : 'text-green-400'}`}>
            {outcome === '這輪喝' && '🍺 '}
            {outcome === '安全' && '✓ '}
            {outcome}
          </p>
          <span className="sr-only" aria-live="polite">
            {players[playerIndex]}：{outcome}
          </span>
          <CopyResultButton text={resultText} className="mt-3" />
        </motion.div>
      )}
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={draw}
        className="min-h-[48px] min-w-[100px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg games-focus-ring"
        aria-label="抽一位"
      >
        抽
      </motion.button>
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
              {history.map((h, i) => (
                <li key={i}>{h.name}：{h.outcome}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
