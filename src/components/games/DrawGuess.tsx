'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, RefreshCw, Check, X, Timer, RotateCcw } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const WORDS = [
  // 動物
  '大象', '長頸鹿', '蝴蝶', '企鵝', '獅子', '熊貓', '兔子', '烏龜',
  // 食物
  '披薩', '漢堡', '壽司', '拉麵', '蛋糕', '冰淇淋', '薯條', '餃子',
  // 職業
  '醫生', '廚師', '警察', '老師', '司機', '歌手', '畫家', '科學家',
  // 動作
  '跳舞', '游泳', '睡覺', '跑步', '唱歌', '拍照', '打電話', '騎車',
  // 物品
  '電視', '冰箱', '雨傘', '鑰匙', '眼鏡', '手錶', '書包', '足球',
]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']
const ROUND_TIME = 60

export default function DrawGuess() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [drawerIndex, setDrawerIndex] = useState(0)
  const [currentWord, setCurrentWord] = useState<string | null>(null)
  const [usedWords, setUsedWords] = useState<Set<number>>(new Set())
  const [gamePhase, setGamePhase] = useState<'ready' | 'drawing' | 'result'>('ready')
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME)
  const [score, setScore] = useState<Record<number, number>>({})
  const [guessedCorrect, setGuessedCorrect] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getNextWord = useCallback(() => {
    const available = WORDS.map((_, i) => i).filter(i => !usedWords.has(i))
    if (available.length === 0) {
      setUsedWords(new Set())
      return WORDS[Math.floor(Math.random() * WORDS.length)]
    }
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsedWords(prev => new Set([...prev, idx]))
    return WORDS[idx]
  }, [usedWords])

  const startRound = useCallback(() => {
    setCurrentWord(getNextWord())
    setGamePhase('drawing')
    setTimeLeft(ROUND_TIME)
    setGuessedCorrect(false)
    play('click')

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setGamePhase('result')
          return 0
        }
        if (t <= 10) play('click')
        return t - 1
      })
    }, 1000)
  }, [getNextWord, play])

  const handleCorrect = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    play('correct')
    setGuessedCorrect(true)
    setScore(prev => ({ ...prev, [drawerIndex]: (prev[drawerIndex] || 0) + 1 }))
    setGamePhase('result')
  }, [drawerIndex, play])

  const handleGiveUp = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    play('wrong')
    setGamePhase('result')
  }, [play])

  const skipWord = useCallback(() => {
    setCurrentWord(getNextWord())
    play('click')
  }, [getNextWord, play])

  const nextRound = useCallback(() => {
    setDrawerIndex((i) => (i + 1) % players.length)
    setCurrentWord(null)
    setGamePhase('ready')
    setTimeLeft(ROUND_TIME)
    setGuessedCorrect(false)
  }, [players.length])

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setDrawerIndex(0)
    setCurrentWord(null)
    setUsedWords(new Set())
    setGamePhase('ready')
    setTimeLeft(ROUND_TIME)
    setScore({})
    setGuessedCorrect(false)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const drawer = players[drawerIndex]
  const leaderboard = Object.entries(score)
    .map(([i, s]) => ({ name: players[Number(i)], score: s }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="你畫我猜">
      <GameRules
        rules="一人畫圖，其他人猜！\n畫的人不能說話、不能寫字！\n時間內沒猜對，畫的人喝酒！"
        rulesKey="draw-guess.rules"
      />

      <Pencil className="w-12 h-12 text-accent-400 mb-4" />

      {gamePhase === 'ready' && (
        <div className="text-center w-full max-w-md">
          <p className="text-white/60 mb-2">這輪的畫家是</p>
          <p className="text-2xl font-bold text-accent-400 mb-4">{drawer}</p>
          <button
            type="button"
            onClick={startRound}
            className="btn-primary px-8 py-3 text-lg games-focus-ring bg-gradient-to-r from-accent-500 to-primary-500"
          >
            開始畫圖！
          </button>
        </div>
      )}

      {gamePhase === 'drawing' && (
        <div className="text-center w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Timer className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-400' : 'text-amber-400'}`} />
            <span className={`font-bold text-2xl tabular-nums ${timeLeft <= 10 ? 'text-red-400' : 'text-amber-400'}`}>
              {timeLeft}
            </span>
          </div>

          <div className="bg-gradient-to-br from-accent-900/40 to-primary-900/40 rounded-2xl p-6 mb-6 border border-accent-500/30">
            <p className="text-white/50 text-sm mb-2">（只有畫家能看）</p>
            <p className="text-4xl font-bold text-white">{currentWord}</p>
          </div>

          <p className="text-white/60 mb-4">
            <span className="text-accent-400 font-bold">{drawer}</span> 請開始畫！
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              type="button"
              onClick={handleCorrect}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/50 text-green-400 games-focus-ring min-h-[48px]"
            >
              <Check className="w-5 h-5" /> 猜對了！
            </button>
            <button
              type="button"
              onClick={skipWord}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 games-focus-ring min-h-[48px]"
            >
              <RotateCcw className="w-5 h-5" /> 換一個
            </button>
            <button
              type="button"
              onClick={handleGiveUp}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 games-focus-ring min-h-[48px]"
            >
              <X className="w-5 h-5" /> 放棄
            </button>
          </div>
        </div>
      )}

      {gamePhase === 'result' && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center w-full max-w-md"
        >
          <p className="text-white/60 mb-2">答案是：</p>
          <p className="text-3xl font-bold text-white mb-4">{currentWord}</p>

          {guessedCorrect ? (
            <p className="text-green-400 font-bold text-xl mb-4">猜對了！{drawer} 得 1 分！</p>
          ) : (
            <p className="text-red-400 font-bold text-xl mb-4">{drawer} 喝一杯！時間到或沒人猜對！</p>
          )}

          <div className="flex gap-3 justify-center">
            <button type="button" onClick={nextRound} className="btn-primary px-6 py-2 games-focus-ring">
              下一輪
            </button>
            <CopyResultButton
              text={`你畫我猜：\n畫家：${drawer}\n題目：${currentWord}\n結果：${guessedCorrect ? '猜對' : '沒猜對'}`}
              label="複製"
            />
          </div>
        </motion.div>
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
