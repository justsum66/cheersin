'use client'

import { useState, useEffect } from 'react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { Hand, RotateCcw, Trophy, Eye } from 'lucide-react'

const GESTURES = [
  { id: 'thumbs-up', name: '豎大拇指', emoji: '👍' },
  { id: 'thumbs-down', name: '翹小指', emoji: '👎' },
  { id: 'ok', name: 'OK手勢', emoji: '👌' },
  { id: 'peace', name: '勝利手勢', emoji: '✌️' },
  { id: 'fist', name: '握拳', emoji: '✊' },
  { id: 'wave', name: '揮手', emoji: '👋' },
  { id: 'clap', name: '拍手', emoji: '👏' },
  { id: 'point', name: '指點', emoji: '👉' },
  { id: 'heart', name: '比心', emoji: '❤️' },
  { id: 'rock', name: '搖滾', emoji: '🤟' },
  { id: 'call', name: '打電話', emoji: '🤙' },
  { id: 'gun', name: '手槍', emoji: '🔫' },
]

export default function GestureGuess() {
  const players = useGamesPlayers()
  const { play } = useGameSound()
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'guessing' | 'results'>('setup')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentGesture, setCurrentGesture] = useState<typeof GESTURES[0] | null>(null)
  const [guesses, setGuesses] = useState<Record<string, string>>({})
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})

  const currentPlayer = players[currentPlayerIndex]
  const otherPlayers = players.filter(p => p !== currentPlayer)

  // 遊戲初始化
  const initializeGame = () => {
    setGameState('playing')
    setGuesses({})
    setCurrentPlayerIndex(0)
    setRound(1)
    setScores({})
    play('click')
  }

  // 開始表演
  const startPerformance = () => {
    const gesture = GESTURES[Math.floor(Math.random() * GESTURES.length)]
    setCurrentGesture(gesture)
    setGuesses({})
    setCurrentPlayerIndex(0)
    play('click')
  }

  // 完成表演
  const finishPerformance = () => {
    setGameState('guessing')
    setCurrentPlayerIndex(0)
    play('click')
  }

  // 猜測手勢
  const makeGuess = (guess: string) => {
    setGuesses(prev => ({
      ...prev,
      [currentPlayer]: guess
    }))
    play('click')
    
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1)
    } else {
      calculateRoundResults()
    }
  }

  // 計算回合結果
  const calculateRoundResults = () => {
    // 計算正確猜測數
    Object.entries(guesses).forEach(([player, guess]) => {
      if (guess === currentGesture?.id) {
        setScores(prev => ({
          ...prev,
          [player]: (prev[player] || 0) + 3
        }))
      }
    })
    
    // 表演者得分（如果有猜對的人）
    const correctGuesses = Object.values(guesses).filter(g => g === currentGesture?.id).length
    if (correctGuesses > 0) {
      setScores(prev => ({
        ...prev,
        [currentPlayer]: (prev[currentPlayer] || 0) + correctGuesses
      }))
    }
    
    setGameState('results')
    play('win')
  }

  // 下一輪
  const nextRound = () => {
    if (round < 5) {
      setRound(prev => prev + 1)
      setGameState('playing')
      setGuesses({})
      setCurrentPlayerIndex(0)
      setCurrentGesture(null)
    } else {
      setGameState('results')
    }
    play('click')
  }

  // 重新開始
  const restartGame = () => {
    setGameState('setup')
    setGuesses({})
    setCurrentPlayerIndex(0)
    setRound(1)
    setScores({})
    setCurrentGesture(null)
    play('click')
  }

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-cyan-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Hand className="w-8 h-8 text-green-400" />
            <h1 className="text-2xl font-bold text-white">手勢猜謎</h1>
          </div>
          <p className="text-white/80 mb-6">用你的手勢表達，讓大家來猜！</p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-white font-medium">遊戲規則：</p>
            <ul className="text-white/80 text-sm mt-2 text-left">
              <li>• 輪流表演指定手勢</li>
              <li>• 其他人猜測是什麼手勢</li>
              <li>• 猜對得分</li>
              <li>• 表演者根據猜對人數得分</li>
              <li>• 進行5輪比賽</li>
            </ul>
          </div>
          
          <button 
            onClick={initializeGame}
            className="games-touch-target w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 text-lg rounded-xl font-bold"
          >
            開始遊戲
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-cyan-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-4">
            {currentPlayer} 的回合
          </h2>
          
          {!currentGesture ? (
            <div className="space-y-4">
              <div className="text-6xl mb-4">
                🤚
              </div>
              <p className="text-white/80">準備表演手勢</p>
              <button 
                onClick={startPerformance}
                className="games-touch-target w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 rounded-xl font-bold"
              >
                開始表演
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-8xl mb-4">
                {currentGesture.emoji}
              </div>
              <p className="text-white text-xl font-bold">{currentGesture.name}</p>
              <button 
                onClick={finishPerformance}
                className="games-touch-target w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-xl font-bold"
              >
                完成表演
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (gameState === 'guessing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-cyan-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <p className="text-sm">第 {round} 輪</p>
                <p className="text-xl font-bold text-green-400">猜手勢</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm">表演者</p>
                <p className="text-lg font-bold text-yellow-400">
                  {currentPlayer}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherPlayers.map((player) => (
              <div key={player} className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                    {player.charAt(0)}
                  </div>
                  <span className="text-white font-medium">{player}</span>
                  {currentPlayer === player && (
                    <div className="ml-auto px-2 py-1 bg-yellow-500 text-black text-xs rounded-full">
                      表演者
                    </div>
                  )}
                </div>
                
                {currentPlayer !== player ? (
                  <div className="space-y-2">
                    {GESTURES.slice(0, 6).map((gesture) => (
                      <button
                        key={gesture.id}
                        onClick={() => makeGuess(gesture.id)}
                        disabled={!!guesses[player]}
                        className="games-touch-target w-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium"
                      >
                        {gesture.emoji} {gesture.name}
                      </button>
                    ))}
                    {guesses[player] && (
                      <div className="text-center py-2 text-green-400 font-medium">
                        已選擇：{
                          GESTURES.find(g => g.id === guesses[player])?.name
                        }
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/50">
                    你是表演者
                  </div>
                )}
              </div>
            ))}
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
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-cyan-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">
              {round < 5 ? '回合結果' : '最終結果'}
            </h1>
          </div>
          
          {round < 5 && currentGesture && (
            <div className="bg-white/10 rounded-lg p-4 mb-6 text-center">
              <p className="text-4xl mb-2">{currentGesture.emoji}</p>
              <p className="text-white">本輪手勢：{currentGesture.name}</p>
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
          
          {round < 5 ? (
            <button 
              onClick={nextRound}
              className="games-touch-target w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 rounded-xl font-bold"
            >
              下一輪
            </button>
          ) : (
            <button 
              onClick={restartGame}
              className="games-touch-target w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 rounded-xl font-bold"
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