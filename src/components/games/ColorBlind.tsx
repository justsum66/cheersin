'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { m } from 'framer-motion'
import { Palette, RefreshCw, Clock } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const COLORS = [
  { name: '紅色', color: '#EF4444', textColor: 'text-red-500' },
  { name: '藍色', color: '#3B82F6', textColor: 'text-blue-500' },
  { name: '綠色', color: '#22C55E', textColor: 'text-green-500' },
  { name: '黃色', color: '#EAB308', textColor: 'text-yellow-500' },
  { name: '紫色', color: '#A855F7', textColor: 'text-purple-500' },
  { name: '橘色', color: '#F97316', textColor: 'text-orange-500' },
]

/** GAME-087: Color-blind safe mode patterns */
const CB_PATTERNS = ['■', '●', '▲', '★', '◆', '♦'] as const

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']
const ROUND_TIME = 15
const QUESTIONS_PER_ROUND = 8

function generateQuestion(): { text: string; displayColor: string; correctAnswer: 'text' | 'color'; textIndex: number; colorIndex: number } {
  const textIndex = Math.floor(Math.random() * COLORS.length)
  let colorIndex = Math.floor(Math.random() * COLORS.length)
  // 50% 機率讓文字和顏色不同
  if (Math.random() > 0.3) {
    while (colorIndex === textIndex) {
      colorIndex = Math.floor(Math.random() * COLORS.length)
    }
  }
  
  const askForColor = Math.random() > 0.5
  
  return {
    text: COLORS[textIndex].name,
    displayColor: COLORS[colorIndex].color,
    correctAnswer: askForColor ? 'color' : 'text',
    textIndex,
    colorIndex,
  }
}

export default function ColorBlind() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [gamePhase, setGamePhase] = useState<'ready' | 'playing' | 'result'>('ready')
  const [currentQuestion, setCurrentQuestion] = useState<ReturnType<typeof generateQuestion> | null>(null)
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME)
  const [questionCount, setQuestionCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [score, setScore] = useState<Record<number, number>>({})
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  /** GAME-087: Color-blind safe mode */
  const [cbSafeMode, setCbSafeMode] = useState(false)
  /** GAME-088: Progressive difficulty - reduce time each round */
  const [roundNumber, setRoundNumber] = useState(0)

  const startRound = useCallback(() => {
    setCurrentQuestion(generateQuestion())
    setGamePhase('playing')
    /** GAME-088: Progressive difficulty - shorter timer each round */
    const adjustedTime = Math.max(8, ROUND_TIME - roundNumber * 2)
    setTimeLeft(adjustedTime)
    setQuestionCount(0)
    setCorrectCount(0)
    play('click')

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setGamePhase('result')
          return 0
        }
        return t - 1
      })
    }, 1000)
  }, [play, roundNumber])

  const handleAnswer = useCallback((colorName: string) => {
    if (!currentQuestion) return
    
    const correctColorName = currentQuestion.correctAnswer === 'color' 
      ? COLORS[currentQuestion.colorIndex].name 
      : COLORS[currentQuestion.textIndex].name
    
    const isCorrect = colorName === correctColorName
    
    if (isCorrect) {
      play('correct')
      setCorrectCount(c => c + 1)
    } else {
      play('wrong')
    }
    
    setQuestionCount(c => c + 1)
    
    if (questionCount + 1 >= QUESTIONS_PER_ROUND) {
      if (timerRef.current) clearInterval(timerRef.current)
      setScore(prev => ({
        ...prev,
        [currentPlayerIndex]: (prev[currentPlayerIndex] || 0) + (isCorrect ? correctCount + 1 : correctCount)
      }))
      setGamePhase('result')
    } else {
      setCurrentQuestion(generateQuestion())
    }
  }, [currentQuestion, questionCount, correctCount, currentPlayerIndex, play])

  const nextRound = useCallback(() => {
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    setCurrentQuestion(null)
    setGamePhase('ready')
    setTimeLeft(ROUND_TIME)
    setQuestionCount(0)
    setCorrectCount(0)
    setRoundNumber(r => r + 1)
  }, [players.length])

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setCurrentPlayerIndex(0)
    setCurrentQuestion(null)
    setGamePhase('ready')
    setTimeLeft(ROUND_TIME)
    setQuestionCount(0)
    setCorrectCount(0)
    setScore({})
    setRoundNumber(0)
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
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="色盲測試">
      <GameRules
        rules="看文字，選擇正確的顏色！\n題目會問「這是什麼顏色？」或「字寫什麼？」\n答錯喝酒！"
        rulesKey="color-blind.rules"
      />

      <div className="flex items-center gap-3 mb-3">
        <Palette className="w-12 h-12 text-purple-400" />
        {/* GAME-087: Color-blind safe mode toggle */}
        <button
          type="button"
          onClick={() => setCbSafeMode(v => !v)}
          className={`text-xs px-3 py-1.5 rounded-lg games-focus-ring transition-colors ${cbSafeMode ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white/50 border border-white/10'}`}
          aria-pressed={cbSafeMode}
        >
          {cbSafeMode ? '色盲模式 ON' : '色盲友善'}
        </button>
      </div>

      {gamePhase === 'ready' && (
        <div className="text-center w-full max-w-md">
          <p className="text-white/60 mb-2">挑戰者是</p>
          <p className="text-2xl font-bold text-purple-400 mb-4">{currentPlayer}</p>
          <button
            type="button"
            onClick={startRound}
            className="btn-primary px-8 py-3 text-lg games-focus-ring bg-gradient-to-r from-purple-500 to-pink-500"
          >
            開始測試！
          </button>
        </div>
      )}

      {gamePhase === 'playing' && currentQuestion && (
        <div className="text-center w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${timeLeft <= 5 ? 'text-red-400' : 'text-amber-400'}`} />
              <span className={`font-bold text-xl tabular-nums ${timeLeft <= 5 ? 'text-red-400' : 'text-amber-400'}`}>
                {timeLeft}
              </span>
            </div>
            <div className="text-white/60">
              {questionCount + 1} / {QUESTIONS_PER_ROUND} | 答對：<span className="text-green-400 font-bold">{correctCount}</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-8 mb-4">
            <p className="text-white/60 text-sm mb-4">
              {currentQuestion.correctAnswer === 'color' ? '這個字是什麼「顏色」？' : '這個字「寫什麼」？'}
            </p>
            <m.p
              key={questionCount}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-5xl font-bold"
              style={{ color: currentQuestion.displayColor }}
            >
              {currentQuestion.text}
            </m.p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {COLORS.map((c, i) => (
              <button
                key={c.name}
                type="button"
                onClick={() => handleAnswer(c.name)}
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white games-focus-ring hover:bg-white/20 min-h-[48px]"
              >
                <span className={c.textColor}>{cbSafeMode ? `${CB_PATTERNS[i]} ${c.name}` : c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {gamePhase === 'result' && (
        <m.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center w-full max-w-md"
        >
          <p className="text-white/60 mb-2">結果：</p>
          <p className="text-4xl font-bold text-purple-400 mb-2">{correctCount} / {QUESTIONS_PER_ROUND}</p>
          <p className="text-white/70 mb-4">答對</p>

          {correctCount < 4 ? (
            <p className="text-red-400 font-bold text-xl mb-4">{currentPlayer} 喝兩杯！</p>
          ) : correctCount < 6 ? (
            <p className="text-amber-400 font-bold text-xl mb-4">{currentPlayer} 喝一杯！</p>
          ) : (
            <p className="text-green-400 font-bold text-xl mb-4">眼力真好！{currentPlayer} 免喝！</p>
          )}

          <div className="flex gap-3 justify-center">
            <button type="button" onClick={nextRound} className="btn-primary px-6 py-2 games-focus-ring">
              下一位
            </button>
            <CopyResultButton
              text={`色盲測試：\n${currentPlayer} 答對 ${correctCount}/${QUESTIONS_PER_ROUND} 題`}
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
