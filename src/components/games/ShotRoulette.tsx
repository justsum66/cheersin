'use client'

import { useState, useCallback } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Target, RefreshCw, Skull, AlertTriangle } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const SHOT_TYPES = [
  { name: '烈酒 Shot', emoji: '🥃', penalty: 1 },
  { name: '雙倍 Shot', emoji: '🥃🥃', penalty: 2 },
  { name: '調酒 Shot', emoji: '🍸', penalty: 1 },
  { name: '啤酒一杯', emoji: '🍺', penalty: 1 },
  { name: '安全！', emoji: '✨', penalty: 0 },
  { name: '反轉！指定別人喝', emoji: '🔄', penalty: -1 },
]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

export default function ShotRoulette() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<typeof SHOT_TYPES[0] | null>(null)
  const [chambersFired, setChambersFired] = useState(0)
  const [drinkCount, setDrinkCount] = useState<Record<number, number>>({})
  const [selectingTarget, setSelectingTarget] = useState(false)

  const spin = useCallback(() => {
    setSpinning(true)
    setResult(null)
    setSelectingTarget(false)
    play('click')

    // 模擬轉動
    let spins = 0
    const maxSpins = 10 + Math.floor(Math.random() * 10)
    
    const spinInterval = setInterval(() => {
      spins++
      if (spins >= maxSpins) {
        clearInterval(spinInterval)
        const shotResult = SHOT_TYPES[Math.floor(Math.random() * SHOT_TYPES.length)]
        setResult(shotResult)
        setSpinning(false)
        setChambersFired(c => c + 1)
        
        if (shotResult.penalty > 0) {
          play('wrong')
          setDrinkCount(prev => ({
            ...prev,
            [currentPlayerIndex]: (prev[currentPlayerIndex] || 0) + shotResult.penalty
          }))
        } else if (shotResult.penalty === -1) {
          // 反轉，需要選擇目標
          setSelectingTarget(true)
          play('click')
        } else {
          play('correct')
        }
      }
    }, 100)
  }, [currentPlayerIndex, play])

  const selectTarget = useCallback((targetIndex: number) => {
    play('wrong')
    setDrinkCount(prev => ({
      ...prev,
      [targetIndex]: (prev[targetIndex] || 0) + 1
    }))
    setSelectingTarget(false)
  }, [play])

  const nextPlayer = useCallback(() => {
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    setResult(null)
    setSelectingTarget(false)
  }, [players.length])

  const resetGame = useCallback(() => {
    setCurrentPlayerIndex(0)
    setSpinning(false)
    setResult(null)
    setChambersFired(0)
    setDrinkCount({})
    setSelectingTarget(false)
  }, [])

  const currentPlayer = players[currentPlayerIndex]
  const drinkBoard = Object.entries(drinkCount)
    .map(([i, count]) => ({ name: players[Number(i)], count }))
    .filter(x => x.count > 0)
    .sort((a, b) => b.count - a.count)

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="Shot輪盤">
      <GameRules
        rules="轉動輪盤決定命運！\n可能是 Shot、雙倍、安全、或反轉指定別人喝！"
        rulesKey="shot-roulette.rules"
      />

      <Target className="w-12 h-12 text-red-400 mb-4" />
      <p className="text-white/50 text-sm mb-2">已開槍 {chambersFired} 次</p>

      {!result && !spinning && (
        <div className="text-center w-full max-w-md">
          <p className="text-white/60 mb-2">輪到</p>
          <p className="text-2xl font-bold text-red-400 mb-6">{currentPlayer}</p>
          
          <m.button
            type="button"
            onClick={spin}
            whileTap={{ scale: 0.95 }}
            className="w-48 h-48 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center games-focus-ring shadow-lg shadow-red-500/30 border-4 border-red-500"
          >
            <div className="text-center">
              <Skull className="w-16 h-16 text-white mx-auto mb-2" />
              <p className="text-white font-bold">開槍！</p>
            </div>
          </m.button>
        </div>
      )}

      {spinning && (
        <div className="text-center">
          <m.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
            className="text-8xl"
          >
            🎰
          </m.div>
          <p className="text-white/60 mt-4">轉動中...</p>
        </div>
      )}

      {result && !spinning && (
        <AnimatePresence>
          <m.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center w-full max-w-md"
          >
            <m.p
              initial={reducedMotion ? false : { y: -20 }}
              animate={{ y: 0 }}
              className="text-6xl mb-4"
            >
              {result.emoji}
            </m.p>
            <p className="text-2xl font-bold text-white mb-2">{result.name}</p>

            {result.penalty > 0 && (
              <p className="text-red-400 font-bold text-xl mb-4">
                {currentPlayer} 喝 {result.penalty} 杯！
              </p>
            )}

            {result.penalty === 0 && (
              <p className="text-green-400 font-bold text-xl mb-4">
                {currentPlayer} 安全過關！
              </p>
            )}

            {selectingTarget && (
              <div className="mb-4">
                <p className="text-amber-400 mb-2">選擇一個人喝酒：</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {players.map((player, i) => i !== currentPlayerIndex && (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectTarget(i)}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 games-focus-ring min-h-[48px]"
                    >
                      {player}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!selectingTarget && (
              <div className="flex gap-3 justify-center">
                <button type="button" onClick={nextPlayer} className="btn-primary px-6 py-2 games-focus-ring">
                  下一位
                </button>
                <CopyResultButton
                  text={`Shot輪盤：\n${currentPlayer} 抽到 ${result.name} ${result.emoji}\n${result.penalty > 0 ? `喝 ${result.penalty} 杯！` : result.penalty === 0 ? '安全！' : '反轉！'}`}
                  label="複製"
                />
              </div>
            )}
          </m.div>
        </AnimatePresence>
      )}

      {drinkBoard.length > 0 && (
        <div className="absolute bottom-4 left-4 text-white/30 text-xs">
          <p className="text-white/50 mb-1">喝酒榜：</p>
          {drinkBoard.slice(0, 3).map((p, i) => (
            <div key={i}>{p.name}: {p.count}杯</div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={resetGame}
        className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring"
      >
        <RefreshCw className="w-5 h-5" />
      </button>
    </div>
  )
}
