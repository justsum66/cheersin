'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/contexts/I18nContext'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const ITEMS = [
  { name: '一杯珍珠奶茶', price: 55, emoji: '🧋' },
  { name: '一瓶台灣啤酒', price: 35, emoji: '🍺' },
  { name: '一杯星巴克拿鐵', price: 150, emoji: '☕' },
  { name: '一份雞排', price: 70, emoji: '🍗' },
  { name: '一碗滷肉飯', price: 40, emoji: '🍚' },
  { name: '一瓶威士忌（百齡罈）', price: 650, emoji: '🥃' },
  { name: '一盒壽司（超商）', price: 85, emoji: '🍱' },
  { name: '一支冰淇淋', price: 45, emoji: '🍦' },
  { name: '一包洋芋片', price: 39, emoji: '🥔' },
  { name: '一杯手搖飲（大杯）', price: 65, emoji: '🥤' },
  { name: '一份臭豆腐', price: 50, emoji: '🧀' },
  { name: '一串烤肉串', price: 30, emoji: '🍢' },
]

export default function PriceGuess() {
  const { t } = useTranslation()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [currentItem, setCurrentItem] = useState<typeof ITEMS[0] | null>(null)
  const [guess, setGuess] = useState('')
  const [phase, setPhase] = useState<'waiting' | 'guessing' | 'result'>('waiting')

  const players = contextPlayers.length > 0 ? contextPlayers : ['玩家1', '玩家2']
  const currentPlayer = players[(round - 1) % players.length]

  const startRound = useCallback(() => {
    const item = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    setCurrentItem(item)
    setGuess('')
    setPhase('guessing')
    play('click')
  }, [play])

  const submitGuess = () => {
    if (!currentItem) return
    const guessNum = parseInt(guess) || 0
    const diff = Math.abs(guessNum - currentItem.price)
    const accuracy = Math.max(0, 100 - (diff / currentItem.price) * 100)
    
    if (accuracy >= 70) {
      setScores(s => ({ ...s, [currentPlayer]: (s[currentPlayer] || 0) + 1 }))
      play('correct')
    } else {
      play('wrong')
    }
    setPhase('result')
  }

  const nextRound = () => {
    setRound(r => r + 1)
    setPhase('waiting')
  }

  const resetGame = () => {
    setRound(1)
    setScores({})
    setPhase('waiting')
  }

  const getAccuracy = () => {
    if (!currentItem) return 0
    const guessNum = parseInt(guess) || 0
    const diff = Math.abs(guessNum - currentItem.price)
    return Math.max(0, Math.round(100 - (diff / currentItem.price) * 100))
  }

  const resultText = players.map(p => `${p}: ${scores[p] || 0}分`).join('、')

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main">
      <GameRules rules="猜物品價格！誤差超過30%要喝酒！" rulesKey="price-guess.rules" />

      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <h2 className="text-2xl font-bold text-white">{t('common.turnLabel', { n: round })}</h2>
            <p className="text-white/80">{currentPlayer} 的回合</p>
            <button
              onClick={startRound}
              className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-2xl text-white font-bold text-xl transition-colors"
            >
              出題
            </button>
          </motion.div>
        )}

        {phase === 'guessing' && currentItem && (
          <motion.div
            key="guessing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="text-8xl">{currentItem.emoji}</div>
            <div className="text-2xl text-white font-bold text-center">{currentItem.name}</div>
            <div className="text-white/60">猜猜看價格是多少？（新台幣）</div>
            <div className="flex items-center gap-2">
              <span className="text-white text-2xl">$</span>
              <input
                type="number"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="0"
                className="w-32 px-4 py-3 rounded-xl bg-white/10 text-white text-center text-2xl border border-white/20 focus:border-primary-400 outline-none"
                autoFocus
              />
            </div>
            <button
              onClick={submitGuess}
              disabled={!guess}
              className="px-8 py-3 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 rounded-xl text-white font-bold transition-colors"
            >
              確認答案
            </button>
          </motion.div>
        )}

        {phase === 'result' && currentItem && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="text-6xl">{currentItem.emoji}</div>
            <div className="text-white/60">正確價格：${currentItem.price}</div>
            <div className="text-white/60">你的猜測：${guess}</div>
            <div className={`text-4xl font-bold ${getAccuracy() >= 70 ? 'text-green-400' : 'text-red-400'}`}>
              準確度：{getAccuracy()}%
            </div>
            <div className={`text-2xl font-bold ${getAccuracy() >= 70 ? 'text-green-400' : 'text-red-400'}`}>
              {getAccuracy() >= 70 ? '過關！' : '失敗！喝一口！'}
            </div>
            <div className="text-white mt-4">
              {players.map(p => (
                <span key={p} className="mx-2">{p}: {scores[p] || 0}分</span>
              ))}
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={nextRound}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-bold transition-colors"
              >
                下一回合
              </button>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors"
              >
                重新開始
              </button>
            </div>
            <CopyResultButton text={`價格猜猜 ${resultText}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
