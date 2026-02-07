'use client'

import { useState, useEffect, useRef } from 'react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { Target, RotateCcw, Trophy, Play } from 'lucide-react'

const CUPS_LAYOUT = [
  [0, 0, 0, 0],
  [0, 0, 0],
  [0, 0],
  [0]
]

export default function BeerPongVR() {
  const players = useGamesPlayers()
  const { play } = useGameSound()
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup')
  const [attackingTeam, setAttackingTeam] = useState(0)
  const [defendingTeam, setDefendingTeam] = useState(1)
  const [attackingCups, setAttackingCups] = useState(CUPS_LAYOUT.map(row => [...row]))
  const [defendingCups, setDefendingCups] = useState(CUPS_LAYOUT.map(row => [...row]))
  const [balls, setBalls] = useState(3)
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [isShooting, setIsShooting] = useState(false)

  // 遊戲初始化
  const initializeGame = () => {
    setGameState('playing')
    setAttackingTeam(0)
    setDefendingTeam(1)
    setAttackingCups(CUPS_LAYOUT.map(row => [...row]))
    setDefendingCups(CUPS_LAYOUT.map(row => [...row]))
    setBalls(3)
    setRound(1)
    setScores({})
    setIsShooting(false)
    play('click')
  }

  // 投球
  const shootBall = (row: number, col: number) => {
    if (isShooting || balls <= 0) return
    
    setIsShooting(true)
    play('click')
    
    // 模擬投球動畫
    setTimeout(() => {
      const hit = Math.random() > 0.3 // 70% 命中率
      
      if (hit) {
        // 命中杯子
        const newCups = [...defendingCups]
        if (newCups[row] && newCups[row][col] === 0) {
          newCups[row][col] = 1
          setDefendingCups(newCups)
          setScores(prev => ({
            ...prev,
            [players[attackingTeam]]: (prev[players[attackingTeam]] || 0) + 1
          }))
          play('correct')
        }
      } else {
        play('wrong')
      }
      
      setBalls(prev => prev - 1)
      setIsShooting(false)
      
      // 檢查是否回合結束
      if (balls <= 1) {
        setTimeout(() => {
          nextTurn()
        }, 1000)
      }
    }, 1500)
  }

  // 換邊
  const nextTurn = () => {
    setAttackingTeam(defendingTeam)
    setDefendingTeam(attackingTeam)
    setBalls(3)
    setRound(prev => prev + 1)
    
    // 檢查遊戲結束
    const totalCups = defendingCups.flat().filter(cup => cup === 1).length
    if (totalCups >= 10) {
      setGameState('results')
      play('win')
    }
  }

  // 重新開始
  const restartGame = () => {
    setGameState('setup')
    setAttackingTeam(0)
    setDefendingTeam(1)
    setAttackingCups(CUPS_LAYOUT.map(row => [...row]))
    setDefendingCups(CUPS_LAYOUT.map(row => [...row]))
    setBalls(3)
    setRound(1)
    setScores({})
    setIsShooting(false)
    play('click')
  }

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">虛擬啤酒乒乓球</h1>
          </div>
          <p className="text-white/80 mb-6">虛擬版啤酒乒乓球，精準投球擊倒對手杯子！</p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-white font-medium">遊戲規則：</p>
            <ul className="text-white/80 text-sm mt-2 text-left">
              <li>• 兩隊對戰，輪流投球</li>
              <li>• 每輪3顆球</li>
              <li>• 命中對方杯子得1分</li>
              <li>• 先擊倒10個杯子獲勝</li>
              <li>• 可以選擇杯子位置投球</li>
            </ul>
          </div>
          
          <button 
            onClick={initializeGame}
            className="games-touch-target w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg rounded-xl font-bold"
          >
            開始對戰
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4">
        <div className="max-w-6xl mx-auto">
          {/* 遊戲資訊 */}
          <div className="bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <p className="text-sm">第 {round} 回合</p>
                <p className="text-xl font-bold text-blue-400">
                  {players[attackingTeam]} 隊進攻
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{balls}</div>
                <p className="text-white/60 text-sm">剩餘球數</p>
              </div>
              <div className="text-right">
                <p className="text-sm">防守方</p>
                <p className="text-xl font-bold text-purple-400">
                  {players[defendingTeam]} 隊
                </p>
              </div>
            </div>
            
            <div className="flex justify-center gap-8 mt-4">
              {players.map((player, index) => (
                <div key={player} className={`px-4 py-2 rounded-full text-sm font-medium ${
                  index === attackingTeam 
                    ? 'bg-blue-500 text-white' 
                    : index === defendingTeam
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/60'
                }`}>
                  {player}: {scores[player] || 0}分
                </div>
              ))}
            </div>
          </div>

          {/* 防守方杯子陣地 */}
          <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-6">
            <h2 className="text-xl font-bold text-white text-center mb-6">
              {players[defendingTeam]} 隊的防線
            </h2>
            
            <div className="flex flex-col items-center gap-4">
              {defendingCups.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-4">
                  {row.map((cup, colIndex) => (
                    <div
                      key={colIndex}
                      onClick={() => shootBall(rowIndex, colIndex)}
                      className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                        cup === 1
                          ? 'bg-green-500/30 border-green-400 text-green-400'
                          : isShooting
                            ? 'bg-gray-500/30 border-gray-400 text-gray-400 cursor-not-allowed'
                            : 'bg-white/10 border-white/30 hover:bg-white/20 text-white'
                      }`}
                    >
                      {cup === 1 ? '🍺' : '⭕'}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            {isShooting && (
              <div className="text-center mt-6">
                <div className="text-2xl font-bold text-yellow-400 animate-pulse">
                  投球中...
                </div>
              </div>
            )}
          </div>

          {/* 進攻方狀態 */}
          <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              {players[attackingTeam]} 隊進攻狀態
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">
                  {defendingCups.flat().filter(cup => cup === 1).length}
                </div>
                <p className="text-white/60 text-sm">已擊倒</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">{balls}</div>
                <p className="text-white/60 text-sm">剩餘球</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">
                  {10 - defendingCups.flat().filter(cup => cup === 1).length}
                </div>
                <p className="text-white/60 text-sm">還需擊倒</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'results') {
    const winner = attackingTeam
    const winnerName = players[winner]
    const totalScore = defendingCups.flat().filter(cup => cup === 1).length

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">對戰結果</h1>
          </div>
          
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">
              {winnerName} 隊獲勝！
            </h2>
            <p className="text-white/80">
              共擊倒 {totalScore} 個杯子
            </p>
          </div>
          
          <div className="space-y-4 mb-6">
            {players.map((player, index) => (
              <div key={player} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === winner ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-white font-medium">{player}</span>
                </div>
                <span className="text-white/80">{scores[player] || 0} 分</span>
              </div>
            ))}
          </div>
          
          <button 
            onClick={restartGame}
            className="games-touch-target w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold"
          >
            <RotateCcw className="w-4 h-4 mr-2 inline" />
            再來一局
          </button>
        </div>
      </div>
    )
  }

  return null
}