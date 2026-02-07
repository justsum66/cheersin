'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Flame, RotateCcw, AlertTriangle, Dice6 } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2']

const BODY_PARTS = ['嘴唇', '脖子', '耳朵', '臉頰', '額頭', '手']
const ACTIONS = ['親', '舔', '吹氣', '咬', '吸', '撫摸']
const DURATION = ['3秒', '5秒', '10秒', '直到對方說停', '慢慢地', '溫柔地']

/** G3.17-G3.18：情趣骰子 - 18+ 成人骰子遊戲 */
export default function SpicyDice() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers.slice(0, 2) : DEFAULT_PLAYERS

  const [ageVerified, setAgeVerified] = useState(false)
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState<{ bodyPart: string; action: string; duration: string } | null>(null)
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0)

  const currentPlayer = players[currentPlayerIdx]
  const targetPlayer = players[(currentPlayerIdx + 1) % players.length]

  const rollDice = useCallback(() => {
    play('click')
    setRolling(true)
    setResult(null)

    setTimeout(() => {
      const bodyPart = BODY_PARTS[Math.floor(Math.random() * BODY_PARTS.length)]
      const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)]
      const duration = DURATION[Math.floor(Math.random() * DURATION.length)]
      setResult({ bodyPart, action, duration })
      setRolling(false)
      play('correct')
      if (navigator.vibrate) navigator.vibrate(100)
    }, 1000)
  }, [play])

  const nextTurn = useCallback(() => {
    setCurrentPlayerIdx((currentPlayerIdx + 1) % players.length)
    setResult(null)
  }, [currentPlayerIdx, players.length])

  const resetGame = useCallback(() => {
    setCurrentPlayerIdx(0)
    setResult(null)
    setRolling(false)
  }, [])

  if (!ageVerified) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">🔞 18+ 限制級內容</h2>
        <p className="text-white/60 text-center mb-6">此遊戲包含成人親密內容<br />僅限成年情侶間使用<br />請確認您已年滿 18 歲</p>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setAgeVerified(true)}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold games-focus-ring"
        >
          我已年滿 18 歲，進入遊戲
        </motion.button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
      <GameRules rules={`🔞 情侶專屬骰子！\n擲骰決定要對另一半做什麼。\n拒絕執行就喝酒！`} />
      
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-6 h-6 text-red-400" />
        <h2 className="text-xl font-bold text-white">情趣骰子</h2>
      </div>

      <p className="text-white/70 mb-4">
        <span className="text-pink-400 font-bold">{currentPlayer}</span> → <span className="text-red-400 font-bold">{targetPlayer}</span>
      </p>

      {!result && !rolling && (
        <motion.button 
          whileTap={{ scale: 0.96 }} 
          onClick={rollDice} 
          className="px-12 py-8 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-2xl games-focus-ring"
        >
          <Dice6 className="w-12 h-12 mx-auto mb-2" />
          擲骰子！
        </motion.button>
      )}

      {rolling && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          🎲
        </motion.div>
      )}

      {result && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center w-full max-w-sm"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30">
            <p className="text-white/50 mb-2">動作</p>
            <p className="text-pink-400 font-bold text-2xl mb-4">{result.action}</p>
            
            <p className="text-white/50 mb-2">部位</p>
            <p className="text-red-400 font-bold text-2xl mb-4">{result.bodyPart}</p>
            
            <p className="text-white/50 mb-2">時長/方式</p>
            <p className="text-white font-bold text-xl">{result.duration}</p>
          </div>

          <p className="text-white/50 mt-4 text-sm">
            {currentPlayer} 要對 {targetPlayer} 的 {result.bodyPart} {result.action} {result.duration}
          </p>

          <div className="flex gap-3 mt-6 justify-center">
            <button onClick={nextTurn} className="px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring">執行完畢，換人</button>
            <CopyResultButton text={`情趣骰子：${currentPlayer} → ${targetPlayer}\n${result.action} ${result.bodyPart} ${result.duration}`} />
          </div>
        </motion.div>
      )}

      <button onClick={resetGame} className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring">
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
