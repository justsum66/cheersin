'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { m } from 'framer-motion'
import { Ban, RefreshCw, Check, X, Timer } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const TABOO_WORDS = [
  { word: '蘋果', taboo: ['水果', '紅色', '手機', 'iPhone'] },
  { word: '電腦', taboo: ['打字', '上網', '螢幕', '鍵盤'] },
  { word: '太陽', taboo: ['熱', '光', '天空', '早上'] },
  { word: '醫院', taboo: ['醫生', '病人', '看病', '護士'] },
  { word: '學校', taboo: ['學生', '老師', '上課', '教室'] },
  { word: '飛機', taboo: ['天上', '飛', '機場', '旅行'] },
  { word: '電影', taboo: ['看', '電影院', '明星', '票'] },
  { word: '籃球', taboo: ['投籃', 'NBA', '運動', '打'] },
  { word: '咖啡', taboo: ['喝', '苦', '星巴克', '提神'] },
  { word: '海邊', taboo: ['沙灘', '游泳', '海水', '夏天'] },
  { word: '生日', taboo: ['蛋糕', '禮物', '派對', '蠟燭'] },
  { word: '婚禮', taboo: ['結婚', '新娘', '新郎', '戒指'] },
  { word: '聖誕節', taboo: ['聖誕老人', '禮物', '樹', '12月'] },
  { word: '動物園', taboo: ['動物', '獅子', '大象', '看'] },
  { word: '超市', taboo: ['買', '東西', '購物車', '付錢'] },
]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']
const ROUND_TIME = 60

export default function Taboo() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [describerIndex, setDescriberIndex] = useState(0)
  const [currentWord, setCurrentWord] = useState<typeof TABOO_WORDS[0] | null>(null)
  const [usedWords, setUsedWords] = useState<Set<number>>(new Set())
  const [gamePhase, setGamePhase] = useState<'ready' | 'playing' | 'result'>('ready')
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME)
  const [roundScore, setRoundScore] = useState(0)
  const [totalScore, setTotalScore] = useState<Record<number, number>>({})
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getNextWord = useCallback(() => {
    const available = TABOO_WORDS.map((_, i) => i).filter(i => !usedWords.has(i))
    if (available.length === 0) {
      setUsedWords(new Set())
      return TABOO_WORDS[Math.floor(Math.random() * TABOO_WORDS.length)]
    }
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsedWords(prev => new Set([...prev, idx]))
    return TABOO_WORDS[idx]
  }, [usedWords])

  const startRound = useCallback(() => {
    setCurrentWord(getNextWord())
    setGamePhase('playing')
    setTimeLeft(ROUND_TIME)
    setRoundScore(0)
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
    play('correct')
    setRoundScore(s => s + 1)
    setCurrentWord(getNextWord())
  }, [getNextWord, play])

  const handleSkip = useCallback(() => {
    play('click')
    setCurrentWord(getNextWord())
  }, [getNextWord, play])

  const handleTaboo = useCallback(() => {
    play('wrong')
    setRoundScore(s => Math.max(0, s - 1))
    setCurrentWord(getNextWord())
  }, [getNextWord, play])

  const endRound = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTotalScore(prev => ({
      ...prev,
      [describerIndex]: (prev[describerIndex] || 0) + roundScore
    }))
    setGamePhase('result')
  }, [describerIndex, roundScore])

  const nextRound = useCallback(() => {
    setDescriberIndex((i) => (i + 1) % players.length)
    setCurrentWord(null)
    setGamePhase('ready')
    setTimeLeft(ROUND_TIME)
    setRoundScore(0)
  }, [players.length])

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setDescriberIndex(0)
    setCurrentWord(null)
    setUsedWords(new Set())
    setGamePhase('ready')
    setTimeLeft(ROUND_TIME)
    setRoundScore(0)
    setTotalScore({})
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const describer = players[describerIndex]
  const leaderboard = Object.entries(totalScore)
    .map(([i, s]) => ({ name: players[Number(i)], score: s }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="禁語猜詞">
      <GameRules
        rules="描述詞語讓別人猜，但不能說禁語！\n說到禁語扣 1 分！時間內盡量多猜！\n最低分喝酒！"
        rulesKey="taboo.rules"
      />

      <Ban className="w-12 h-12 text-red-400 mb-4" />

      {gamePhase === 'ready' && (
        <div className="text-center w-full max-w-md">
          <p className="text-white/60 mb-2">這輪的描述者是</p>
          <p className="text-2xl font-bold text-red-400 mb-4">{describer}</p>
          <button
            type="button"
            onClick={startRound}
            className="btn-primary px-8 py-3 text-lg games-focus-ring bg-gradient-to-r from-red-500 to-orange-500"
          >
            開始描述！
          </button>
        </div>
      )}

      {gamePhase === 'playing' && currentWord && (
        <div className="text-center w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Timer className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-400' : 'text-amber-400'}`} />
              <span className={`font-bold text-xl tabular-nums ${timeLeft <= 10 ? 'text-red-400' : 'text-amber-400'}`}>
                {timeLeft}
              </span>
            </div>
            <div className="text-white/60">
              本輪得分：<span className="text-green-400 font-bold">{roundScore}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-900/40 to-orange-900/40 rounded-2xl p-6 mb-4 border border-red-500/30">
            <p className="text-3xl font-bold text-white mb-4">{currentWord.word}</p>
            <p className="text-white/50 text-sm mb-2">禁語：</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {currentWord.taboo.map((t, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-red-500/30 text-red-300 text-sm">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            <button
              type="button"
              onClick={handleCorrect}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500/20 border border-green-500/50 text-green-400 games-focus-ring min-h-[48px]"
            >
              <Check className="w-5 h-5" /> 猜對 +1
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 games-focus-ring min-h-[48px]"
            >
              跳過
            </button>
            <button
              type="button"
              onClick={handleTaboo}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 games-focus-ring min-h-[48px]"
            >
              <Ban className="w-5 h-5" /> 說禁語 -1
            </button>
          </div>

          <button
            type="button"
            onClick={endRound}
            className="mt-4 text-white/40 text-sm hover:text-white/60"
          >
            提前結束
          </button>
        </div>
      )}

      {gamePhase === 'result' && (
        <m.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center w-full max-w-md"
        >
          <p className="text-white/60 mb-2">時間到！</p>
          <p className="text-2xl font-bold text-white mb-2">{describer} 本輪得分</p>
          <p className="text-4xl font-bold text-green-400 mb-4">{roundScore} 分</p>

          {roundScore === 0 && (
            <p className="text-red-400 mb-4">{describer} 喝一杯！</p>
          )}

          <div className="flex gap-3 justify-center">
            <button type="button" onClick={nextRound} className="btn-primary px-6 py-2 games-focus-ring">
              下一輪
            </button>
            <CopyResultButton
              text={`禁語猜詞：\n描述者：${describer}\n得分：${roundScore} 分`}
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
