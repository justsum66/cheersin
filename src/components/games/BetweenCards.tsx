'use client'

import { useState, useCallback } from 'react'
import { m } from 'framer-motion'
import { Spade, RotateCcw } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2']
const CARD_VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const getCardValue = (card: string) => CARD_VALUES.indexOf(card) + 1

/** G2.3-G2.4：射龍門 - 猜中間的牌是否在兩張牌之間 */
export default function BetweenCards() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0)
  const [card1, setCard1] = useState<string | null>(null)
  const [card2, setCard2] = useState<string | null>(null)
  const [middleCard, setMiddleCard] = useState<string | null>(null)
  const [result, setResult] = useState<'win' | 'lose' | 'post' | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})

  const currentPlayer = players[currentPlayerIdx]

  const drawCards = useCallback(() => {
    play('click')
    const c1 = CARD_VALUES[Math.floor(Math.random() * 13)]
    let c2 = CARD_VALUES[Math.floor(Math.random() * 13)]
    while (c2 === c1) c2 = CARD_VALUES[Math.floor(Math.random() * 13)]
    setCard1(c1)
    setCard2(c2)
    setMiddleCard(null)
    setResult(null)
  }, [play])

  const revealMiddle = useCallback(() => {
    play('click')
    const mid = CARD_VALUES[Math.floor(Math.random() * 13)]
    setMiddleCard(mid)
    
    const v1 = getCardValue(card1!)
    const v2 = getCardValue(card2!)
    const vMid = getCardValue(mid)
    const low = Math.min(v1, v2)
    const high = Math.max(v1, v2)
    
    if (vMid === v1 || vMid === v2) {
      // 撞柱
      setResult('post')
      play('wrong')
    } else if (vMid > low && vMid < high) {
      setResult('win')
      play('correct')
      setScores(prev => ({ ...prev, [currentPlayer]: (prev[currentPlayer] || 0) + 1 }))
    } else {
      setResult('lose')
      play('wrong')
    }
  }, [card1, card2, currentPlayer, play])

  const nextPlayer = useCallback(() => {
    setCurrentPlayerIdx((currentPlayerIdx + 1) % players.length)
    setCard1(null)
    setCard2(null)
    setMiddleCard(null)
    setResult(null)
  }, [currentPlayerIdx, players.length])

  const resetGame = useCallback(() => {
    setCurrentPlayerIdx(0)
    setCard1(null)
    setCard2(null)
    setMiddleCard(null)
    setResult(null)
    setScores({})
  }, [])

  const renderCard = (card: string | null, label: string) => (
    <div className={`w-20 h-28 rounded-xl flex items-center justify-center text-2xl font-bold ${card ? 'bg-white text-black' : 'bg-white/10 border-2 border-dashed border-white/30 text-white/30'}`}>
      {card || label}
    </div>
  )

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
      <GameRules rules={`抽兩張牌，猜第三張是否在中間。\n猜中安全，猜錯或撞柱（相同）喝雙倍！`} />
      
      <div className="flex items-center gap-2 mb-4">
        <Spade className="w-6 h-6 text-white" />
        <h2 className="text-xl font-bold text-white">射龍門</h2>
      </div>

      <p className="text-white/70 mb-4">輪到 <span className="text-primary-400 font-bold">{currentPlayer}</span></p>

      <div className="flex gap-4 mb-6">
        {renderCard(card1, '?')}
        {renderCard(middleCard, '中')}
        {renderCard(card2, '?')}
      </div>

      {!card1 && (
        <m.button whileTap={{ scale: 0.96 }} onClick={drawCards} className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold games-focus-ring">
          抽兩張牌
        </m.button>
      )}

      {card1 && !middleCard && (
        <div className="text-center">
          <p className="text-white/50 mb-4">範圍：{card1} ~ {card2}</p>
          <m.button whileTap={{ scale: 0.96 }} onClick={revealMiddle} className="px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold games-focus-ring">
            翻開中間牌！
          </m.button>
        </div>
      )}

      {result && (
        <m.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mt-4">
          {result === 'win' && <p className="text-emerald-400 font-bold text-2xl">過關！安全</p>}
          {result === 'lose' && <p className="text-red-400 font-bold text-2xl">沒過！{currentPlayer} 喝！</p>}
          {result === 'post' && <p className="text-red-400 font-bold text-2xl">撞柱！{currentPlayer} 喝雙倍！</p>}
          <CopyResultButton text={`射龍門：${card1} ~ ${card2}，中間 ${middleCard}，${result === 'win' ? '過關' : result === 'post' ? '撞柱喝雙倍' : '沒過喝酒'}`} />
          <button onClick={nextPlayer} className="mt-4 px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring">下一位</button>
        </m.div>
      )}

      <button onClick={resetGame} className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring">
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
