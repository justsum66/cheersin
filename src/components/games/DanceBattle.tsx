'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '@/contexts/I18nContext'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { Music, RotateCcw, Trophy, Play, Pause } from 'lucide-react'

const DANCE_MOVES = [
  { name: '拍手', emoji: '👏', difficulty: 'easy' },
  { name: '跳躍', emoji: '🦘', difficulty: 'easy' },
  { name: '轉圈', emoji: '🔄', difficulty: 'medium' },
  { name: '搖擺', emoji: '💃', difficulty: 'easy' },
  { name: '滑步', emoji: '🚶', difficulty: 'medium' },
  { name: '月球漫步', emoji: '🕺', difficulty: 'hard' },
  { name: '機器人舞', emoji: '🤖', difficulty: 'medium' },
  { name: '霹靂舞', emoji: '⚡', difficulty: 'hard' },
  { name: '扭腰', emoji: '🐍', difficulty: 'medium' },
  { name: '舉手', emoji: '✋', difficulty: 'easy' },
  { name: '蹲下', emoji: '🧎', difficulty: 'medium' },
  { name: '旋轉跳', emoji: '🌀', difficulty: 'hard' },
]

export default function DanceBattle() {
  const { t } = useTranslation()
  const players = useGamesPlayers()
  const { play } = useGameSound()
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentMove, setCurrentMove] = useState<typeof DANCE_MOVES[0] | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [round, setRound] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentPlayer = players[currentPlayerIndex]

  // 遊戲初始化
  const initializeGame = () => {
    setGameState('playing')
    setScores({})
    setCurrentPlayerIndex(0)
    setRound(1)
    setIsPlaying(false)
    setTimeLeft(30)
    play('click')
  }

  // 開始舞蹈回合
  const startDanceRound = () => {
    const randomMove = DANCE_MOVES[Math.floor(Math.random() * DANCE_MOVES.length)]
    setCurrentMove(randomMove)
    setIsPlaying(true)
    setTimeLeft(30)
    play('click')
  }

  // 評分舞蹈
  const rateDance = (rating: number) => {
    setScores(prev => ({
      ...prev,
      [currentPlayer]: (prev[currentPlayer] || 0) + rating
    }))
    play('correct')
    
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1)
    } else {
      // 下一輪
      if (round < 5) {
        setRound(prev => prev + 1)
        setCurrentPlayerIndex(0)
        setCurrentMove(null)
        setIsPlaying(false)
      } else {
        setGameState('results')
        play('win')
      }
    }
  }

  // 跳過玩家
  const skipPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1)
    } else {
      if (round < 5) {
        setRound(prev => prev + 1)
        setCurrentPlayerIndex(0)
        setCurrentMove(null)
        setIsPlaying(false)
      } else {
        setGameState('results')
        play('win')
      }
    }
    play('click')
  }

  // 下一輪
  const nextRound = () => {
    setGameState('setup')
    setScores({})
    setCurrentPlayerIndex(0)
    setRound(1)
    setCurrentMove(null)
    setIsPlaying(false)
    setTimeLeft(30)
    play('click')
  }

  // 倒數計時
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false)
    }
  }, [isPlaying, timeLeft])

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Music className="w-8 h-8 text-pink-400" />
            <h1 className="text-2xl font-bold text-white">舞蹈對決</h1>
          </div>
          <p className="text-white/80 mb-6">展現你的舞技，爭奪舞蹈之王！</p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-white font-medium">遊戲規則：</p>
            <ul className="text-white/80 text-sm mt-2 text-left">
              <li>• 每輪隨機舞蹈動作</li>
              <li>• 30秒內盡情舞蹈</li>
              <li>• 其他玩家評分 (1-10分)</li>
              <li>• 進行5輪比賽</li>
              <li>• 總分最高者獲勝</li>
            </ul>
          </div>
          
          <button 
            onClick={initializeGame}
            className="games-touch-target w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white py-3 text-lg rounded-xl font-bold"
          >
            開始對決
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-white">
                <p className="text-sm">目前玩家</p>
                <p className="text-xl font-bold text-pink-400">{currentPlayer}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{t('common.roundLabel', { n: round })}</p>
                <p className="text-sm text-white/60">共5輪</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              {players.map((player, index) => (
                <div key={player} className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentPlayer === player 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {player}: {scores[player] || 0}分
                </div>
              ))}
            </div>
          </div>

          {!isPlaying && !currentMove && (
            <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">準備開始</h2>
              <p className="text-white/80 mb-6">{currentPlayer} 請準備表演</p>
              <button 
                onClick={startDanceRound}
                className="games-touch-target bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-8 rounded-xl font-bold"
              >
                <Play className="w-5 h-5 mr-2 inline" />
                開始舞蹈
              </button>
            </div>
          )}

          {isPlaying && currentMove && (
            <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center mb-6">
              <div className="text-6xl mb-4">
                {currentMove.emoji}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{currentMove.name}</h2>
              <p className="text-white/80 mb-4">難度：{currentMove.difficulty === 'easy' ? '簡單' : currentMove.difficulty === 'medium' ? '中等' : '困難'}</p>
              
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className={`w-4 h-4 rounded-full ${timeLeft > 10 ? 'bg-green-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className="text-2xl font-bold text-white">{timeLeft}</span>
                <span className="text-white/60">秒</span>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    onClick={() => rateDance(score)}
                    className="games-touch-target aspect-square bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold text-lg transition-colors"
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isPlaying && currentMove && (
            <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">評分時間</h2>
              <p className="text-white/80 mb-6">請為 {currentPlayer} 的 {currentMove.name} 表演評分</p>
              
              <div className="grid grid-cols-5 gap-2 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    onClick={() => rateDance(score)}
                    className="games-touch-target aspect-square bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-lg text-white font-bold text-lg transition-all"
                  >
                    {score}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={skipPlayer}
                className="games-touch-target bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-2 px-6 rounded-lg font-medium"
              >
                跳過此玩家
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (gameState === 'results') {
    const sortedPlayers = [...players].sort((a, b) => 
      (scores[b] || 0) - (scores[a] || 0)
    )

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">舞蹈對決結果</h1>
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
                  <span className="text-white/80">{scores[player] || 0} 分</span>
                  {index === 0 && (
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={nextRound}
            className="games-touch-target w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white py-3 rounded-xl font-bold"
          >
            <RotateCcw className="w-4 h-4 mr-2 inline" />
            再來一次
          </button>
        </div>
      </div>
    )
  }

  return null
}