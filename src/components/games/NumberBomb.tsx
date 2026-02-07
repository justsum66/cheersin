'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bomb, ArrowUp, ArrowDown, RotateCcw, Minus, Plus } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameReduceMotion } from './GameWrapper'
import CopyResultButton from './CopyResultButton'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

/** G1.1-G1.2：數字炸彈遊戲 - 猜數字，猜中炸彈的人喝 */
export default function NumberBomb() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const reducedMotion = useGameReduceMotion()

  // 遊戲狀態
  const [bombNumber, setBombNumber] = useState(() => Math.floor(Math.random() * 100) + 1)
  const [minRange, setMinRange] = useState(1)
  const [maxRange, setMaxRange] = useState(100)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [guess, setGuess] = useState(50)
  const [explosion, setExplosion] = useState(false)
  const [loser, setLoser] = useState<string | null>(null)
  const [hint, setHint] = useState<'bigger' | 'smaller' | null>(null)
  const [guessHistory, setGuessHistory] = useState<{ player: string; guess: number; hint: 'bigger' | 'smaller' }[]>([])
  
  const loserClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentPlayer = players[currentPlayerIndex]

  // 重置遊戲
  const resetGame = useCallback(() => {
    const newBomb = Math.floor(Math.random() * 100) + 1
    setBombNumber(newBomb)
    setMinRange(1)
    setMaxRange(100)
    setCurrentPlayerIndex(0)
    setGuess(50)
    setExplosion(false)
    setLoser(null)
    setHint(null)
    setGuessHistory([])
  }, [])

  // 提交猜測
  const submitGuess = useCallback(() => {
    if (guess < minRange || guess > maxRange) return
    play('click')

    if (guess === bombNumber) {
      // 猜中炸彈！
      setLoser(currentPlayer)
      setExplosion(!reducedMotion)
      play('wrong')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 300])
      
      if (loserClearTimeoutRef.current) clearTimeout(loserClearTimeoutRef.current)
      loserClearTimeoutRef.current = setTimeout(() => {
        loserClearTimeoutRef.current = null
        setExplosion(false)
      }, 3000)
    } else {
      // 繼續遊戲
      const newHint: 'bigger' | 'smaller' = guess < bombNumber ? 'bigger' : 'smaller'
      setHint(newHint)
      setGuessHistory(prev => [...prev, { player: currentPlayer, guess, hint: newHint }])
      
      if (newHint === 'bigger') {
        setMinRange(guess + 1)
        setGuess(Math.floor((guess + 1 + maxRange) / 2))
      } else {
        setMaxRange(guess - 1)
        setGuess(Math.floor((minRange + guess - 1) / 2))
      }
      
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length)
      play('correct')
    }
  }, [guess, bombNumber, minRange, maxRange, currentPlayer, currentPlayerIndex, players.length, play, reducedMotion])

  // 調整猜測數字
  const adjustGuess = useCallback((delta: number) => {
    setGuess(prev => {
      const next = prev + delta
      if (next < minRange) return minRange
      if (next > maxRange) return maxRange
      return next
    })
    play('click')
  }, [minRange, maxRange, play])

  // 鍵盤控制
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || loser) return
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        adjustGuess(1)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        adjustGuess(-1)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        submitGuess()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [adjustGuess, submitGuess, loser])

  // 清理
  useEffect(() => {
    return () => {
      if (loserClearTimeoutRef.current) {
        clearTimeout(loserClearTimeoutRef.current)
        loserClearTimeoutRef.current = null
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="數字炸彈遊戲">
      <GameRules rules={`1～100 之間藏著一個炸彈數字。\n輪流猜測，每次會縮小範圍，猜中炸彈的人喝！\n鍵盤 ↑↓ 調整數字，Enter 確認。`} />
      
      {/* 範圍顯示 */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-2xl md:text-3xl font-mono font-bold text-emerald-400">{minRange}</span>
        <span className="text-white/50 text-lg">～</span>
        <span className="text-2xl md:text-3xl font-mono font-bold text-red-400">{maxRange}</span>
      </div>
      
      {/* 提示 */}
      <AnimatePresence mode="wait">
        {hint && !loser && (
          <motion.div
            key={hint}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-full ${
              hint === 'bigger' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {hint === 'bigger' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
            <span className="font-bold">{hint === 'bigger' ? '太小了！往上猜' : '太大了！往下猜'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 輪到誰 */}
      {!loser && (
        <p className="text-white/70 text-lg mb-4">
          輪到 <span className="text-primary-400 font-bold">{currentPlayer}</span>
        </p>
      )}

      {/* 爆炸動畫 */}
      <AnimatePresence>
        {explosion && (
          <motion.div
            key="explosion"
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.8 }}
            className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
            aria-hidden
          >
            <div className="w-64 h-64 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 blur-3xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 輸家顯示 */}
      {loser && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4 mb-6"
          role="alert"
          aria-live="assertive"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: reducedMotion ? 0 : 2 }}
          >
            <Bomb className="w-16 h-16 text-red-500" />
          </motion.div>
          <p className="text-red-400 font-bold text-2xl md:text-3xl">💥 {loser} 踩到炸彈！喝！</p>
          <p className="text-white/50 text-sm">炸彈數字是 {bombNumber}</p>
          <CopyResultButton text={`數字炸彈：${loser} 踩到 ${bombNumber}，喝！`} />
          <button
            type="button"
            onClick={resetGame}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold transition-colors games-focus-ring"
          >
            <RotateCcw className="w-5 h-5" />
            再玩一局
          </button>
        </motion.div>
      )}

      {/* 猜測控制 */}
      {!loser && (
        <div className="flex flex-col items-center gap-4">
          {/* 數字調整器 */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => adjustGuess(-10)}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors games-focus-ring"
              aria-label="減 10"
            >
              <Minus className="w-5 h-5" />
              <span className="text-xs">10</span>
            </button>
            <button
              type="button"
              onClick={() => adjustGuess(-1)}
              className="p-4 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors games-focus-ring"
              aria-label="減 1"
            >
              <Minus className="w-6 h-6" />
            </button>
            
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-white/20 flex items-center justify-center">
              <span className="text-4xl font-mono font-bold text-white">{guess}</span>
            </div>
            
            <button
              type="button"
              onClick={() => adjustGuess(1)}
              className="p-4 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors games-focus-ring"
              aria-label="加 1"
            >
              <Plus className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => adjustGuess(10)}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors games-focus-ring"
              aria-label="加 10"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">10</span>
            </button>
          </div>

          {/* 確認按鈕 */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={submitGuess}
            className="flex items-center gap-2 min-h-[56px] px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-bold text-xl shadow-lg games-focus-ring"
            aria-label={`猜 ${guess}`}
          >
            <Bomb className="w-6 h-6" />
            猜 {guess}
          </motion.button>
          
          <p className="text-white/40 text-sm">鍵盤 ↑↓ 調整，Enter 確認</p>
        </div>
      )}

      {/* 猜測歷史 */}
      {guessHistory.length > 0 && (
        <div className="mt-6 w-full max-w-sm">
          <h3 className="text-white/50 text-sm mb-2">猜測紀錄</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {guessHistory.slice(-8).map((h, i) => (
              <div
                key={i}
                className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
                  h.hint === 'bigger' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                <span className="text-white/70">{h.player}</span>
                <span className="font-mono font-bold">{h.guess}</span>
                {h.hint === 'bigger' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
