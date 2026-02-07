'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, RotateCcw, Check, X } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

const DARE_CARDS = [
  { dare: '模仿一種動物叫三聲', penalty: 1 },
  { dare: '用腳趾頭夾起一個物品', penalty: 1 },
  { dare: '對著鏡子說「我愛你」三次', penalty: 1 },
  { dare: '讓右邊的人餵你喝一口酒', penalty: 2 },
  { dare: '用屁股寫出自己的名字', penalty: 1 },
  { dare: '學一個在場的人的招牌動作', penalty: 1 },
  { dare: '打電話給最近聯絡的人說「我想你」', penalty: 3 },
  { dare: '讓別人用手機拍一張醜照', penalty: 2 },
  { dare: '說出三個你的缺點', penalty: 1 },
  { dare: '做十個深蹲', penalty: 1 },
  { dare: '用歌聲自我介紹', penalty: 1 },
  { dare: '讓對面的人彈額頭', penalty: 2 },
  { dare: '說一個你的尷尬經歷', penalty: 1 },
  { dare: '閉眼旋轉五圈', penalty: 1 },
  { dare: '用舌頭舔自己的鼻子（或嘗試）', penalty: 1 },
  { dare: '即興表演30秒的舞蹈', penalty: 2 },
  { dare: '說出你手機相簿裡最近的照片是什麼', penalty: 2 },
  { dare: '用方言說一段繞口令', penalty: 1 },
  { dare: '讓左邊的人在你臉上畫東西', penalty: 3 },
  { dare: '對在場的人每人說一句誇獎', penalty: 1 },
]

/** G2.19-G2.20：大膽挑戰 - 抽挑戰卡，完成或喝酒 */
export default function DareCards() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0)
  const [currentDare, setCurrentDare] = useState<typeof DARE_CARDS[0] | null>(null)
  const [usedDares, setUsedDares] = useState<Set<number>>(new Set())
  const [result, setResult] = useState<'complete' | 'drink' | null>(null)
  const [history, setHistory] = useState<Array<{ player: string; dare: string; completed: boolean }>>([])

  const currentPlayer = players[currentPlayerIdx]

  const getNextDare = useCallback(() => {
    const available = DARE_CARDS.map((_, i) => i).filter(i => !usedDares.has(i))
    if (available.length === 0) {
      setUsedDares(new Set())
      return DARE_CARDS[Math.floor(Math.random() * DARE_CARDS.length)]
    }
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsedDares(prev => new Set([...prev, idx]))
    return DARE_CARDS[idx]
  }, [usedDares])

  const drawCard = useCallback(() => {
    play('click')
    setCurrentDare(getNextDare())
    setResult(null)
  }, [getNextDare, play])

  const complete = useCallback(() => {
    play('correct')
    setResult('complete')
    setHistory(prev => [...prev, { player: currentPlayer, dare: currentDare!.dare, completed: true }])
  }, [currentPlayer, currentDare, play])

  const drink = useCallback(() => {
    play('wrong')
    setResult('drink')
    setHistory(prev => [...prev, { player: currentPlayer, dare: currentDare!.dare, completed: false }])
  }, [currentPlayer, currentDare, play])

  const nextPlayer = useCallback(() => {
    setCurrentPlayerIdx((currentPlayerIdx + 1) % players.length)
    setCurrentDare(null)
    setResult(null)
  }, [currentPlayerIdx, players.length])

  const resetGame = useCallback(() => {
    setCurrentPlayerIdx(0)
    setCurrentDare(null)
    setUsedDares(new Set())
    setResult(null)
    setHistory([])
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
      <GameRules rules={`抽一張挑戰卡！\n完成挑戰或喝相應杯數！\n越難的挑戰，喝酒懲罰越多！`} />
      
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-bold text-white">大膽挑戰</h2>
      </div>

      <p className="text-white/70 mb-4">輪到 <span className="text-yellow-400 font-bold">{currentPlayer}</span></p>

      {!currentDare ? (
        <motion.button whileTap={{ scale: 0.96 }} onClick={drawCard} className="px-8 py-6 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xl games-focus-ring">
          抽挑戰卡！
        </motion.button>
      ) : result === null ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <motion.div
            initial={{ rotateY: 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full p-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-center"
          >
            <p className="text-white text-xl font-medium">{currentDare.dare}</p>
            <p className="text-white/50 mt-2 text-sm">放棄懲罰：喝 {currentDare.penalty} 杯</p>
          </motion.div>

          <div className="flex gap-4">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={complete}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold games-focus-ring"
            >
              <Check className="w-5 h-5" /> 完成！
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={drink}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-bold games-focus-ring"
            >
              <X className="w-5 h-5" /> 喝酒！
            </motion.button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          {result === 'complete' ? (
            <p className="text-emerald-400 font-bold text-2xl">挑戰成功！👏</p>
          ) : (
            <p className="text-red-400 font-bold text-2xl">{currentPlayer} 喝 {currentDare.penalty} 杯！</p>
          )}
          <div className="flex gap-3 mt-4 justify-center">
            <button onClick={nextPlayer} className="px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring">下一位</button>
            <CopyResultButton text={`大膽挑戰：${currentDare.dare}\n${currentPlayer} ${result === 'complete' ? '完成挑戰' : `喝了 ${currentDare.penalty} 杯`}`} />
          </div>
        </motion.div>
      )}

      {history.length > 0 && (
        <div className="absolute bottom-4 left-4 text-white/30 text-xs max-h-24 overflow-auto">
          {history.slice(-3).map((h, i) => (
            <div key={i}>{h.player}: {h.completed ? '✓' : '🍺'}</div>
          ))}
        </div>
      )}

      <button onClick={resetGame} className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring">
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
