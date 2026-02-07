'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

export default function TimeFreeze() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [targetTime, setTargetTime] = useState(5)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [phase, setPhase] = useState<'waiting' | 'counting' | 'result'>('waiting')
  const [startTimestamp, setStartTimestamp] = useState(0)

  const players = contextPlayers.length > 0 ? contextPlayers : ['玩家1', '玩家2']
  const currentPlayer = players[(round - 1) % players.length]

  const startCounting = useCallback(() => {
    const target = Math.floor(Math.random() * 8) + 3 // 3-10 seconds
    setTargetTime(target)
    setElapsedTime(0)
    setStartTimestamp(Date.now())
    setPhase('counting')
    play('click')
    
    timerRef.current = setInterval(() => {
      setElapsedTime((Date.now() - startTimestamp) / 1000)
    }, 100)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play])

  useEffect(() => {
    if (phase === 'counting') {
      timerRef.current = setInterval(() => {
        setElapsedTime((Date.now() - startTimestamp) / 1000)
      }, 100)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase, startTimestamp])

  const stopCounting = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    const finalTime = (Date.now() - startTimestamp) / 1000
    setElapsedTime(finalTime)
    
    const diff = Math.abs(finalTime - targetTime)
    if (diff <= 0.5) {
      setScores(s => ({ ...s, [currentPlayer]: (s[currentPlayer] || 0) + 3 }))
      play('win')
    } else if (diff <= 1) {
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

  const getDiffText = () => {
    const diff = Math.abs(elapsedTime - targetTime)
    if (diff <= 0.5) return '完美！+3分'
    if (diff <= 1) return '不錯！+1分'
    return `差${diff.toFixed(2)}秒，喝一口！`
  }

  const resultText = players.map(p => `${p}: ${scores[p] || 0}分`).join('、')

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main">
      <GameRules rules="不看畫面，心裡數秒後按停！越接近目標秒數越高分！" rulesKey="time-freeze.rules" />

      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <motion.div key="waiting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }} className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-white">第 {round} 回合</h2>
            <p className="text-white/80">{currentPlayer} 的回合</p>
            <div className="text-white">{players.map(p => <span key={p} className="mx-2">{p}: {scores[p] || 0}分</span>)}</div>
            <button onClick={startCounting} className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-2xl text-white font-bold text-xl transition-colors">開始計時</button>
          </motion.div>
        )}

        {phase === 'counting' && (
          <motion.div key="counting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }} className="flex flex-col items-center gap-6">
            <div className="text-white/60">目標：{targetTime} 秒</div>
            <div className="text-white text-lg">閉上眼睛，心裡數到 {targetTime} 秒時按停！</div>
            <div className="text-8xl">⏱️</div>
            <div className="text-4xl font-bold text-accent-400">???</div>
            <button onClick={stopCounting} className="px-12 py-6 bg-red-500 hover:bg-red-600 rounded-2xl text-white font-bold text-2xl transition-colors">停！</button>
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }} className="flex flex-col items-center gap-4">
            <div className="text-white/60">目標：{targetTime} 秒</div>
            <div className="text-5xl font-bold text-accent-400">{elapsedTime.toFixed(2)} 秒</div>
            <div className={`text-2xl font-bold ${Math.abs(elapsedTime - targetTime) <= 1 ? 'text-green-400' : 'text-red-400'}`}>
              {getDiffText()}
            </div>
            <div className="text-white mt-4">{players.map(p => <span key={p} className="mx-2">{p}: {scores[p] || 0}分</span>)}</div>
            <div className="flex gap-4 mt-4">
              <button onClick={nextRound} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-bold transition-colors">下一回合</button>
              <button onClick={resetGame} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors">重新開始</button>
            </div>
            <CopyResultButton text={`時間凍結 ${resultText}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
