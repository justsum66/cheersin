'use client'

import { useState, useEffect, useRef } from 'react'
import { useGameReduceMotion } from './GameWrapper'
import { m , AnimatePresence } from 'framer-motion'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { DrinkingAnimation } from './DrinkingAnimation'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2']
const CHOICES = ['剪刀', '石頭', '布'] as const
const EMOJI: Record<string, string> = { 剪刀: '✌️', 石頭: '✊', 布: '🖐️' }
const WIN: Record<string, string> = { 剪刀: '布', 石頭: '剪刀', 布: '石頭' }

/** 猜拳：出拳動畫、平手再來一次、結果複製與 aria-live 朗讀。 */
export default function FingerGuessing() {
  const contextPlayers = useGamesPlayers()
  const { play: playSound } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [p1Choice, setP1Choice] = useState<(typeof CHOICES)[number] | null>(null)
  const [p2Choice, setP2Choice] = useState<(typeof CHOICES)[number] | null>(null)
  const [result, setResult] = useState<string | null>(null)
  /** G1.14 連勝機制：P1 連贏次數（平手不重置、P1 輸則歸零） */
  const [winStreak, setWinStreak] = useState(0)
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reducedMotion = useGameReduceMotion()

  const handlePlay = (choice: (typeof CHOICES)[number]) => {
    playSound('click')
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current)
    const c2 = CHOICES[Math.floor(Math.random() * 3)]
    setP1Choice(choice)
    setP2Choice(c2)
    if (choice === c2) {
      playSound('correct')
      setResult('平手')
    } else if (WIN[choice] === c2) {
      playSound('win')
      setResult(`${players[0]} 贏，${players[1]} 喝！`)
      setWinStreak((s) => s + 1)
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
    } else {
      playSound('wrong')
      setWinStreak(0)
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
      setResult(`${players[1]} 贏，${players[0]} 喝！`)
    }
    resetTimeoutRef.current = setTimeout(() => {
      resetTimeoutRef.current = null
      setP1Choice(null)
      setP2Choice(null)
      setResult(null)
    }, 3200)
  }

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current)
        resetTimeoutRef.current = null
      }
    }
  }, [])

  const isDraw = result === '平手'

  useEffect(() => {
    if (!result) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setP1Choice(null)
        setP2Choice(null)
        setResult(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [result])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="猜拳">
      <GameRules rules={`剪刀贏布、布贏石頭、石頭贏剪刀。\n此處為玩家 vs 隨機，輸的人喝；平手可再來。`} />
      <p className="text-white/50 text-sm mb-2">猜拳，輸的人喝（{players[0]} vs {players[1]}）</p>
      {winStreak > 0 && (
        <p className="text-amber-400 text-sm font-medium mb-1" aria-live="polite">
          {players[0]} 連勝 {winStreak} 場{winStreak >= 3 ? ' 🔥' : ''}
        </p>
      )}
      <AnimatePresence mode="wait">
        {p1Choice !== null && p2Choice !== null && (
          <m.div
            key={`${p1Choice}-${p2Choice}`}
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 350, damping: 25 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex gap-6 mb-4 items-center"
            role="status"
            aria-live="polite"
          >
            {/* Phase 1 C1.3: 增強手勢動畫 - 搭配旋轉效果 */}
            <m.span
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={reducedMotion ? { duration: 0.1 } : { delay: 0.1, type: 'spring', stiffness: 400, damping: 20 }}
              className="px-4 py-3 rounded-xl bg-white/10 text-white font-medium border border-white/20"
            >
              {players[0]}：<span className="inline-block text-3xl ml-1">{EMOJI[p1Choice]}</span> {p1Choice}
            </m.span>
            <span className="text-white/50 text-xl">vs</span>
            <m.span
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={reducedMotion ? { duration: 0.1 } : { delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
              className="px-4 py-3 rounded-xl bg-white/10 text-white font-medium border border-white/20"
            >
              {players[1]}：<span className="inline-block text-3xl ml-1">{EMOJI[p2Choice]}</span> {p2Choice}
            </m.span>
          </m.div>
        )}
      </AnimatePresence>
      {result && (
        <m.div
          initial={{ scale: 0.8, opacity: 0, y: -20 }}
          animate={{ 
            scale: [0.8, 1.1, 1],
            opacity: 1,
            y: 0
          }}
          transition={reducedMotion ? { duration: 0.12 } : { 
            duration: 0.5,
            times: [0, 0.6, 1],
            ease: [0.68, -0.55, 0.265, 1.55]
          }}
          className="text-center mb-4"
        >
          {/* Phase 1 C2.3: 勝利慶祝序列動畫 */}
          <m.div
            animate={!isDraw ? {
              boxShadow: [
                '0 0 0px rgba(139, 0, 0, 0)',
                '0 0 20px rgba(139, 0, 0, 0.6)',
                '0 0 40px rgba(212, 175, 55, 0.4)',
                '0 0 0px rgba(139, 0, 0, 0)'
              ]
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-500/20 to-accent-500/20 border-2 border-primary-500/50 mb-2"
          >
            <p className="text-primary-300 font-bold text-lg" aria-live="polite" aria-atomic="true">
              {result}
            </p>
          </m.div>
          <span className="sr-only" aria-live="polite">{result}</span>
          {!isDraw && !reducedMotion && <DrinkingAnimation duration={1.2} className="my-3 mx-auto" />}
          {!isDraw && <CopyResultButton text={`猜拳：${result}`} className="mt-1 games-focus-ring" />}
          {isDraw && (
            <p className="text-white/60 text-sm">再選一次</p>
          )}
        </m.div>
      )}
      <div className="flex gap-3">
        {CHOICES.map((c, idx) => (
          <m.button
            key={c}
            type="button"
            whileTap={{ scale: 0.9, rotate: [0, -5, 5, 0] }}
            whileHover={{ scale: 1.05, y: -4 }}
            transition={{ duration: 0.2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => handlePlay(c)}
            className="min-h-[48px] min-w-[80px] px-4 py-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:bg-white/20 hover:border-white/30 text-white font-bold games-focus-ring shadow-lg"
            aria-label={`出 ${c}`}
            style={{ transitionDelay: `${idx * 0.05}s` }}
          >
            <span className="block text-2xl mb-1">{EMOJI[c]}</span>
            <span className="text-sm">{c}</span>
          </m.button>
        ))}
      </div>
    </div>
  )
}
