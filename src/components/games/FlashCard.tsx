'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, Clock } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const FLASH_ITEMS = [
  ['🍎', '🍊', '🍋', '🍇', '🍓'],
  ['🐶', '🐱', '🐭', '🐹', '🐰'],
  ['❤️', '💛', '💚', '💙', '💜'],
  ['⭐', '🌙', '☀️', '⚡', '🌈'],
  ['🚗', '🚕', '🚙', '🚌', '🚎'],
  ['🎸', '🎹', '🎺', '🎷', '🎻'],
  ['⚽', '🏀', '🏈', '⚾', '🎾'],
  ['🍔', '🍟', '🍕', '🌭', '🍿'],
]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

export default function FlashCard() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [gamePhase, setGamePhase] = useState<'ready' | 'showing' | 'recall' | 'result'>('ready')
  const [flashItems, setFlashItems] = useState<string[]>([])
  const [showCount, setShowCount] = useState(3)
  const [userGuess, setUserGuess] = useState('')
  const [score, setScore] = useState<Record<number, number>>({})
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startFlash = useCallback(() => {
    const itemSet = FLASH_ITEMS[Math.floor(Math.random() * FLASH_ITEMS.length)]
    const shuffled = [...itemSet].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, showCount)
    setFlashItems(selected)
    setGamePhase('showing')
    setCountdown(3)
    play('click')

    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setGamePhase('recall')
          return 0
        }
        return c - 1
      })
    }, 1000)
  }, [showCount, play])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const checkAnswer = useCallback(() => {
    const guessItems = userGuess.split('').filter(c => /\p{Emoji}/u.test(c))
    const correctCount = flashItems.filter(item => guessItems.includes(item)).length
    const isCorrect = correctCount === flashItems.length

    if (isCorrect) {
      play('correct')
      setScore(prev => ({ ...prev, [currentPlayerIndex]: (prev[currentPlayerIndex] || 0) + showCount }))
    } else {
      play('wrong')
    }
    setGamePhase('result')
  }, [userGuess, flashItems, currentPlayerIndex, showCount, play])

  const nextPlayer = useCallback(() => {
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    setGamePhase('ready')
    setUserGuess('')
    setFlashItems([])
  }, [players.length])

  const resetGame = useCallback(() => {
    setCurrentPlayerIndex(0)
    setGamePhase('ready')
    setFlashItems([])
    setUserGuess('')
    setScore({})
    setShowCount(3)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const currentPlayer = players[currentPlayerIndex]
  const leaderboard = Object.entries(score)
    .map(([i, s]) => ({ name: players[Number(i)], score: s }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="閃卡記憶">
      <GameRules
        rules="快速記住閃過的圖案！\n3 秒內記住所有圖案，然後輸入答案！\n答錯喝酒！"
        rulesKey="flash-card.rules"
      />

      <Sparkles className="w-12 h-12 text-primary-400 mb-4" />

      {gamePhase === 'ready' && (
        <div className="text-center w-full max-w-md">
          <p className="text-white/70 mb-2">
            挑戰者：<span className="text-primary-400 font-medium">{currentPlayer}</span>
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-white/60">難度：</span>
            {[3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setShowCount(n)}
                className={`px-4 py-2 rounded-lg games-focus-ring min-h-[48px] ${
                  showCount === n ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
                }`}
              >
                {n} 個
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={startFlash}
            className="btn-primary px-8 py-3 text-lg games-focus-ring"
          >
            開始閃卡！
          </button>
        </div>
      )}

      {gamePhase === 'showing' && (
        <AnimatePresence>
          <m.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-bold text-2xl">{countdown}</span>
            </div>
            <div className="flex gap-4 justify-center text-6xl p-8 bg-white/10 rounded-2xl">
              {flashItems.map((item, i) => (
                <m.span
                  key={i}
                  initial={reducedMotion ? false : { opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {item}
                </m.span>
              ))}
            </div>
            <p className="text-white/50 mt-4">快速記住這些圖案！</p>
          </m.div>
        </AnimatePresence>
      )}

      {gamePhase === 'recall' && (
        <div className="text-center w-full max-w-md">
          <p className="text-white/70 mb-4">輸入你記得的圖案（用 Emoji）</p>
          <input
            type="text"
            value={userGuess}
            onChange={e => setUserGuess(e.target.value)}
            placeholder="在這裡輸入 Emoji..."
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-2xl text-center games-focus-ring mb-4"
            autoFocus
          />
          <button
            type="button"
            onClick={checkAnswer}
            className="btn-primary px-8 py-3 games-focus-ring"
          >
            確認答案
          </button>
        </div>
      )}

      {gamePhase === 'result' && (
        <m.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center w-full max-w-md"
        >
          <p className="text-white/60 mb-2">正確答案：</p>
          <div className="text-4xl mb-4">{flashItems.join(' ')}</div>
          
          {flashItems.every(item => userGuess.includes(item)) ? (
            <p className="text-green-400 font-bold text-xl mb-4">答對了！得 {showCount} 分！</p>
          ) : (
            <p className="text-red-400 font-bold text-xl mb-4">{currentPlayer} 喝一杯！</p>
          )}

          <div className="flex gap-3 justify-center">
            <button type="button" onClick={nextPlayer} className="btn-primary px-6 py-2 games-focus-ring">
              下一位
            </button>
            <CopyResultButton
              text={`閃卡記憶：\n${currentPlayer} 的答案：${userGuess}\n正確答案：${flashItems.join(' ')}`}
              label="複製"
            />
          </div>
        </m.div>
      )}

      {leaderboard.length > 0 && (
        <div className="absolute bottom-4 left-4 text-white/30 text-xs">
          {leaderboard.slice(0, 3).map((p, i) => (
            <div key={i}>{p.name}: {p.score}分</div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={resetGame}
        className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring"
      >
        <RefreshCw className="w-5 h-5" />
      </button>
    </div>
  )
}
