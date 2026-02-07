'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Activity, RotateCcw, Check, X, Trophy } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2']

const COLORS = [
  { name: '紅色', color: 'bg-red-500', hex: '#ef4444' },
  { name: '藍色', color: 'bg-blue-500', hex: '#3b82f6' },
  { name: '綠色', color: 'bg-green-500', hex: '#22c55e' },
  { name: '黃色', color: 'bg-yellow-500', hex: '#eab308' },
]

/** G3.1-G3.2：反應大師 - 看顏色快速反應 */
export default function ReactionMaster() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'show' | 'result'>('idle')
  const [targetColor, setTargetColor] = useState<typeof COLORS[0] | null>(null)
  const [startTime, setStartTime] = useState(0)
  const [results, setResults] = useState<Record<string, number>>({})
  const [wrongPlayer, setWrongPlayer] = useState<string | null>(null)
  const [round, setRound] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startRound = useCallback(() => {
    play('click')
    setGameState('waiting')
    setResults({})
    setWrongPlayer(null)
    setTargetColor(null)
    
    const delay = Math.floor(Math.random() * 3000) + 1500
    timerRef.current = setTimeout(() => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      setTargetColor(color)
      setGameState('show')
      setStartTime(Date.now())
      play('correct')
    }, delay)
  }, [play])

  const handleTap = useCallback((player: string, colorIdx: number) => {
    if (gameState === 'waiting') {
      play('wrong')
      setWrongPlayer(player)
      setGameState('result')
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }
    
    if (gameState === 'show' && !results[player] && targetColor) {
      const time = Date.now() - startTime
      const correct = COLORS[colorIdx].name === targetColor.name
      
      if (!correct) {
        play('wrong')
        setWrongPlayer(player)
        setGameState('result')
        return
      }
      
      play('click')
      setResults(prev => ({ ...prev, [player]: time }))
      
      if (Object.keys(results).length + 1 >= players.length) {
        setGameState('result')
        const fastest = Object.entries({ ...results, [player]: time }).reduce((a, b) => a[1] < b[1] ? a : b)[0]
        setScores(prev => ({ ...prev, [fastest]: (prev[fastest] || 0) + 1 }))
      }
    }
  }, [gameState, startTime, results, players.length, targetColor, play])

  const nextRound = useCallback(() => {
    setRound(prev => prev + 1)
    setGameState('idle')
  }, [])

  const resetGame = useCallback(() => {
    setGameState('idle')
    setTargetColor(null)
    setResults({})
    setWrongPlayer(null)
    setRound(0)
    setScores({})
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const winner = Object.keys(results).length > 0 
    ? Object.entries(results).reduce((a, b) => a[1] < b[1] ? a : b) 
    : null

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
      <GameRules rules={`看到顏色後快速點擊對應按鈕！\n最快且正確的人獲勝！\n點錯或太早點直接輸！`} />
      
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-6 h-6 text-emerald-400" />
        <h2 className="text-xl font-bold text-white">反應大師</h2>
      </div>

      {gameState === 'idle' && (
        <motion.button whileTap={{ scale: 0.96 }} onClick={startRound} className="px-8 py-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xl games-focus-ring">
          第 {round + 1} 輪 - 開始！
        </motion.button>
      )}

      {gameState === 'waiting' && (
        <div className="flex flex-col items-center gap-6">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-32 h-32 rounded-full bg-white/10 border-4 border-white/30 flex items-center justify-center"
          >
            <span className="text-white/50 text-xl">等待...</span>
          </motion.div>
          <div className="grid grid-cols-2 gap-2">
            {players.flatMap(p => COLORS.map((c, i) => (
              <button
                key={`${p}-${c.name}`}
                onClick={() => handleTap(p, i)}
                className={`px-4 py-3 rounded-xl ${c.color} text-white font-bold text-sm games-focus-ring`}
              >
                {p}
              </button>
            )))}
          </div>
        </div>
      )}

      {gameState === 'show' && targetColor && (
        <div className="flex flex-col items-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-32 h-32 rounded-full ${targetColor.color} flex items-center justify-center shadow-lg`}
          >
            <span className="text-white font-bold text-2xl">{targetColor.name}</span>
          </motion.div>
          <div className="text-center">
            {players.map(p => (
              <div key={p} className="mb-2">
                <span className="text-white/70 mr-2">{p}:</span>
                <div className="inline-flex gap-1">
                  {COLORS.map((c, i) => (
                    <button
                      key={c.name}
                      onClick={() => handleTap(p, i)}
                      disabled={!!results[p]}
                      className={`w-12 h-12 rounded-lg ${c.color} text-white font-bold text-xs games-focus-ring ${results[p] ? 'opacity-50' : ''}`}
                    >
                      {results[p] && c.name === targetColor?.name ? `${results[p]}ms` : c.name[0]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {gameState === 'result' && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          {wrongPlayer ? (
            <>
              <X className="w-16 h-16 text-red-500 mx-auto mb-2" />
              <p className="text-red-400 font-bold text-2xl">{wrongPlayer} {wrongPlayer === players[0] ? '太早' : '點錯'}了！</p>
              <p className="text-white/50 mt-2">{wrongPlayer} 喝酒！</p>
            </>
          ) : winner ? (
            <>
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
              <p className="text-yellow-400 font-bold text-2xl">{winner[0]} 最快！</p>
              <p className="text-white/50 mt-2">{winner[1]}ms</p>
              <p className="text-red-400 mt-4">輸家喝酒！</p>
            </>
          ) : null}
          <div className="flex gap-3 mt-4 justify-center">
            <button onClick={nextRound} className="px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring">下一輪</button>
            <CopyResultButton text={wrongPlayer ? `反應大師：${wrongPlayer} 出錯喝酒` : `反應大師：${winner?.[0]} 最快 ${winner?.[1]}ms`} />
          </div>
        </motion.div>
      )}

      {Object.keys(scores).length > 0 && (
        <div className="absolute bottom-4 left-4 text-white/30 text-xs">
          {Object.entries(scores).map(([p, s]) => (
            <div key={p}>{p}: {s}勝</div>
          ))}
        </div>
      )}

      <button onClick={resetGame} className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring">
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
