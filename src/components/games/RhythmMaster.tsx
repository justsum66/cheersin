'use client'

import { useState, useEffect, useRef } from 'react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { Music, RotateCcw, Trophy, Play } from 'lucide-react'

const RHYTHM_PATTERNS = [
  { id: 'simple', name: '簡單節奏', pattern: [1, 0, 1, 0], difficulty: 'easy' },
  { id: 'medium', name: '中等節奏', pattern: [1, 0, 1, 1, 0, 1], difficulty: 'medium' },
  { id: 'complex', name: '複雜節奏', pattern: [1, 1, 0, 1, 0, 0, 1, 1], difficulty: 'hard' },
  { id: 'syncopated', name: '切分節奏', pattern: [0, 1, 0, 1, 1, 0, 1, 0], difficulty: 'hard' },
  { id: 'triple', name: '三連音', pattern: [1, 1, 1, 0, 1, 1, 1, 0], difficulty: 'medium' },
]

export default function RhythmMaster() {
  const players = useGamesPlayers()
  const { play } = useGameSound()
  const [gameState, setGameState] = useState<'setup' | 'demonstrating' | 'playing' | 'results'>('setup')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentPattern, setCurrentPattern] = useState<typeof RHYTHM_PATTERNS[0] | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [round, setRound] = useState(1)
  const [demonstration, setDemonstration] = useState<number[]>([])
  const [playerInput, setPlayerInput] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentPlayer = players[currentPlayerIndex]

  // 遊戲初始化
  const initializeGame = () => {
    setGameState('demonstrating')
    setCurrentPlayerIndex(0)
    setRound(1)
    setScores({})
    setDemonstration([])
    setPlayerInput([])
    setIsPlaying(false)
    setShowResult(false)
    play('click')
  }

  // 開始示範
  const startDemonstration = () => {
    const pattern = RHYTHM_PATTERNS[Math.floor(Math.random() * RHYTHM_PATTERNS.length)]
    setCurrentPattern(pattern)
    setDemonstration([])
    setPlayerInput([])
    setIsPlaying(true)
    play('click')
    
    // 播放示範節奏
    setTimeout(() => {
      playDemonstration(pattern.pattern)
    }, 500)
  }

  // 播放示範
  const playDemonstration = (pattern: number[]) => {
    let index = 0
    const interval = setInterval(() => {
      if (index < pattern.length) {
        setDemonstration(prev => [...prev, pattern[index]])
        if (pattern[index] === 1) {
          play('click')
        }
        index++
      } else {
        clearInterval(interval)
        setIsPlaying(false)
        setGameState('playing')
      }
    }, 600)
  }

  // 玩家點擊
  const handlePlayerClick = () => {
    if (gameState !== 'playing' || isPlaying) return
    
    const newInput = [...playerInput, 1]
    setPlayerInput(newInput)
    play('click')
    
    // 檢查是否完成
    if (newInput.length === currentPattern?.pattern.length) {
      checkResult(newInput)
    }
  }

  // 玩家跳過（無聲）
  const handlePlayerSkip = () => {
    if (gameState !== 'playing' || isPlaying) return
    
    const newInput = [...playerInput, 0]
    setPlayerInput(newInput)
    play('click')
    
    // 檢查是否完成
    if (newInput.length === currentPattern?.pattern.length) {
      checkResult(newInput)
    }
  }

  // 檢查結果
  const checkResult = (input: number[]) => {
    if (!currentPattern) return
    
    const correctCount = input.filter((value, index) => 
      value === currentPattern.pattern[index]
    ).length
    
    const accuracy = Math.round((correctCount / currentPattern.pattern.length) * 100)
    
    setScores(prev => ({
      ...prev,
      [currentPlayer]: (prev[currentPlayer] || 0) + Math.floor(accuracy / 10)
    }))
    
    setShowResult(true)
    play(accuracy >= 80 ? 'win' : 'wrong')
  }

  // 下一個玩家
  const nextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1)
      setGameState('demonstrating')
      setPlayerInput([])
      setShowResult(false)
    } else {
      if (round < 3) {
        nextRound()
      } else {
        setGameState('results')
      }
    }
    play('click')
  }

  // 下一輪
  const nextRound = () => {
    setRound(prev => prev + 1)
    setCurrentPlayerIndex(0)
    setGameState('demonstrating')
    setPlayerInput([])
    setShowResult(false)
    play('click')
  }

  // 重新開始
  const restartGame = () => {
    setGameState('setup')
    setCurrentPlayerIndex(0)
    setRound(1)
    setScores({})
    setDemonstration([])
    setPlayerInput([])
    setIsPlaying(false)
    setShowResult(false)
    play('click')
  }

  // 節奏可視化顯示
  const renderRhythm = (pattern: number[], activeIndex: number = -1) => {
    return (
      <div className="flex justify-center gap-2 mb-4">
        {pattern.map((beat, index) => (
          <div 
            key={index}
            className={`
              w-4 h-16 rounded-md transition-all duration-200
              ${beat === 1 ? 'bg-green-500' : 'bg-gray-600'}
              ${index === activeIndex ? 'ring-2 ring-yellow-400 scale-110' : ''}
            `}
          />
        ))}
      </div>
    )
  }

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Music className="w-8 h-8 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">節奏大師</h1>
          </div>
          <p className="text-white/80 mb-6">測試你的節奏感，重現聽到的節奏！</p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-white font-medium">遊戲規則：</p>
            <ul className="text-white/80 text-sm mt-2 text-left">
              <li>• 先聽節奏示範</li>
              <li>• 記住節奏模式</li>
              <li>• 點擊重現相同的節奏</li>
              <li>• 準確度越高得分越高</li>
              <li>• 進行3輪比賽</li>
            </ul>
          </div>
          
          <button 
            onClick={initializeGame}
            className="games-touch-target w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 text-lg rounded-xl font-bold"
          >
            開始遊戲
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'demonstrating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-4">
            第 {round} 輪 - {currentPlayer} 的回合
          </h2>
          
          {currentPattern && (
            <div className="mb-6">
              <p className="text-white/80 mb-2">節奏難度：</p>
              <p className="text-lg font-bold text-yellow-400">
                {currentPattern.name}
              </p>
            </div>
          )}
          
          <div className="mb-6">
            {currentPattern && renderRhythm(
              currentPattern.pattern, 
              isPlaying ? demonstration.length - 1 : -1
            )}
          </div>
          
          <button 
            onClick={startDemonstration}
            disabled={isPlaying}
            className="games-touch-target w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold"
          >
            {isPlaying ? '聆聽中...' : '開始示範'}
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-4">
            {currentPlayer} 請重現節奏
          </h2>
          
          <div className="mb-6">
            {currentPattern && renderRhythm(currentPattern.pattern)}
            <p className="text-white/60 text-sm">綠色 = 點擊，灰色 = 跳過</p>
          </div>
          
          <div className="mb-6">
            {renderRhythm(playerInput)}
            <p className="text-white/80 text-sm">
              已輸入 {playerInput.length} / {currentPattern?.pattern.length} 拍
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handlePlayerClick}
              disabled={isPlaying || playerInput.length >= (currentPattern?.pattern.length || 0)}
              className="games-touch-target bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold"
            >
              點擊 (有聲)
            </button>
            <button 
              onClick={handlePlayerSkip}
              disabled={isPlaying || playerInput.length >= (currentPattern?.pattern.length || 0)}
              className="games-touch-target bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 text-white py-4 rounded-xl font-bold"
            >
              跳過 (無聲)
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'results') {
    const sortedPlayers = [...players].sort((a, b) => 
      (scores[b] || 0) - (scores[a] || 0)
    )

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">
              {round < 3 ? '回合結果' : '最終結果'}
            </h1>
          </div>
          
          {currentPattern && (
            <div className="bg-white/10 rounded-lg p-4 mb-6 text-center">
              <p className="text-white">本輪節奏：{currentPattern.name}</p>
            </div>
          )}
          
          <div className="space-y-3 mb-6">
            {sortedPlayers.map((player, index) => (
              <div key={player} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {index + 1}
                  </div>
                  <span className="text-white font-medium">{player}</span>
                </div>
                <span className="text-white/80">{scores[player] || 0} 分</span>
              </div>
            ))}
          </div>
          
          {round < 3 ? (
            <button 
              onClick={nextRound}
              className="games-touch-target w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold"
            >
              下一輪
            </button>
          ) : (
            <button 
              onClick={restartGame}
              className="games-touch-target w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold"
            >
              <RotateCcw className="w-4 h-4 mr-2 inline" />
              再玩一次
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}