'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { useGamesPlayers } from './GamesContext'
import { useGameReduceMotion } from './GameWrapper'
import CopyResultButton from './CopyResultButton'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

/** 一次可喊 1～3 個連續數字，喊到 31 的人喝 */
export default function BaskinRobbins31() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [currentNumber, setCurrentNumber] = useState(0)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [lastAdd, setLastAdd] = useState<number | null>(null)
  const [lost, setLost] = useState<string | null>(null)
  const [explosion, setExplosion] = useState(false)
  const lostRef = useRef<string | null>(null)
  const lostClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reducedMotion = useGameReduceMotion()

  const currentPlayer = players[currentPlayerIndex]
  const remaining = 31 - currentNumber
  const maxStep = Math.min(3, remaining)
  /** 58 剩餘可喊數字：currentNumber+1 ～ currentNumber+maxStep */
  const nextNumbers = Array.from({ length: maxStep }, (_, i) => currentNumber + i + 1)

  const add = useCallback((count: 1 | 2 | 3) => {
    if (count < 1 || count > Math.min(3, 31 - currentNumber)) return
    play('click')
    const next = currentNumber + count
    setLastAdd(count)
    setCurrentNumber(next)
    if (next >= 31) {
      lostRef.current = players[currentPlayerIndex]
      setLost(players[currentPlayerIndex])
      setExplosion(!reducedMotion)
      play('wrong')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([150, 80, 150])
      setCurrentNumber(0)
      setLastAdd(null)
      if (lostClearTimeoutRef.current) clearTimeout(lostClearTimeoutRef.current)
      lostClearTimeoutRef.current = setTimeout(() => {
        lostClearTimeoutRef.current = null
        setLost(null)
        setExplosion(false)
        lostRef.current = null
      }, 4000)
    } else {
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length)
    }
  }, [currentNumber, currentPlayerIndex, players, play, reducedMotion])

  useEffect(() => {
    if (!lost) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLost(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lost])

  useEffect(() => {
    return () => {
      if (lostClearTimeoutRef.current) {
        clearTimeout(lostClearTimeoutRef.current)
        lostClearTimeoutRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || lost) return
      const n = e.key === '1' ? 1 : e.key === '2' ? 2 : e.key === '3' ? 3 : null
      if (n !== null && n <= maxStep) {
        e.preventDefault()
        add(n as 1 | 2 | 3)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [maxStep, add, lost])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="31 遊戲">
      <GameRules rules={`輪流喊 1～31，每次可喊 1、2 或 3 個連續數字。\n喊到 31 的人喝。鍵盤 1／2／3 可對應加數。`} />
      <p className="text-white/50 text-sm mb-2">一次可喊 1～3 個數，喊到 31 的人喝（鍵盤 1／2／3）</p>
      <div className="text-4xl md:text-5xl font-mono font-bold text-primary-300 mb-4" aria-live="polite">
        {currentNumber}
      </div>
      {maxStep > 0 && (
        <p className="text-white/50 text-sm mb-1" aria-live="polite">
          剩餘可喊：{nextNumbers.join('、')}
        </p>
      )}
      <p className="text-white/70 text-lg mb-4">輪到 {currentPlayer}</p>
      <AnimatePresence>
        {explosion && (
          <m.div
            key="explosion"
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.6 }}
            className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
            aria-hidden
          >
            <div className="w-48 h-48 rounded-full bg-red-500/60 blur-3xl" />
          </m.div>
        )}
      </AnimatePresence>
      {lost && (
        <m.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-2 mb-4"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-red-400 font-bold text-2xl md:text-3xl">{lost} 喝！</p>
          <CopyResultButton text={`31 遊戲：${lost} 喝！`} />
        </m.div>
      )}
      <div className="flex gap-3 flex-wrap justify-center">
        {([1, 2, 3] as const).map(
          (n) =>
            n <= maxStep && (
              <m.button
                key={n}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => add(n)}
                className="min-h-[56px] min-w-[80px] px-6 py-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold text-2xl games-focus-ring"
                aria-label={`加 ${n}`}
                title={`鍵盤 ${n}`}
              >
                +{n}
              </m.button>
            )
        )}
      </div>
    </div>
  )
}
