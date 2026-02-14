'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { m } from 'framer-motion'
import { Calculator, RefreshCw, Clock } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const OPERATORS = ['+', '-', '×'] as const
type Operator = typeof OPERATORS[number]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']
const ROUND_TIME = 10
const QUESTIONS_PER_ROUND = 5

function generateQuestion(difficulty: number): { question: string; answer: number } {
  const maxNum = difficulty === 1 ? 10 : difficulty === 2 ? 20 : 50
  const a = Math.floor(Math.random() * maxNum) + 1
  const b = Math.floor(Math.random() * maxNum) + 1
  const op = OPERATORS[Math.floor(Math.random() * OPERATORS.length)]
  
  let answer: number
  let question: string
  
  switch (op) {
    case '+':
      answer = a + b
      question = `${a} + ${b}`
      break
    case '-':
      // 確保不會出現負數
      const bigger = Math.max(a, b)
      const smaller = Math.min(a, b)
      answer = bigger - smaller
      question = `${bigger} - ${smaller}`
      break
    case '×':
      const x = Math.floor(Math.random() * 10) + 1
      const y = Math.floor(Math.random() * 10) + 1
      answer = x * y
      question = `${x} × ${y}`
      break
    default:
      answer = a + b
      question = `${a} + ${b}`
  }
  
  return { question, answer }
}

export default function QuickMath() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [gamePhase, setGamePhase] = useState<'ready' | 'playing' | 'result'>('ready')
  const [difficulty, setDifficulty] = useState(1)
  const [currentQuestion, setCurrentQuestion] = useState<{ question: string; answer: number } | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME)
  const [questionCount, setQuestionCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [score, setScore] = useState<Record<number, number>>({})
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRound = useCallback(() => {
    setCurrentQuestion(generateQuestion(difficulty))
    setGamePhase('playing')
    setTimeLeft(ROUND_TIME)
    setQuestionCount(0)
    setCorrectCount(0)
    setUserAnswer('')
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
  }, [difficulty, play])

  const submitAnswer = useCallback(() => {
    if (!currentQuestion) return
    
    const isCorrect = parseInt(userAnswer, 10) === currentQuestion.answer
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
      setCurrentQuestion(generateQuestion(difficulty))
      setUserAnswer('')
    }
  }, [currentQuestion, userAnswer, questionCount, difficulty, correctCount, currentPlayerIndex, play])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitAnswer()
    }
  }, [submitAnswer])

  const nextRound = useCallback(() => {
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    setCurrentQuestion(null)
    setGamePhase('ready')
    setTimeLeft(ROUND_TIME)
    setQuestionCount(0)
    setCorrectCount(0)
    setUserAnswer('')
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
    setUserAnswer('')
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
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="快速心算">
      <GameRules
        rules={`${QUESTIONS_PER_ROUND} 題心算，限時 ${ROUND_TIME} 秒！\n答對越多分數越高！最低分喝酒！`}
        rulesKey="quick-math.rules"
      />

      <Calculator className="w-12 h-12 text-blue-400 mb-4" />

      {gamePhase === 'ready' && (
        <div className="text-center w-full max-w-md">
          <p className="text-white/60 mb-2">挑戰者是</p>
          <p className="text-2xl font-bold text-blue-400 mb-4">{currentPlayer}</p>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-white/60">難度：</span>
            {[1, 2, 3].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-lg games-focus-ring min-h-[48px] ${
                  difficulty === d ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60'
                }`}
              >
                {d === 1 ? '簡單' : d === 2 ? '中等' : '困難'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={startRound}
            className="btn-primary px-8 py-3 text-lg games-focus-ring bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            開始心算！
          </button>
        </div>
      )}

      {gamePhase === 'playing' && currentQuestion && (
        <div className="text-center w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${timeLeft <= 3 ? 'text-red-400' : 'text-amber-400'}`} />
              <span className={`font-bold text-xl tabular-nums ${timeLeft <= 3 ? 'text-red-400' : 'text-amber-400'}`}>
                {timeLeft}
              </span>
            </div>
            <div className="text-white/60">
              {questionCount + 1} / {QUESTIONS_PER_ROUND} | 答對：<span className="text-green-400 font-bold">{correctCount}</span>
            </div>
          </div>

          <m.div
            key={currentQuestion.question}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-2xl p-8 mb-6 border border-blue-500/30"
          >
            <p className="text-4xl font-bold text-white">{currentQuestion.question} = ?</p>
          </m.div>

          <div className="flex gap-3 justify-center">
            <input
              type="number"
              inputMode="numeric"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="答案"
              className="w-32 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-2xl text-center games-focus-ring"
              autoFocus
            />
            <button
              type="button"
              onClick={submitAnswer}
              disabled={!userAnswer}
              className="px-8 py-3 rounded-xl bg-blue-500 text-white font-bold games-focus-ring disabled:opacity-50 min-h-[48px]"
            >
              確定
            </button>
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
          <p className="text-4xl font-bold text-blue-400 mb-2">{correctCount} / {QUESTIONS_PER_ROUND}</p>
          <p className="text-white/70 mb-4">答對</p>

          {correctCount === 0 ? (
            <p className="text-red-400 font-bold text-xl mb-4">{currentPlayer} 喝兩杯！全錯！</p>
          ) : correctCount < 3 ? (
            <p className="text-amber-400 font-bold text-xl mb-4">{currentPlayer} 喝一杯！</p>
          ) : (
            <p className="text-green-400 font-bold text-xl mb-4">太厲害了！{currentPlayer} 免喝！</p>
          )}

          <div className="flex gap-3 justify-center">
            <button type="button" onClick={nextRound} className="btn-primary px-6 py-2 games-focus-ring">
              下一位
            </button>
            <CopyResultButton
              text={`快速心算：\n${currentPlayer} 答對 ${correctCount}/${QUESTIONS_PER_ROUND} 題`}
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
