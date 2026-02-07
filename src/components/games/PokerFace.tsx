'use client'

import { useState, useEffect } from 'react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { Smile, RotateCcw, Trophy, Eye } from 'lucide-react'

const EMOTIONS = [
  '開心', '難過', '生氣', '驚訝', '害羞', '困倦', 
  '得意', '尷尬', '無語', '興奮', '緊張', '疑惑'
]

export default function PokerFace() {
  const players = useGamesPlayers()
  const { play } = useGameSound()
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'voting' | 'results'>('setup')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [targetEmotion, setTargetEmotion] = useState('')
  const [expressions, setExpressions] = useState<Record<string, string>>({})
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})

  const currentPlayer = players[currentPlayerIndex]
  const otherPlayers = players.filter(p => p !== currentPlayer)

  // 遊戲初始化
  const initializeGame = () => {
    setGameState('playing')
    setTargetEmotion('')
    setExpressions({})
    setVotes({})
    setCurrentPlayerIndex(0)
    setRound(1)
    setScores({})
    play('click')
  }

  // 開始一輪
  const startRound = () => {
    const emotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)]
    setTargetEmotion(emotion)
    setExpressions({})
    setVotes({})
    setCurrentPlayerIndex(0)
    play('click')
  }

  // 設定表情
  const setExpression = (expression: string) => {
    setExpressions(prev => ({
      ...prev,
      [currentPlayer]: expression
    }))
    play('click')
    
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1)
    } else {
      setGameState('voting')
      setCurrentPlayerIndex(0)
    }
  }

  // 投票
  const castVote = (suspect: string) => {
    setVotes(prev => ({
      ...prev,
      [currentPlayer]: suspect
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
    const liar = players.find(player => expressions[player] !== targetEmotion)
    
    // 給分
    Object.entries(votes).forEach(([voter, suspect]) => {
      if (suspect === liar) {
        // 猜對了
        setScores(prev => ({
          ...prev,
          [voter]: (prev[voter] || 0) + 2
        }))
      } else if (suspect === '沒人說謊') {
        // 說沒人說謊但實際有人說謊
        setScores(prev => ({
          ...prev,
          [voter]: (prev[voter] || 0) + 1
        }))
      }
    })
    
    // 說謊者得分
    if (liar) {
      setScores(prev => ({
        ...prev,
        [liar]: (prev[liar] || 0) + 3
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
      setTargetEmotion('')
      setExpressions({})
      setVotes({})
      setCurrentPlayerIndex(0)
    } else {
      // 遊戲結束
      setGameState('results')
    }
    play('click')
  }

  // 重新開始
  const restartGame = () => {
    setGameState('setup')
    setTargetEmotion('')
    setExpressions({})
    setVotes({})
    setCurrentPlayerIndex(0)
    setRound(1)
    setScores({})
    play('click')
  }

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Smile className="w-8 h-8 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">撲克臉</h1>
          </div>
          <p className="text-white/80 mb-6">考驗你的表情控制能力！</p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-white font-medium">遊戲規則：</p>
            <ul className="text-white/80 text-sm mt-2 text-left">
              <li>• 每輪指定一種表情</li>
              <li>• 一人必須表現不同表情（說謊者）</li>
              <li>• 其他人要表現指定表情</li>
              <li>• 大家投票找出說謊者</li>
              <li>• 進行5輪比賽</li>
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

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <p className="text-sm">第 {round} 輪</p>
                <p className="text-xl font-bold text-indigo-400">{currentPlayer} 的回合</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm">指定表情</p>
                <p className="text-2xl font-bold text-yellow-400">{targetEmotion}</p>
              </div>
            </div>
          </div>

          {!targetEmotion ? (
            <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">準備開始</h2>
              <p className="text-white/80 mb-6">{currentPlayer} 請準備</p>
              <button 
                onClick={startRound}
                className="games-touch-target bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-8 rounded-xl font-bold"
              >
                開始此輪
              </button>
            </div>
          ) : (
            <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white text-center mb-6">
                {currentPlayer} 請表現 {targetEmotion}
              </h2>
              
              <div className="grid grid-cols-3 gap-4">
                {['開心', '難過', '生氣', '驚訝', '害羞', '困倦', '得意', '尷尬', '無語', '興奮', '緊張', '疑惑'].map((emotion) => (
                  <button
                    key={emotion}
                    onClick={() => setExpression(emotion)}
                    className={`games-touch-target aspect-square rounded-xl font-bold text-lg transition-all ${
                      expressions[currentPlayer] === emotion
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white scale-105'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (gameState === 'voting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-white text-center">投票時間</h1>
            <p className="text-white/80 text-center mt-2">請投票選出說謊者</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {otherPlayers.map((player) => (
              <div key={player} className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {player.charAt(0)}
                  </div>
                  <span className="text-white font-medium">{player}</span>
                  {currentPlayer === player && (
                    <div className="ml-auto px-2 py-1 bg-yellow-500 text-black text-xs rounded-full">
                      你的回合
                    </div>
                  )}
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">
                    {expressions[player] === '開心' ? '😊' :
                     expressions[player] === '難過' ? '😢' :
                     expressions[player] === '生氣' ? '😠' :
                     expressions[player] === '驚訝' ? '😲' :
                     expressions[player] === '害羞' ? '😊' :
                     expressions[player] === '困倦' ? '😴' :
                     expressions[player] === '得意' ? '😎' :
                     expressions[player] === '尷尬' ? '😅' :
                     expressions[player] === '無語' ? '😑' :
                     expressions[player] === '興奮' ? '🤩' :
                     expressions[player] === '緊張' ? '😰' :
                     expressions[player] === '疑惑' ? '🤔' : '😐'}
                  </div>
                  <p className="text-white/80">{expressions[player]}</p>
                </div>
                
                {currentPlayer !== player && (
                  <button 
                    onClick={() => castVote(player)}
                    className="games-touch-target w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-2 rounded-lg font-medium"
                  >
                    我認為是他
                  </button>
                )}
              </div>
            ))}
            
            <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🤔</div>
                <p className="text-white font-medium mb-4">沒有人說謊</p>
                <button 
                  onClick={() => castVote('沒人說謊')}
                  className="games-touch-target w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-2 rounded-lg font-medium"
                >
                  我認為沒人說謊
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'results') {
    const liar = players.find(player => expressions[player] !== targetEmotion)
    const sortedPlayers = [...players].sort((a, b) => 
      (scores[b] || 0) - (scores[a] || 0)
    )

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">
              {round < 5 ? '回合結果' : '最終結果'}
            </h1>
          </div>
          
          {round < 5 && (
            <div className="bg-white/10 rounded-lg p-4 mb-6 text-center">
              <p className="text-white">指定表情：{targetEmotion}</p>
              <p className="text-red-400 font-bold mt-2">
                說謊者：{liar || '無'}
              </p>
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
                  {player === liar && (
                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">說謊者</span>
                  )}
                </div>
                <span className="text-white/80">{scores[player] || 0} 分</span>
              </div>
            ))}
          </div>
          
          {round < 5 ? (
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