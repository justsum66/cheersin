'use client'

import { useState, useCallback, useEffect } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { RotateCcw, Trophy, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const COMMANDS = [
  { command: '舉左手', reverse: '舉右手', icon: ArrowLeft },
  { command: '舉右手', reverse: '舉左手', icon: ArrowRight },
  { command: '舉左手', reverse: '舉右手', icon: ArrowLeft },
  { command: '舉右手', reverse: '舉左手', icon: ArrowRight },
  { command: '向上跳', reverse: '向下蹲', icon: ArrowUp },
  { command: '向下蹲', reverse: '向上跳', icon: ArrowDown },
  { command: '向前走', reverse: '向後退', icon: ArrowRight },
  { command: '向後退', reverse: '向前走', icon: ArrowLeft },
  { command: '拍手', reverse: '跺腳', icon: ArrowUp },
  { command: '跺腳', reverse: '拍手', icon: ArrowDown },
  { command: '點頭', reverse: '搖頭', icon: ArrowUp },
  { command: '搖頭', reverse: '點頭', icon: ArrowDown },
  { command: '眨眼', reverse: '睜大眼睛', icon: ArrowUp },
  { command: '睜大眼睛', reverse: '眨眼', icon: ArrowDown },
  { command: '微笑', reverse: '皺眉', icon: ArrowUp },
  { command: '皺眉', reverse: '微笑', icon: ArrowDown },
]

export default function ReverseSay() {
  const { t } = useTranslation()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup')
  const [currentCommand, setCurrentCommand] = useState<typeof COMMANDS[0] | null>(null)
  const [shouldReverse, setShouldReverse] = useState(false)
  const [playerActions, setPlayerActions] = useState<Record<string, boolean>>({})
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [mistakes, setMistakes] = useState<Record<string, number>>({})
  const [round, setRound] = useState(1)

  const players = contextPlayers.length >= 2 ? contextPlayers : ['玩家1', '玩家2', '玩家3']

  const startGame = useCallback(() => {
    const randomCommand = COMMANDS[Math.floor(Math.random() * COMMANDS.length)]
    const reverse = Math.random() > 0.5
    setCurrentCommand(randomCommand)
    setShouldReverse(reverse)
    setPlayerActions({})
    setCurrentPlayerIndex(0)
    setGameState('playing')
    play('click')
  }, [play])

  const submitAction = useCallback((player: string, correct: boolean) => {
    setPlayerActions(prev => ({ ...prev, [player]: correct }))
    
    if (correct) {
      setScores(prev => ({ ...prev, [player]: (prev[player] || 0) + 1 }))
      play('correct')
    } else {
      setMistakes(prev => ({ ...prev, [player]: (prev[player] || 0) + 1 }))
      play('wrong')
    }
    
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1)
    } else {
      setGameState('results')
      play('win')
    }
  }, [currentPlayerIndex, players.length, play])

  const nextRound = useCallback(() => {
    setRound(prev => prev + 1)
    startGame()
  }, [startGame])

  const resetGame = useCallback(() => {
    setRound(1)
    setScores({})
    setMistakes({})
    setGameState('setup')
    setCurrentCommand(null)
    setPlayerActions({})
  }, [])

  const currentPlayer = players[currentPlayerIndex]
  const displayCommand = shouldReverse ? currentCommand?.reverse : currentCommand?.command

  const resultText = `反向指令 - 第${round}回合\n${players.map(p => `${p}: ${scores[p] || 0}分 (${mistakes[p] || 0}錯)`).join('\n')}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto text-center">
        <m.h1 
          className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          反向指令
        </m.h1>
        <p className="text-white/80 mb-8">聽指令做相反動作！</p>

        <GameRules 
          rules="遊戲規則：
1. 系統會給出一個指令
2. 有50%機率需要做相反的動作
3. 玩家需要判斷是否要反向執行
4. 做對得分，做錯扣分
5. 所有玩家輪流作答
6. 最終得分最高者獲勝"
        />

        <AnimatePresence mode="wait">
          {gameState === 'setup' && (
            <m.div
              key="setup"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="text-6xl mb-6">🔄</div>
              <h2 className="text-2xl font-bold mb-4">準備開始</h2>
              <p className="text-white/80 mb-6">測試你的反應力！</p>
              <div className="mb-6">
                <p className="text-lg font-bold text-indigo-400">參與玩家：</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {players.map((player, index) => (
                    <span key={index} className="px-3 py-1 bg-indigo-500/20 rounded-full text-sm">
                      {player}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={startGame}
                className="games-touch-target px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                開始遊戲
              </button>
            </m.div>
          )}

          {gameState === 'playing' && currentCommand && (
            <m.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-indigo-400">{t('common.turnLabel', { n: round })}</h2>
                <p className="text-lg mb-4">目前玩家：{currentPlayer}</p>
                <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg p-6">
                  <p className="text-3xl font-bold text-center mb-4">
                    {displayCommand}
                  </p>
                  <div className="flex justify-center">
                    {currentCommand.icon && (
                      <currentCommand.icon className="w-12 h-12 text-indigo-400" />
                    )}
                  </div>
                  <p className="text-center text-white/80 mt-4">
                    {shouldReverse ? '⚠️ 需要反向執行' : '✅ 正常執行'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <m.button
                  onClick={() => submitAction(currentPlayer, !shouldReverse)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="games-touch-target py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold text-white hover:shadow-lg transition-all duration-300"
                >
                  正常執行
                </m.button>
                <m.button
                  onClick={() => submitAction(currentPlayer, shouldReverse)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="games-touch-target py-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl font-bold text-white hover:shadow-lg transition-all duration-300"
                >
                  反向執行
                </m.button>
              </div>

              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg p-4">
                <p className="text-center">
                  還需要 {players.length - Object.keys(playerActions).length} 人作答
                </p>
              </div>
            </m.div>
          )}

          {gameState === 'results' && currentCommand && (
            <m.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <Trophy className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                回合結果
              </h2>
              
              <div className="mb-6">
                <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg p-4 mb-4">
                  <p className="text-xl font-bold text-center">{displayCommand}</p>
                  <p className="text-white/80 text-center">
                    {shouldReverse ? '應該反向執行' : '應該正常執行'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {players.map((player, index) => {
                  const isCorrect = playerActions[player]
                  
                  return (
                    <m.div
                      key={player}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-white/10 rounded-lg p-4 border-l-4 ${
                        isCorrect ? 'border-green-400' : 'border-red-400'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-indigo-400">{player}</span>
                        <span className={`font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                          {isCorrect ? '✓ 正確' : '✗ 錯誤'}
                        </span>
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span>得分: {scores[player] || 0}</span>
                        <span>錯誤: {mistakes[player] || 0}</span>
                      </div>
                    </m.div>
                  )
                })}
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 text-center">累計統計</h3>
                <div className="grid grid-cols-1 gap-3">
                  {players.map((player) => (
                    <div key={player} className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-indigo-400">{player}</span>
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold">得分: {scores[player] || 0}</div>
                          <div className="text-red-400">錯誤: {mistakes[player] || 0}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={nextRound}
                  className="flex-1 games-touch-target py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-bold text-white hover:scale-105 transition-transform"
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
            </m.div>
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