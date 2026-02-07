'use client'

import { useState, useRef, useEffect } from 'react'
import CopyResultButton from './CopyResultButton'
import { motion, AnimatePresence } from 'framer-motion'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']
const MAX_LEVEL = 100
const INCREMENT_OPTIONS = [4, 6, 8] as const

/** 數位版浮杯：單次增量可調 +4／+6／+8。 */
export default function Titanic() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [increment, setIncrement] = useState<4 | 6 | 8>(6)
  const [level, setLevel] = useState(0)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [lost, setLost] = useState<string | null>(null)
  const [justFilled, setJustFilled] = useState(false)
  const justFilledTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lostTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentPlayer = players[currentPlayerIndex]
  const isNearFull = level >= 80 && level < MAX_LEVEL

  const add = () => {
    play('click')
    const next = level + increment
    if (next >= MAX_LEVEL) {
      play('wrong')
      setJustFilled(true)
      if (justFilledTimeoutRef.current) clearTimeout(justFilledTimeoutRef.current)
      justFilledTimeoutRef.current = setTimeout(() => {
        justFilledTimeoutRef.current = null
        setJustFilled(false)
      }, 700)
      setLost(currentPlayer)
      setLevel(0)
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([150, 80, 150])
      setCurrentPlayerIndex(0)
      if (lostTimeoutRef.current) clearTimeout(lostTimeoutRef.current)
      lostTimeoutRef.current = setTimeout(() => {
        lostTimeoutRef.current = null
        setLost(null)
      }, 2500)
    } else {
      setLevel(next)
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length)
    }
  }

  useEffect(() => {
    return () => {
      if (justFilledTimeoutRef.current) {
        clearTimeout(justFilledTimeoutRef.current)
        justFilledTimeoutRef.current = null
      }
      if (lostTimeoutRef.current) {
        clearTimeout(lostTimeoutRef.current)
        lostTimeoutRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!lost) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lostTimeoutRef.current) {
          clearTimeout(lostTimeoutRef.current)
          lostTimeoutRef.current = null
        }
        setLost(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lost])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="鐵達尼浮杯">
      <GameRules rules={`輪流按「加一點」，水位會上升。\n讓杯子滿（100%）的人喝（沉船）。可選每按一次增加量。`} />
      <p className="text-white/50 text-sm mb-2">輪流加一點，讓杯子沉下去的人喝</p>
      <div className="flex gap-2 mb-2" role="group" aria-label="單次增加量">
        {INCREMENT_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setIncrement(n)}
            className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors games-focus-ring ${increment === n ? 'bg-cyan-500/80 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          >
            +{n}
          </button>
        ))}
      </div>
      <p className="text-white/70 text-lg mb-2">輪到 {currentPlayer}</p>
      <div className="w-full max-w-xs h-14 rounded-xl bg-white/10 border border-white/20 overflow-hidden mb-6 flex flex-col justify-end relative">
        <motion.div
          className={`w-full bg-gradient-to-b from-cyan-400 to-blue-800 ${isNearFull ? 'shadow-[0_0_16px_rgba(34,211,238,0.4)]' : ''}`}
          initial={false}
          animate={{ height: `${level}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        <AnimatePresence>
          {justFilled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none bg-blue-900/40"
              aria-hidden
            >
              <span className="text-cyan-100 font-bold text-lg drop-shadow-lg">沉船！💧</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {lost && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="mb-4"
        >
          <p className="text-red-400 font-bold text-xl" aria-live="assertive">{lost} 沉了，喝！</p>
          <CopyResultButton text={`鐵達尼浮杯：${lost} 沉了，喝！`} className="mt-2 games-focus-ring" />
        </motion.div>
      )}
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={add}
        className="min-h-[48px] px-8 py-3 rounded-xl bg-cyan-500/80 hover:bg-cyan-500 text-white font-bold text-lg games-focus-ring"
      >
        加一點
      </motion.button>
    </div>
  )
}
