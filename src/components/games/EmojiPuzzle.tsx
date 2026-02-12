'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useTranslation } from '@/contexts/I18nContext'
import { Smile, RotateCcw, Trophy, Clock } from 'lucide-react'

const EMOJI_PUZZLES = [
  { puzzle: '👨‍👩‍👧‍👦', answer: '家庭' },
  { puzzle: '🍕🥤🍦', answer: '美食' },
  { puzzle: '🚗🚕🚙', answer: '交通' },
  { puzzle: '⚽🏀🏈', answer: '運動' },
  { puzzle: '📱💻🖥️', answer: '科技' },
  { puzzle: '🌞🌧️❄️', answer: '天氣' },
  { puzzle: '🍎🍌🍇', answer: '水果' },
  { puzzle: '🐶🐱🐭', answer: '動物' },
  { puzzle: '🎓💼💰', answer: '職業' },
  { puzzle: '🎨🎭🎬', answer: '娛樂' },
  { puzzle: '🏥💊💉', answer: '醫療' },
  { puzzle: '✈️🚢🚂', answer: '旅行' },
  { puzzle: '📚✏️📐', answer: '學習' },
  { puzzle: '🎵🎤🎧', answer: '音樂' },
  { puzzle: '🎮🎲🎯', answer: '遊戲' }
]

export default function EmojiPuzzle() {
  const { t } = useTranslation()
  const players = useGamesPlayers()
  const { play } = useGameSound()
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(30)
  const [showAnswer, setShowAnswer] = useState(false)

  const currentPlayer = players[currentPlayerIndex]
  const currentPuzzle = EMOJI_PUZZLES[currentPuzzleIndex]

  // 遊戲初始化
  const initializeGame = () => {
    setGameState('playing')
    setAnswers({})
    setCurrentPlayerIndex(0)
    setCurrentPuzzleIndex(0)
    setTimeLeft(30)
    setShowAnswer(false)
    play('click')
  }

  // 提交答案
  const submitAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentPlayer]: answer
    }))
    play('click')
    
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1)
    } else {
      // 檢查答案並移動到下一題
      checkAnswers()
    }
  }

  // 檢查答案（useCallback 以滿足 useEffect 依賴，避免 exhaustive-deps 警告）
  const checkAnswers = useCallback(() => {
    setShowAnswer(true)
    play('correct')
    setTimeout(() => {
      if (currentPuzzleIndex < EMOJI_PUZZLES.length - 1) {
        setCurrentPuzzleIndex(prev => prev + 1)
        setCurrentPlayerIndex(0)
        setTimeLeft(30)
        setShowAnswer(false)
      } else {
        setGameState('results')
        play('win')
      }
    }, 3000)
  }, [currentPuzzleIndex, play])

  // 跳過題目
  const skipPuzzle = () => {
    if (currentPuzzleIndex < EMOJI_PUZZLES.length - 1) {
      setCurrentPuzzleIndex(prev => prev + 1)
      setCurrentPlayerIndex(0)
      setTimeLeft(30)
      setShowAnswer(false)
      play('click')
    } else {
      setGameState('results')
      play('win')
    }
  }

  // 下一輪
  const nextRound = () => {
    setGameState('setup')
    setCurrentPlayerIndex(0)
    setCurrentPuzzleIndex(0)
    setAnswers({})
    setTimeLeft(30)
    setShowAnswer(false)
    play('click')
  }

  // 倒數計時
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !showAnswer) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameState === 'playing' && !showAnswer) {
      checkAnswers()
    }
  }, [timeLeft, gameState, showAnswer, checkAnswers])

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Smile className="w-8 h-8 text-pink-400" />
            <h1 className="text-2xl font-bold text-white">表情拼圖</h1>
          </div>
          <p className="text-white/80 mb-6">看Emoji猜答案，考驗你的想像力！</p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-white font-medium">遊戲規則：</p>
            <ul className="text-white/80 text-sm mt-2 text-left">
              <li>• 看Emoji組合猜答案</li>
              <li>• 每題30秒時間</li>
              <li>• 答對得分，答錯或跳過不得分</li>
              <li>• 最終得分最高者獲勝</li>
            </ul>
          </div>
          
          <button 
            onClick={initializeGame}
            className="games-touch-target w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-3 text-lg rounded-xl font-bold"
          >
            開始遊戲
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-white">
                <p className="text-sm">目前玩家</p>
                <p className="text-xl font-bold text-pink-400">{currentPlayer}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-white">
                  <Clock className="w-4 h-4" />
                  <span className="text-xl font-bold">{timeLeft}</span>
                </div>
                <p className="text-sm text-white/60">剩餘時間</p>
              </div>
            </div>
            
            <div className="w-full bg-white/10 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentPuzzleIndex + 1) / EMOJI_PUZZLES.length) * 100}%` }}
              />
            </div>
            <p className="text-center text-white/80">
              {t('common.questionProgress', { current: currentPuzzleIndex + 1, total: EMOJI_PUZZLES.length })}
            </p>
          </div>

          <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center mb-6">
            <div className="text-6xl mb-6">
              {currentPuzzle.puzzle}
            </div>
            <p className="text-white/80 mb-4">這是什麼？</p>
            
            {showAnswer && (
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <p className="text-white">正確答案：</p>
                <p className="text-2xl font-bold text-yellow-400">{currentPuzzle.answer}</p>
                <div className="mt-2">
                  {players.map(player => (
                    <div key={player} className="text-white/80 text-sm">
                      {player}：{answers[player] || '未回答'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!showAnswer && (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => submitAnswer('家庭')}
                className="games-touch-target bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 rounded-xl font-bold"
              >
                家庭
              </button>
              <button 
                onClick={() => submitAnswer('美食')}
                className="games-touch-target bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold"
              >
                美食
              </button>
              <button 
                onClick={() => submitAnswer('交通')}
                className="games-touch-target bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-4 rounded-xl font-bold"
              >
                交通
              </button>
              <button 
                onClick={() => submitAnswer('運動')}
                className="games-touch-target bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold"
              >
                運動
              </button>
              <button 
                onClick={() => submitAnswer('科技')}
                className="games-touch-target bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold"
              >
                科技
              </button>
              <button 
                onClick={() => submitAnswer('天氣')}
                className="games-touch-target bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-4 rounded-xl font-bold"
              >
                天氣
              </button>
            </div>
          )}

          {showAnswer && (
            <div className="text-center">
              <button 
                onClick={skipPuzzle}
                className="games-touch-target bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 px-6 rounded-xl font-bold"
              >
                下一題
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (gameState === 'results') {
    const scoreCounts: Record<string, number> = {}
    Object.entries(answers).forEach(([player, answer]) => {
      const correctAnswer = EMOJI_PUZZLES.find((_, index) => 
        Object.keys(answers).indexOf(player) === index
      )?.answer
      
      if (answer === correctAnswer) {
        scoreCounts[player] = (scoreCounts[player] || 0) + 1
      }
    })
    
    const sortedPlayers = [...players].sort((a, b) => 
      (scoreCounts[b] || 0) - (scoreCounts[a] || 0)
    )

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">遊戲結果</h1>
          </div>
          
          <div className="space-y-4 mb-6">
            {sortedPlayers.map((player, index) => (
              <div key={player} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-white font-medium">{player}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/80">{scoreCounts[player] || 0} 分</span>
                  {index === 0 && (
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={nextRound}
            className="games-touch-target w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold"
          >
            <RotateCcw className="w-4 h-4 mr-2 inline" />
            再玩一次
          </button>
        </div>
      </div>
    )
  }

  return null
}