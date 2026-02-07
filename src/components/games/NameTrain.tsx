'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

type OrderMode = 'list' | 'random'

/** 依序喊名字，錯或慢罰。順序可調（依名單／每輪隨機）、錯慢統計。P2 #62：玩家數≤5 時鍵盤 1–5 對應選第 N 位。 */
export default function NameTrain() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 3 ? contextPlayers : DEFAULT_PLAYERS
  const [orderMode, setOrderMode] = useState<OrderMode>('list')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1)
  const [wrong, setWrong] = useState(false)
  const [errorCount, setErrorCount] = useState(0)

  const currentPlayer = players[currentIndex]
  const correctNext = players[nextIndex]

  const getNextIndex = useMemo(() => {
    if (orderMode === 'list') {
      return (cur: number) => (cur + 1) % players.length
    }
    return (cur: number) => {
      let n = Math.floor(Math.random() * players.length)
      while (n === cur && players.length > 1) n = Math.floor(Math.random() * players.length)
      return n
    }
  }, [orderMode, players.length])

  const say = (saidIndex: number) => {
    if (saidIndex === nextIndex) {
      play('correct')
      setCurrentIndex(nextIndex)
      setNextIndex(getNextIndex(nextIndex))
      setWrong(false)
    } else {
      play('wrong')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
      setWrong(true)
      setErrorCount((c) => c + 1)
      if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current)
      wrongTimeoutRef.current = setTimeout(() => {
        wrongTimeoutRef.current = null
        setWrong(false)
      }, 2000)
    }
  }

  const wrongTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sayRef = useRef(say)
  sayRef.current = say
  useEffect(() => {
    return () => {
      if (wrongTimeoutRef.current) {
        clearTimeout(wrongTimeoutRef.current)
        wrongTimeoutRef.current = null
      }
    }
  }, [])
  useEffect(() => {
    if (!wrong) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setWrong(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [wrong])
  useEffect(() => {
    if (players.length > 5) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const key = e.key
      if (key >= '1' && key <= '5') {
        const idx = parseInt(key, 10) - 1
        if (idx < players.length) {
          e.preventDefault()
          sayRef.current(idx)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [players.length])

  const switchMode = (mode: OrderMode) => {
    setOrderMode(mode)
    setCurrentIndex(0)
    setNextIndex(mode === 'list' ? 1 : (() => {
      let n = Math.floor(Math.random() * players.length)
      while (n === 0 && players.length > 1) n = Math.floor(Math.random() * players.length)
      return n
    })())
    setWrong(false)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="名字接龍">
      <GameRules rules={`依玩家順序或每輪隨機，輪流喊「下一個人」的名字。\n喊錯或慢的人喝。`} />
      <p className="text-white/50 text-sm mb-2">輪流喊下一個人的名字，喊錯或慢的人喝</p>
      <div className="flex gap-2 mb-2" role="group" aria-label="順序模式">
        <button
          type="button"
          onClick={() => switchMode('list')}
          className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors games-focus-ring ${orderMode === 'list' ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
        >
          依名單順序
        </button>
        <button
          type="button"
          onClick={() => switchMode('random')}
          className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors games-focus-ring ${orderMode === 'random' ? 'bg-primary-500/80 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
        >
          每輪隨機
        </button>
      </div>
      <p className="text-white/60 text-sm mb-2" aria-live="polite">本局錯誤：{errorCount}</p>
      {players.length <= 5 && (
        <p className="text-white/40 text-xs mb-1">鍵盤 1–{players.length} 對應選第 N 位</p>
      )}
      <p className="text-white/70 text-lg mb-4">輪到 {currentPlayer}，要喊誰？</p>
      {wrong && (
        <motion.p
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-red-400 font-bold text-lg mb-4"
          aria-live="assertive"
        >
          喝！
        </motion.p>
      )}
      <div className="flex flex-wrap gap-2 justify-center">
        {players.map((name, i) => (
          <motion.button
            key={i}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => say(i)}
            className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-medium games-focus-ring"
            aria-label={`選 ${name}`}
          >
            {name}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
