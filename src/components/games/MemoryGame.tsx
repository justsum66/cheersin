'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Brain, RotateCcw, Trophy } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2']

const EMOJIS = ['🍎', '🍕', '🎸', '🚗', '⚽', '🌟', '🎂', '🐱', '🌈', '🔥', '💎', '🎁']

/** G3.5-G3.6：記憶大考驗 - 翻牌配對遊戲 */
export default function MemoryGame() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0)
  const [cards, setCards] = useState<Array<{ emoji: string; flipped: boolean; matched: boolean }>>([])
  const [selected, setSelected] = useState<number[]>([])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [gameOver, setGameOver] = useState(false)
  const [checking, setChecking] = useState(false)

  const currentPlayer = players[currentPlayerIdx]

  const initGame = useCallback(() => {
    const pairs = EMOJIS.slice(0, 6)
    const allCards = [...pairs, ...pairs]
      .sort(() => Math.random() - 0.5)
      .map(emoji => ({ emoji, flipped: false, matched: false }))
    setCards(allCards)
    setSelected([])
    setScores({})
    setGameOver(false)
    setCurrentPlayerIdx(0)
    play('click')
  }, [play])

  const flipCard = useCallback((index: number) => {
    if (checking || cards[index].flipped || cards[index].matched || selected.length >= 2) return
    
    play('click')
    const newCards = [...cards]
    newCards[index].flipped = true
    setCards(newCards)
    setSelected(prev => [...prev, index])
  }, [cards, checking, selected.length, play])

  useEffect(() => {
    if (selected.length !== 2) return
    
    setChecking(true)
    const [first, second] = selected
    
    setTimeout(() => {
      const newCards = [...cards]
      if (cards[first].emoji === cards[second].emoji) {
        // Match!
        play('correct')
        newCards[first].matched = true
        newCards[second].matched = true
        setScores(prev => ({ ...prev, [currentPlayer]: (prev[currentPlayer] || 0) + 1 }))
      } else {
        // No match
        play('wrong')
        newCards[first].flipped = false
        newCards[second].flipped = false
        setCurrentPlayerIdx((currentPlayerIdx + 1) % players.length)
      }
      setCards(newCards)
      setSelected([])
      setChecking(false)
      
      // Check if game over
      if (newCards.every(c => c.matched)) {
        setGameOver(true)
      }
    }, 1000)
  }, [selected, cards, currentPlayer, currentPlayerIdx, players.length, play])

  const getWinner = () => {
    const entries = Object.entries(scores)
    if (entries.length === 0) return null
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0]
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
      <GameRules rules={`翻開兩張牌，找到配對！\n配對成功得1分，失敗換人。\n輸家喝酒！`} />
      
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">記憶大考驗</h2>
      </div>

      {cards.length === 0 ? (
        <motion.button whileTap={{ scale: 0.96 }} onClick={initGame} className="px-8 py-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xl games-focus-ring">
          開始遊戲！
        </motion.button>
      ) : gameOver ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-yellow-400 font-bold text-2xl">遊戲結束！</p>
          <p className="text-white mt-2">贏家：<span className="text-cyan-400 font-bold">{getWinner()}</span></p>
          <div className="mt-2 text-white/50">
            {Object.entries(scores).map(([p, s]) => (
              <div key={p}>{p}: {s} 對</div>
            ))}
          </div>
          <p className="text-red-400 mt-4">輸家喝酒！</p>
          <div className="flex gap-3 mt-4 justify-center">
            <button onClick={initGame} className="px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring">再玩一次</button>
            <CopyResultButton text={`記憶大考驗：${getWinner()} 獲勝！\n${Object.entries(scores).map(([p, s]) => `${p}: ${s}對`).join('\n')}`} />
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <p className="text-white/70">輪到 <span className="text-cyan-400 font-bold">{currentPlayer}</span></p>
          
          <div className="grid grid-cols-4 gap-2">
            {cards.map((card, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.96 }}
                onClick={() => flipCard(i)}
                className={`w-14 h-14 rounded-xl text-2xl flex items-center justify-center games-focus-ring transition-all ${
                  card.matched ? 'bg-emerald-500/30 text-emerald-400' :
                  card.flipped ? 'bg-white text-black' :
                  'bg-white/10 border border-white/20 text-white/20'
                }`}
                disabled={card.flipped || card.matched || checking}
              >
                {card.flipped || card.matched ? card.emoji : '?'}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-4 mt-4 text-sm">
            {players.map(p => (
              <div key={p} className={`px-3 py-1 rounded-lg ${p === currentPlayer ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-white/50'}`}>
                {p}: {scores[p] || 0}
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={initGame} className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring">
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
