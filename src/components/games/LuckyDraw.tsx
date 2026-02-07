'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const FORTUNES = [
  { text: '大吉', drink: 0, emoji: '🎊', color: 'text-yellow-400' },
  { text: '中吉', drink: 0, emoji: '✨', color: 'text-green-400' },
  { text: '小吉', drink: 1, emoji: '🍀', color: 'text-green-300' },
  { text: '吉', drink: 1, emoji: '😊', color: 'text-blue-400' },
  { text: '末吉', drink: 2, emoji: '🙂', color: 'text-blue-300' },
  { text: '凶', drink: 3, emoji: '😰', color: 'text-orange-400' },
  { text: '大凶', drink: 5, emoji: '💀', color: 'text-red-500' },
]

export default function LuckyDraw() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  
  const [round, setRound] = useState(1)
  const [totalDrinks, setTotalDrinks] = useState<Record<string, number>>({})
  const [currentFortune, setCurrentFortune] = useState<typeof FORTUNES[0] | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [phase, setPhase] = useState<'waiting' | 'result'>('waiting')

  const players = contextPlayers.length > 0 ? contextPlayers : ['玩家1', '玩家2']
  const currentPlayer = players[(round - 1) % players.length]

  const draw = useCallback(() => {
    setDrawing(true)
    play('click')

    let count = 0
    const interval = setInterval(() => {
      setCurrentFortune(FORTUNES[Math.floor(Math.random() * FORTUNES.length)])
      count++
      if (count >= 15) {
        clearInterval(interval)
        const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)]
        setCurrentFortune(fortune)
        setTotalDrinks(d => ({ ...d, [currentPlayer]: (d[currentPlayer] || 0) + fortune.drink }))
        setDrawing(false)
        setPhase('result')
        if (fortune.drink > 0) play('wrong')
        else play('win')
      }
    }, 80)
  }, [currentPlayer, play])

  const nextRound = () => {
    setRound(r => r + 1)
    setPhase('waiting')
    setCurrentFortune(null)
  }

  const resetGame = () => {
    setRound(1)
    setTotalDrinks({})
    setPhase('waiting')
    setCurrentFortune(null)
  }

  const resultText = players.map(p => `${p}: ${totalDrinks[p] || 0}口`).join('、')

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main">
      <GameRules rules="抽籤決定運勢！凶籤要喝酒！" rulesKey="lucky-draw.rules" />

      <AnimatePresence mode="wait">
        {phase === 'waiting' && !drawing && (
          <motion.div key="waiting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }} className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-white">第 {round} 回合</h2>
            <p className="text-white/80">{currentPlayer} 的回合</p>
            <div className="text-6xl">🎋</div>
            <button onClick={draw} className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-2xl text-white font-bold text-xl transition-colors">抽籤</button>
          </motion.div>
        )}

        {drawing && currentFortune && (
          <motion.div key="drawing" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.2, repeat: Infinity }} className="flex flex-col items-center gap-4">
            <div className="text-8xl">{currentFortune.emoji}</div>
            <div className={`text-4xl font-bold ${currentFortune.color}`}>{currentFortune.text}</div>
          </motion.div>
        )}

        {phase === 'result' && currentFortune && !drawing && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }} className="flex flex-col items-center gap-4">
            <div className="text-8xl">{currentFortune.emoji}</div>
            <div className={`text-5xl font-bold ${currentFortune.color}`}>{currentFortune.text}</div>
            <div className="text-white/80 text-xl">
              {currentFortune.drink > 0 ? `喝 ${currentFortune.drink} 口！` : '免喝！恭喜！'}
            </div>
            <div className="text-white mt-4">{players.map(p => <span key={p} className="mx-2">{p}: 累計{totalDrinks[p] || 0}口</span>)}</div>
            <div className="flex gap-4 mt-4">
              <button onClick={nextRound} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-bold transition-colors">下一回合</button>
              <button onClick={resetGame} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors">重新開始</button>
            </div>
            <CopyResultButton text={`幸運抽抽 ${resultText}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
