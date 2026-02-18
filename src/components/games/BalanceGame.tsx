'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Scale, RefreshCw, Trophy, Check, X } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const BALANCE_QUESTIONS = [
  { question: '哪個比較重？', optionA: '一噸鐵', optionB: '一噸棉花', answer: 'tie', explanation: '都是一噸！', difficulty: 1 },
  { question: '哪個比較高？', optionA: '台北101', optionB: '艾菲爾鐵塔', answer: 'A', explanation: '台北101 508公尺 vs 艾菲爾 330公尺', difficulty: 1 },
  { question: '哪個比較多？', optionA: '地球上的沙子', optionB: '可觀測宇宙的星星', answer: 'B', explanation: '星星數量遠超過沙子！', difficulty: 2 },
  { question: '哪個比較快？', optionA: '獵豹', optionB: '鴕鳥', answer: 'A', explanation: '獵豹 120km/h vs 鴕鳥 70km/h', difficulty: 1 },
  { question: '哪個比較長？', optionA: '萬里長城', optionB: '赤道周長', answer: 'B', explanation: '長城約 21,196km vs 赤道 40,075km', difficulty: 2 },
  { question: '哪個比較老？', optionA: '金字塔', optionB: '中國長城', answer: 'A', explanation: '金字塔約4500年 vs 長城約2200年', difficulty: 2 },
  { question: '哪個比較深？', optionA: '馬里亞納海溝', optionB: '珠穆朗瑪峰高度', answer: 'A', explanation: '馬里亞納 10,994m vs 珠峰 8,848m', difficulty: 3 },
  { question: '哪個比較熱？', optionA: '太陽表面', optionB: '閃電', answer: 'B', explanation: '閃電可達 30,000°C vs 太陽表面 5,500°C', difficulty: 3 },
  { question: '哪個比較大？', optionA: '太平洋面積', optionB: '月球表面積', answer: 'A', explanation: '太平洋 1.65億km² vs 月球 0.38億km²', difficulty: 2 },
  { question: '哪個比較多人口？', optionA: '印度', optionB: '中國', answer: 'A', explanation: '2024年印度已超過中國', difficulty: 3 },
]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

export default function BalanceGame() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<typeof BALANCE_QUESTIONS[0] | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [scores, setScores] = useState<Record<number, number>>({})
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set())
  const [gameStarted, setGameStarted] = useState(false)
  const [tiltAngle, setTiltAngle] = useState(0)
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      clearInterval(animationRef.current)
      animationRef.current = null
    }
  }, [])

  const nextQuestion = useCallback(() => {
    stopAnimation()
    const available = BALANCE_QUESTIONS.filter(q => !usedQuestions.has(q.question))
    if (available.length === 0) {
      setCurrentQuestion(null)
      return
    }
    /** GAME-082: Difficulty curve - start easy, ramp up */
    const answeredCount = usedQuestions.size
    const targetDifficulty = answeredCount < 3 ? 1 : answeredCount < 6 ? 2 : 3
    const preferred = available.filter(q => q.difficulty <= targetDifficulty)
    const pool = preferred.length > 0 ? preferred : available
    const next = pool[Math.floor(Math.random() * pool.length)]
    setCurrentQuestion(next)
    setSelectedAnswer(null)
    setShowResult(false)
    setTiltAngle(0)
    setUsedQuestions(prev => new Set([...prev, next.question]))
    play('click')
  }, [usedQuestions, play, stopAnimation])

  const startGame = useCallback(() => {
    setGameStarted(true)
    nextQuestion()
  }, [nextQuestion])

  const selectAnswer = useCallback((answer: 'A' | 'B') => {
    if (!currentQuestion || selectedAnswer) return
    setSelectedAnswer(answer)
    
    // 天平動畫
    const targetAngle = answer === 'A' ? -15 : 15
    let currentAngle = 0
    animationRef.current = setInterval(() => {
      currentAngle += (targetAngle - currentAngle) * 0.1
      setTiltAngle(currentAngle)
      if (Math.abs(currentAngle - targetAngle) < 0.5) {
        stopAnimation()
        setTiltAngle(targetAngle)
      }
    }, 16)

    setTimeout(() => {
      stopAnimation()
      const isCorrect = currentQuestion.answer === answer || currentQuestion.answer === 'tie'
      if (isCorrect) {
        play('correct')
        setScores(prev => ({
          ...prev,
          [currentPlayerIndex]: (prev[currentPlayerIndex] || 0) + 1
        }))
        // 顯示正確結果角度
        if (currentQuestion.answer === 'tie') setTiltAngle(0)
        else if (currentQuestion.answer === 'A') setTiltAngle(-20)
        else setTiltAngle(20)
      } else {
        play('wrong')
        // 顯示正確答案
        if (currentQuestion.answer === 'tie') setTiltAngle(0)
        else if (currentQuestion.answer === 'A') setTiltAngle(-20)
        else setTiltAngle(20)
      }
      setShowResult(true)
    }, 800)
  }, [currentQuestion, selectedAnswer, currentPlayerIndex, play, stopAnimation])

  const handleNext = useCallback(() => {
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    nextQuestion()
  }, [players.length, nextQuestion])

  const resetGame = useCallback(() => {
    stopAnimation()
    setGameStarted(false)
    setCurrentQuestion(null)
    setSelectedAnswer(null)
    setShowResult(false)
    setScores({})
    setUsedQuestions(new Set())
    setCurrentPlayerIndex(0)
    setTiltAngle(0)
  }, [stopAnimation])

  useEffect(() => {
    return () => stopAnimation()
  }, [stopAnimation])

  const leaderboard = Object.entries(scores)
    .map(([i, score]) => ({ index: Number(i), name: players[Number(i)], score }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)

  const isGameOver = usedQuestions.size >= BALANCE_QUESTIONS.length && !currentQuestion
  const currentPlayer = players[currentPlayerIndex]
  const isCorrect = currentQuestion && (currentQuestion.answer === selectedAnswer || currentQuestion.answer === 'tie')

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="天秤遊戲">
      <GameRules
        rules="猜猜看哪邊比較重/多/大！\n選對得分，選錯喝一口！考驗你的常識！"
        rulesKey="balance-game.rules"
      />

      {!gameStarted ? (
        <div className="text-center">
          <Scale className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <p className="text-white/70 mb-6">準備好挑戰天秤了嗎？</p>
          <button
            type="button"
            onClick={startGame}
            className="btn-primary px-8 py-3 text-lg games-focus-ring"
          >
            開始遊戲
          </button>
        </div>
      ) : isGameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">遊戲結束！</h2>
          {leaderboard.length > 0 && (
            <div className="mb-6">
              <p className="text-primary-400 text-xl mb-2">
                <Trophy className="inline w-6 h-6 mr-2" />
                常識王：{leaderboard[0].name} ({leaderboard[0].score} 分)
              </p>
            </div>
          )}
          <CopyResultButton
            text={`天秤遊戲結果：\n${leaderboard.map((e, i) => `${i + 1}. ${e.name}: ${e.score} 分`).join('\n')}`}
            label="複製結果"
          />
          <button
            type="button"
            onClick={resetGame}
            className="mt-4 btn-secondary px-6 py-2 games-focus-ring flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            再玩一次
          </button>
        </div>
      ) : (
        <>
          <p className="text-white/60 mb-2">
            輪到 <span className="text-primary-400 font-medium">{currentPlayer}</span>
          </p>
          <p className="text-white/40 text-sm mb-6">
            剩餘 {BALANCE_QUESTIONS.length - usedQuestions.size + 1} 題
          </p>

          <AnimatePresence mode="wait">
            {currentQuestion && (
              <m.div
                key={currentQuestion.question}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -20 }}
                className="w-full max-w-md"
              >
                <h2 className="text-xl font-bold text-white text-center mb-6">{currentQuestion.question}</h2>

                {/* 天秤動畫 */}
                <div className="relative h-32 mb-6">
                  <m.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ transform: `rotate(${tiltAngle}deg)` }}
                    transition={{ type: 'spring', stiffness: 100 }}
                  >
                    {/* 天秤橫桿 */}
                    <div className="w-full h-2 bg-gradient-to-r from-primary-500 via-white/50 to-secondary-500 rounded-full" />
                    
                    {/* 左邊秤盤 */}
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <div className={`w-24 h-16 rounded-lg flex items-center justify-center text-sm font-medium ${
                        showResult && currentQuestion.answer === 'A' ? 'bg-green-500/30 border-2 border-green-500' :
                        selectedAnswer === 'A' ? 'bg-primary-500/30 border-2 border-primary-500' : 'bg-white/10 border border-white/20'
                      }`}>
                        {currentQuestion.optionA}
                      </div>
                    </div>
                    
                    {/* 右邊秤盤 */}
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className={`w-24 h-16 rounded-lg flex items-center justify-center text-sm font-medium ${
                        showResult && currentQuestion.answer === 'B' ? 'bg-green-500/30 border-2 border-green-500' :
                        selectedAnswer === 'B' ? 'bg-secondary-500/30 border-2 border-secondary-500' : 'bg-white/10 border border-white/20'
                      }`}>
                        {currentQuestion.optionB}
                      </div>
                    </div>

                    {/* 支點 */}
                    <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 w-4 h-8 bg-white/30 rounded-b-lg" />
                  </m.div>
                </div>

                {showResult && (
                  <div className={`text-center mb-4 p-3 rounded-lg ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isCorrect ? (
                      <p className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" />
                        答對了！+1 分
                      </p>
                    ) : (
                      <p className="flex items-center justify-center gap-2">
                        <X className="w-5 h-5" />
                        答錯了！喝一口！
                      </p>
                    )}
                    <p className="text-white/70 text-sm mt-1">{currentQuestion.explanation}</p>
                  </div>
                )}

                {!showResult ? (
                  <div className="flex gap-4 justify-center">
                    <button
                      type="button"
                      onClick={() => selectAnswer('A')}
                      disabled={!!selectedAnswer}
                      className="flex-1 max-w-[150px] px-4 py-3 rounded-xl bg-primary-500/20 border border-primary-500/50 text-primary-400 hover:bg-primary-500/30 games-focus-ring min-h-[48px] disabled:opacity-50"
                    >
                      {currentQuestion.optionA}
                    </button>
                    <button
                      type="button"
                      onClick={() => selectAnswer('B')}
                      disabled={!!selectedAnswer}
                      className="flex-1 max-w-[150px] px-4 py-3 rounded-xl bg-secondary-500/20 border border-secondary-500/50 text-secondary-400 hover:bg-secondary-500/30 games-focus-ring min-h-[48px] disabled:opacity-50"
                    >
                      {currentQuestion.optionB}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full btn-primary py-3 games-focus-ring"
                  >
                    下一題
                  </button>
                )}
              </m.div>
            )}
          </AnimatePresence>

          {leaderboard.length > 0 && (
            <div className="mt-6 w-full max-w-xs bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-white/50 text-xs mb-2 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> 得分排行
              </p>
              <ul className="space-y-1">
                {leaderboard.slice(0, 5).map((entry, i) => (
                  <li key={entry.index} className="flex justify-between text-sm text-white/70">
                    <span>{i === 0 && '⚖️ '}{entry.name}</span>
                    <span>{entry.score} 分</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
