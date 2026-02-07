'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, RotateCcw, Trophy, PenTool } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const STORY_STARTERS = [
  '從前有一隻...',
  '在一個遙遠的國度...',
  '有一天，小明...',
  '深夜時分...',
  '在森林深處...',
  '當暴風雨來臨時...',
  '在古老的城堡裡...',
  '神奇的事情發生了...',
  '突然間...',
  '大家都驚呆了...',
  '沒有人能想到...',
  '就在這時...',
  '傳說中...',
  '很久很久以前...',
  '在未來的世界...',
]

export default function StoryChain() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup')
  const [storyParts, setStoryParts] = useState<string[]>([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [round, setRound] = useState(1)
  const [newPart, setNewPart] = useState('')

  const players = contextPlayers.length >= 2 ? contextPlayers : ['玩家1', '玩家2', '玩家3']

  const startGame = useCallback(() => {
    const starter = STORY_STARTERS[Math.floor(Math.random() * STORY_STARTERS.length)]
    setStoryParts([starter])
    setCurrentPlayerIndex(0)
    setGameState('playing')
    setNewPart('')
    play('click')
  }, [play])

  const addStoryPart = useCallback(() => {
    if (!newPart.trim()) return
    
    const updatedStory = [...storyParts, newPart.trim()]
    setStoryParts(updatedStory)
    setNewPart('')
    
    // Score based on creativity (length and uniqueness)
    const score = Math.min(newPart.trim().length, 50) // Max 50 points per part
    setScores(prev => ({ ...prev, [players[currentPlayerIndex]]: (prev[players[currentPlayerIndex]] || 0) + score }))
    
    if (updatedStory.length >= players.length * 2) { // 2 rounds per player
      setGameState('results')
      play('win')
    } else {
      setCurrentPlayerIndex((prev) => (prev + 1) % players.length)
      play('correct')
    }
  }, [newPart, storyParts, currentPlayerIndex, players, play])

  const nextRound = useCallback(() => {
    setRound(prev => prev + 1)
    startGame()
  }, [startGame])

  const resetGame = useCallback(() => {
    setRound(1)
    setScores({})
    setGameState('setup')
    setStoryParts([])
    setNewPart('')
  }, [])

  const currentPlayer = players[currentPlayerIndex]
  const nextPlayer = players[(currentPlayerIndex + 1) % players.length]

  const resultText = `故事接龍 - 第${round}回合\n${players.map(p => `${p}: ${scores[p] || 0}分`).join('\n')}\n\n完整故事：\n${storyParts.join(' ')}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto text-center">
        <motion.h1 
          className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          故事接龍
        </motion.h1>
        <p className="text-white/80 mb-8">發揮創意，共同編織精彩故事！</p>

        <GameRules 
          rules="遊戲規則：
1. 系統給出故事開頭
2. 玩家輪流接續故事
3. 每人每次添加一句話
4. 根據創意和長度計分
5. 完成兩輪後評分
6. 最終得分最高者獲勝"
        />

        <AnimatePresence mode="wait">
          {gameState === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <BookOpen className="w-16 h-16 mx-auto mb-6 text-green-400" />
              <h2 className="text-2xl font-bold mb-4">準備開始</h2>
              <p className="text-white/80 mb-6">讓我們一起創作精彩故事！</p>
              <div className="mb-6">
                <p className="text-lg font-bold text-green-400">參與玩家：</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {players.map((player, index) => (
                    <span key={index} className="px-3 py-1 bg-green-500/20 rounded-full text-sm">
                      {player}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={startGame}
                className="games-touch-target px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                開始遊戲
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-green-400">第 {round} 回合</h2>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-white/60">目前玩家</p>
                    <p className="text-xl font-bold text-green-400">{currentPlayer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">下一位</p>
                    <p className="text-xl font-bold text-teal-400">{nextPlayer}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-lg p-4">
                <p className="text-white/80 mb-2">當前故事：</p>
                <div className="bg-black/20 rounded-lg p-4 text-left">
                  {storyParts.map((part, index) => (
                    <span key={index} className={`${index === storyParts.length - 1 ? 'text-yellow-400 font-bold' : 'text-white/80'}`}>
                      {part}
                      {index < storyParts.length - 1 && ' '}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <textarea
                  value={newPart}
                  onChange={(e) => setNewPart(e.target.value)}
                  placeholder="接續故事..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white text-lg border border-white/20 focus:border-green-400 outline-none min-h-[100px] resize-none"
                  autoFocus
                />
                <button
                  onClick={addStoryPart}
                  disabled={!newPart.trim()}
                  className="games-touch-target w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl font-bold text-white hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <PenTool className="w-5 h-5 inline mr-2" />
                  添加故事
                </button>
              </div>

              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(storyParts.length / (players.length * 2)) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-center text-white/80 mt-2">
                第 {storyParts.length} / {players.length * 2} 段
              </p>
            </motion.div>
          )}

          {gameState === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <Trophy className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                故事完成
              </h2>
              
              <div className="mb-6">
                <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-lg p-4 mb-4">
                  <p className="text-xl font-bold text-center mb-4">完整故事</p>
                  <div className="bg-black/20 rounded-lg p-4 text-left max-h-40 overflow-y-auto">
                    {storyParts.map((part, index) => (
                      <span key={index} className="text-white">
                        {part}
                        {index < storyParts.length - 1 && ' '}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 text-center">創意得分</h3>
                <div className="space-y-3">
                  {players.map((player, index) => (
                    <motion.div
                      key={player}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-green-400">{player}</span>
                        <span className="text-2xl font-bold text-yellow-400">{scores[player] || 0}分</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={nextRound}
                  className="flex-1 games-touch-target py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl font-bold text-white hover:scale-105 transition-transform"
                >
                  下一回合
                </button>
                <button
                  onClick={resetGame}
                  className="flex-1 games-touch-target py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium"
                >
                  <RotateCcw className="w-5 h-5 inline mr-2" />
                  重新開始
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6">
          <CopyResultButton 
            text={resultText}
            label="複製結果"
            className="w-full games-touch-target py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium"
          />
        </div>
      </div>
    </div>
  )
}