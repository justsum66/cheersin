'use client'

import { useState, useEffect } from 'react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { Brain, RotateCcw, Trophy, Eye } from 'lucide-react'

const CARD_PAIRS = [
  { id: 1, emoji: '🍎', matched: false },
  { id: 2, emoji: '🍎', matched: false },
  { id: 3, emoji: '🍌', matched: false },
  { id: 4, emoji: '🍌', matched: false },
  { id: 5, emoji: '🍇', matched: false },
  { id: 6, emoji: '🍇', matched: false },
  { id: 7, emoji: '🍊', matched: false },
  { id: 8, emoji: '🍊', matched: false },
  { id: 9, emoji: '🍓', matched: false },
  { id: 10, emoji: '🍓', matched: false },
  { id: 11, emoji: '🍉', matched: false },
  { id: 12, emoji: '🍉', matched: false },
]

export default function MemoryMatch() {
  const players = useGamesPlayers()
  const { play } = useGameSound()
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup')
  const [cards, setCards] = useState([...CARD_PAIRS].sort(() => Math.random() - 0.5))
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedCards, setMatchedCards] = useState<number[]>([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [moves, setMoves] = useState(0)

  const currentPlayer = players[currentPlayerIndex]

  // 遊戲初始化
  const initializeGame = () => {
    setGameState('playing')
    setCards([...CARD_PAIRS].sort(() => Math.random() - 0.5))
    setFlippedCards([])
    setMatchedCards([])
    setCurrentPlayerIndex(0)
    setScores({})
    setMoves(0)
    play('click')
  }

  // 翻牌
  const flipCard = (index: number) => {
    if (flippedCards.length >= 2 || flippedCards.includes(index) || matchedCards.includes(index)) {
      return
    }

    const newFlippedCards = [...flippedCards, index]
    setFlippedCards(newFlippedCards)
    play('click')

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1)
      const [firstIndex, secondIndex] = newFlippedCards
      const firstCard = cards[firstIndex]
      const secondCard = cards[secondIndex]

      if (firstCard.emoji === secondCard.emoji) {
        // 配對成功
        setTimeout(() => {
          setMatchedCards(prev => [...prev, firstIndex, secondIndex])
          setFlippedCards([])
          setScores(prev => ({
            ...prev,
            [currentPlayer]: (prev[currentPlayer] || 0) + 1
          }))
          play('correct')
        }, 500)
      } else {
        // 配對失敗
        setTimeout(() => {
          setFlippedCards([])
          // 切換玩家
          setCurrentPlayerIndex(prev => (prev + 1) % players.length)
          play('wrong')
        }, 1000)
      }
    }
  }

  // 檢查遊戲結束
  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setGameState('results')
      play('win')
    }
  }, [matchedCards, cards.length, play])

  // 下一輪
  const nextRound = () => {
    setGameState('setup')
    setCards([])
    setFlippedCards([])
    setMatchedCards([])
    setCurrentPlayerIndex(0)
    setScores({})
    setMoves(0)
    play('click')
  }

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">記憶配對</h1>
          </div>
          <p className="text-white/80 mb-6">翻牌配對遊戲，考驗你的記憶力！</p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-white font-medium">遊戲規則：</p>
            <ul className="text-white/80 text-sm mt-2 text-left">
              <li>• 翻開兩張牌，如果相同則配對成功</li>
              <li>• 配對成功得1分，配對失敗換下一位玩家</li>
              <li>• 總共6對水果牌</li>
              <li>• 得分最高者獲勝</li>
            </ul>
          </div>
          
          <button 
            onClick={initializeGame}
            className="games-touch-target w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 text-lg rounded-xl font-bold"
          >
            開始遊戲
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <p className="text-sm">目前玩家</p>
                <p className="text-xl font-bold text-blue-400">{currentPlayer}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{moves}</p>
                <p className="text-sm text-white/60">回合數</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              {players.map((player, index) => (
                <div key={player} className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentPlayer === player 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {player}: {scores[player] || 0}分
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {cards.map((card, index) => {
              const isFlipped = flippedCards.includes(index)
              const isMatched = matchedCards.includes(index)
              
              return (
                <div 
                  key={index}
                  onClick={() => flipCard(index)}
                  className={`aspect-square rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-center text-4xl ${
                    isMatched 
                      ? 'bg-green-500/30 border-2 border-green-400' 
                      : isFlipped 
                        ? 'bg-white/20 border-2 border-white/40' 
                        : 'bg-white/10 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {(isFlipped || isMatched) ? card.emoji : '?'}
                </div>
              )
            })}
          </div>

          <div className="text-center mt-6">
            <p className="text-white/80">
              已配對：{matchedCards.length / 2} / {cards.length / 2}
            </p>
            <div className="w-full bg-white/10 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(matchedCards.length / cards.length) * 100}%` }}
              />
            </div>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">遊戲結果</h1>
          </div>
          
          <div className="text-center mb-6">
            <p className="text-white">總回合數：{moves}</p>
            <p className="text-white/80 mt-2">最快配對：{Math.min(...Object.values(scores))} 回合</p>
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
            className="games-touch-target w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-xl font-bold"
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