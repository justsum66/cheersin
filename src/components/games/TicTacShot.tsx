'use client'

import { useState, useCallback } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Target, RotateCcw, Trophy, X, Circle } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { DrinkingAnimation } from './DrinkingAnimation'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6] // diagonals
]

export default function TicTacShot() {
  const { t } = useTranslation()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [winner, setWinner] = useState<string | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [round, setRound] = useState(1)

  const players = contextPlayers.length >= 2 ? contextPlayers : ['玩家1', '玩家2']
  const currentPlayerName = players[currentPlayer]
  const currentPlayerSymbol = currentPlayer === 0 ? '_shot' : 'safe'

  const checkWinner = useCallback((boardState: (string | null)[]) => {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return boardState[a]
      }
    }
    return null
  }, [])

  const isBoardFull = useCallback((boardState: (string | null)[]) => {
    return boardState.every(cell => cell !== null)
  }, [])

  const handleCellClick = useCallback((index: number) => {
    if (board[index] || winner || gameOver) return

    const newBoard = [...board]
    newBoard[index] = currentPlayerSymbol
    setBoard(newBoard)

    const newWinner = checkWinner(newBoard)
    if (newWinner) {
      setWinner(newWinner)
      setGameOver(true)
      setScores(prev => ({
        ...prev,
        [currentPlayerName]: (prev[currentPlayerName] || 0) + 1
      }))
      play('win')
    } else if (isBoardFull(newBoard)) {
      setGameOver(true)
      play('wrong')
    } else {
      setCurrentPlayer((prev) => (prev + 1) % players.length)
      play('click')
    }
  }, [board, currentPlayerSymbol, winner, gameOver, checkWinner, isBoardFull, currentPlayerName, players.length, play])

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer(0)
    setWinner(null)
    setGameOver(false)
    play('click')
  }, [play])

  const nextRound = useCallback(() => {
    setRound(prev => prev + 1)
    resetGame()
  }, [resetGame])

  const resetAll = useCallback(() => {
    setRound(1)
    setScores({})
    resetGame()
  }, [resetGame])

  const getCellContent = (value: string | null) => {
    if (value === '_shot') return <Target className="w-8 h-8 text-red-400" />
    if (value === 'safe') return <Circle className="w-8 h-8 text-blue-400" />
    return null
  }

  const resultText = `井字射擊 - 第${round}回合\n${players.map(p => `${p}: ${scores[p] || 0}勝`).join('\n')}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto text-center">
        <m.h1 
          className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          井字射擊
        </m.h1>
        <p className="text-white/80 mb-6">射中目標獲勝，射空安全！</p>

        <GameRules 
          rules="遊戲規則：
1. 兩位玩家輪流射擊
2. 玩家1使用「射擊」標記 (🎯)
3. 玩家2使用「安全」標記 (○)
4. 先連成三線的玩家獲勝
5. 射中三連線獲勝，安全防禦也計分
6. 平局時雙方都需喝一杯"
        />

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-left">
              <p className="text-sm text-white/60">回合</p>
              <p className="text-xl font-bold text-purple-400">{t('common.turnLabel', { n: round })}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/60">目前玩家</p>
              <p className={`text-xl font-bold ${currentPlayer === 0 ? 'text-red-400' : 'text-blue-400'}`}>
                {currentPlayerName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/60">得分</p>
              <div className="text-sm">
                {players.map(player => (
                  <div key={player} className="font-bold">
                    {player}: <span className="text-yellow-400">{scores[player] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
          <div className="grid grid-cols-3 gap-3">
            {board.map((cell, index) => (
              <m.button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={cell !== null || winner !== null || gameOver}
                className={`
                  aspect-square rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-300
                  ${cell === '_shot' ? 'border-red-400 bg-red-400/20' : ''}
                  ${cell === 'safe' ? 'border-blue-400 bg-blue-400/20' : ''}
                  ${cell === null && !winner && !gameOver ? 'border-white/30 bg-white/10 hover:bg-white/20 hover:border-white/50 cursor-pointer' : 'border-white/20 cursor-not-allowed'}
                `}
                whileHover={!cell && !winner && !gameOver ? { scale: 1.05 } : {}}
                whileTap={!cell && !winner && !gameOver ? { scale: 0.95 } : {}}
              >
                {getCellContent(cell)}
              </m.button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {winner && (
            <m.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6"
            >
              <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-2xl font-bold mb-2">
                {winner === '_shot' ? '射擊獲勝！' : '安全防禦成功！'}
              </h2>
              <p className="text-lg mb-4">
                {winner === '_shot' 
                  ? `${players[0]} 射中目標！其他人喝一杯！` 
                  : `${players[1]} 成功防禦！${players[0]} 喝一杯！`}
              </p>
              {!reducedMotion && <DrinkingAnimation duration={1.2} className="my-3 mx-auto mb-4" />}
              <div className="flex gap-4">
                <button
                  onClick={nextRound}
                  className="flex-1 games-touch-target py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white hover:scale-105 transition-transform"
                >
                  下一回合
                </button>
                <button
                  onClick={resetAll}
                  className="flex-1 games-touch-target py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium"
                >
                  <RotateCcw className="w-5 h-5 inline mr-2" />
                  重新開始
                </button>
              </div>
            </m.div>
          )}

          {gameOver && !winner && (
            <m.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gradient-to-r from-gray-500/20 to-gray-600/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6"
            >
              <div className="text-2xl font-bold mb-4 text-gray-300">平局！</div>
              <p className="text-lg mb-4">雙方都需喝一杯！</p>
              {!reducedMotion && <DrinkingAnimation duration={1.2} className="my-3 mx-auto mb-4" />}
              <div className="flex gap-4">
                <button
                  onClick={nextRound}
                  className="flex-1 games-touch-target py-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl font-bold text-white hover:scale-105 transition-transform"
                >
                  下一回合
                </button>
                <button
                  onClick={resetAll}
                  className="flex-1 games-touch-target py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium"
                >
                  <RotateCcw className="w-5 h-5 inline mr-2" />
                  重新開始
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {!gameOver && !winner && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <p className="text-center">
              {currentPlayer === 0 
                ? '🎯 輪到射擊玩家，選擇目標位置' 
                : '○ 輪到防禦玩家，選擇安全位置'}
            </p>
          </div>
        )}

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