'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

/** 數位真心話瓶：瓶口指到的人選真心話或大冒險。隨機指一位。 */
export default function SpinBottle() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [targetIndex, setTargetIndex] = useState<number | null>(null)
  const [show, setShow] = useState(false)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const spin = () => {
    play('click')
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    const i = Math.floor(Math.random() * players.length)
    setTargetIndex(i)
    setShow(true)
    play('win')
    hideTimeoutRef.current = setTimeout(() => {
      hideTimeoutRef.current = null
      setShow(false)
    }, 5000)
  }

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

  const targetName = targetIndex !== null ? players[targetIndex] : null

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="數位真心話瓶">
      <GameRules rules={`瓶口指到的人選真心話或大冒險。\n此處隨機指一位，由該位選擇題目。`} />
      <p className="text-white/50 text-sm mb-2">瓶口指到的人選真心話或大冒險</p>
      <button type="button" onClick={spin} className="btn-primary min-h-[48px] px-8 games-focus-ring" data-testid="spin-bottle-spin" aria-label="轉瓶">轉瓶</button>
      {show && targetName && (
        <motion.div
          initial={reducedMotion ? false : { scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={reducedMotion ? { duration: 0 } : undefined}
          className="mt-4 p-4 rounded-2xl bg-primary-500/20 border border-primary-500/50 text-center"
          role="status"
          aria-live="assertive"
          data-testid="spin-bottle-result"
        >
          <p className="text-primary-300 font-bold text-xl">{targetName} 選真心話或大冒險！</p>
          <CopyResultButton text={`數位真心話瓶：${targetName} 被指到`} label="複製結果" className="mt-2 games-focus-ring" />
        </motion.div>
      )}
    </div>
  )
}
