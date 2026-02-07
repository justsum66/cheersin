'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

export default function StareContest() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [time, setTime] = useState(0)
  const [phase, setPhase] = useState<'waiting' | 'staring' | 'result'>('waiting')
  const [winner, setWinner] = useState<string | null>(null)

  const players = contextPlayers.length > 0 ? contextPlayers : ['玩家1', '玩家2']
  const player1 = players[0]
  const player2 = players[1] || '玩家2'

  const startContest = useCallback(() => {
    setTime(0)
    setPhase('staring')
    play('click')
    timerRef.current = setInterval(() => {
      setTime(t => t + 0.1)
    }, 100)
  }, [play])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const playerLose = (loser: string) => {
    if (timerRef.current) clearInterval(timerRef.current)
    const winnerName = loser === player1 ? player2 : player1
    setWinner(winnerName)
    setScores(s => ({ ...s, [winnerName]: (s[winnerName] || 0) + 1 }))
    play('win')
    setPhase('result')
  }

  const nextRound = () => {
    setRound(r => r + 1)
    setPhase('waiting')
    setWinner(null)
  }

  const resetGame = () => {
    setRound(1)
    setScores({})
    setPhase('waiting')
    setWinner(null)
  }

  const resultText = `${player1}: ${scores[player1] || 0}勝、${player2}: ${scores[player2] || 0}勝`

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main">
      <GameRules rules="雙方對視！先眨眼的人輸，要喝酒！" rulesKey="stare-contest.rules" />

      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <motion.div key="waiting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }} className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-white">第 {round} 回合</h2>
            <div className="text-white/80">{player1} vs {player2}</div>
            <div className="text-6xl">👁️ 👁️</div>
            <button onClick={startContest} className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-2xl text-white font-bold text-xl transition-colors">開始對視！</button>
          </motion.div>
        )}

        {phase === 'staring' && (
          <motion.div key="staring" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }} className="flex flex-col items-center gap-6">
            <div className="text-4xl font-bold text-accent-400">{time.toFixed(1)}秒</div>
            <div className="text-8xl">👁️ 👁️</div>
            <div className="text-white/60 text-lg">誰先眨眼就輸了！</div>
            <div className="flex gap-6 mt-4">
              <button onClick={() => playerLose(player1)} className="px-8 py-6 bg-red-500 hover:bg-red-600 rounded-2xl text-white font-bold text-xl transition-colors">
                {player1} 眨眼了
              </button>
              <button onClick={() => playerLose(player2)} className="px-8 py-6 bg-red-500 hover:bg-red-600 rounded-2xl text-white font-bold text-xl transition-colors">
                {player2} 眨眼了
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'result' && winner && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }} className="flex flex-col items-center gap-4">
            <div className="text-3xl font-bold text-green-400">{winner} 獲勝！</div>
            <div className="text-white/80">堅持了 {time.toFixed(1)} 秒</div>
            <div className="text-red-400 text-lg">{winner === player1 ? player2 : player1} 喝一口！</div>
            <div className="text-white mt-4">{resultText}</div>
            <div className="flex gap-4 mt-4">
              <button onClick={nextRound} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-bold transition-colors">下一回合</button>
              <button onClick={resetGame} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors">重新開始</button>
            </div>
            <CopyResultButton text={`瞪眼大賽 ${resultText}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
