'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Search, RefreshCw, Clock } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const EMOJI_SETS = [
  { emojis: '🍎🍎🍎🍊🍎🍎🍎🍎🍎', diff: '🍊', answer: '橘子' },
  { emojis: '😀😀😀😀😃😀😀😀😀', diff: '😃', answer: '不同的笑臉' },
  { emojis: '🐶🐶🐶🐕🐶🐶🐶🐶🐶', diff: '🐕', answer: '狗狗剪影' },
  { emojis: '❤️❤️❤️❤️💗❤️❤️❤️❤️', diff: '💗', answer: '粉紅愛心' },
  { emojis: '⭐⭐⭐⭐⭐🌟⭐⭐⭐', diff: '🌟', answer: '閃亮星星' },
  { emojis: '🌙🌙🌙🌙🌙🌛🌙🌙🌙', diff: '🌛', answer: '帶臉月亮' },
  { emojis: '🔵🔵🔵🔵🔵🔷🔵🔵🔵', diff: '🔷', answer: '藍色菱形' },
  { emojis: '🟢🟢🟢🟢🟢🟩🟢🟢🟢', diff: '🟩', answer: '綠色方塊' },
]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']
const ROUND_TIME = 10

export default function SpotDiff() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState<typeof EMOJI_SETS[0] | null>(null)
  const [usedSets, setUsedSets] = useState<Set<number>>(new Set())
  const [gamePhase, setGamePhase] = useState<'ready' | 'playing' | 'result'>('ready')
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME)
  const [score, setScore] = useState<Record<number, number>>({})
  const [foundIt, setFoundIt] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getNextSet = useCallback(() => {
    const available = EMOJI_SETS.map((_, i) => i).filter(i => !usedSets.has(i))
    if (available.length === 0) {
      setUsedSets(new Set())
      return EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)]
    }
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsedSets(prev => new Set([...prev, idx]))
    return EMOJI_SETS[idx]
  }, [usedSets])

  const startRound = useCallback(() => {
    setCurrentSet(getNextSet())
    setGamePhase('playing')
    setTimeLeft(ROUND_TIME)
    setFoundIt(false)
    play('click')

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setGamePhase('result')
          return 0
        }
        if (t <= 3) play('click')
        return t - 1
      })
    }, 1000)
  }, [getNextSet, play])

  const handleFound = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    play('correct')
    setFoundIt(true)
    setScore(prev => ({
      ...prev,
      [currentPlayerIndex]: (prev[currentPlayerIndex] || 0) + timeLeft
    }))
    setGamePhase('result')
  }, [currentPlayerIndex, timeLeft, play])

  const handleGiveUp = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    play('wrong')
    setGamePhase('result')
  }, [play])

  const nextRound = useCallback(() => {
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    setCurrentSet(null)
    setGamePhase('ready')
    setTimeLeft(ROUND_TIME)
    setFoundIt(false)
  }, [players.length])

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setCurrentPlayerIndex(0)
    setCurrentSet(null)
    setUsedSets(new Set())
    setGamePhase('ready')
    setTimeLeft(ROUND_TIME)
    setScore({})
    setFoundIt(false)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const currentPlayer = players[currentPlayerIndex]
  const leaderboard = Object.entries(score)
    .map(([i, s]) => ({ name: players[Number(i)], score: s }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="大家來找碴">
      <GameRules
        rules="找出不一樣的那個！\n越快找到分數越高！找不到喝酒！"
        rulesKey="spot-diff.rules"
      />

      <Search className="w-12 h-12 text-amber-400 mb-4" />

      {gamePhase === 'ready' && (
        <div className="text-center w-full max-w-md">
          <p className="text-white/60 mb-2">挑戰者是</p>
          <p className="text-2xl font-bold text-amber-400 mb-4">{currentPlayer}</p>
          <button
            type="button"
            onClick={startRound}
            className="btn-primary px-8 py-3 text-lg games-focus-ring bg-gradient-to-r from-amber-500 to-orange-500"
          >
            開始找碴！
          </button>
        </div>
      )}

      {gamePhase === 'playing' && currentSet && (
        <div className="text-center w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className={`w-5 h-5 ${timeLeft <= 3 ? 'text-red-400' : 'text-amber-400'}`} />
            <span className={`font-bold text-2xl tabular-nums ${timeLeft <= 3 ? 'text-red-400' : 'text-amber-400'}`}>
              {timeLeft}
            </span>
          </div>

          <m.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 rounded-2xl p-6 mb-6"
          >
            <p className="text-5xl leading-relaxed tracking-wider">
              {currentSet.emojis}
            </p>
          </m.div>

          <p className="text-white/60 mb-4">找出不一樣的那個！</p>

          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={handleFound}
              className="px-8 py-3 rounded-xl bg-green-500/20 border border-green-500/50 text-green-400 games-focus-ring min-h-[48px]"
            >
              找到了！
            </button>
            <button
              type="button"
              onClick={handleGiveUp}
              className="px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 games-focus-ring min-h-[48px]"
            >
              放棄
            </button>
          </div>
        </div>
      )}

      {gamePhase === 'result' && currentSet && (
        <m.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center w-full max-w-md"
        >
          <p className="text-white/60 mb-2">答案是：</p>
          <p className="text-4xl mb-2">{currentSet.diff}</p>
          <p className="text-white/70 mb-4">{currentSet.answer}</p>

          {foundIt ? (
            <p className="text-green-400 font-bold text-xl mb-4">找到了！得 {timeLeft} 分！</p>
          ) : (
            <p className="text-red-400 font-bold text-xl mb-4">{currentPlayer} 喝一杯！</p>
          )}

          <div className="flex gap-3 justify-center">
            <button type="button" onClick={nextRound} className="btn-primary px-6 py-2 games-focus-ring">
              下一輪
            </button>
            <CopyResultButton
              text={`大家來找碴：\n${currentPlayer} ${foundIt ? `找到了！得 ${timeLeft} 分` : '沒找到，喝酒！'}`}
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
