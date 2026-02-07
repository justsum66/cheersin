'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const PHRASES = [
  '今天喝酒很開心',
  '乾杯乾杯再乾杯',
  '酒逢知己千杯少',
  '感情深一口悶',
  '不醉不歸今晚嗨',
  '朋友聚會最開心',
  '人生得意須盡歡',
  '舉杯邀明月',
  '酒香四溢醉人心',
  '一杯敬明天',
]

export default function FastType() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [targetPhrase, setTargetPhrase] = useState('')
  const [typed, setTyped] = useState('')
  const [timeLeft, setTimeLeft] = useState(10)
  const [phase, setPhase] = useState<'waiting' | 'playing' | 'result'>('waiting')
  const [accuracy, setAccuracy] = useState(0)

  const players = contextPlayers.length > 0 ? contextPlayers : ['玩家1', '玩家2']
  const currentPlayer = players[(round - 1) % players.length]

  const startRound = useCallback(() => {
    const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)]
    setTargetPhrase(phrase)
    setTyped('')
    setTimeLeft(10)
    setPhase('playing')
    play('click')
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [play])

  useEffect(() => {
    if (phase !== 'playing') return
    if (timeLeft <= 0) {
      finishRound()
      return
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft])

  const finishRound = useCallback(() => {
    let correct = 0
    for (let i = 0; i < typed.length && i < targetPhrase.length; i++) {
      if (typed[i] === targetPhrase[i]) correct++
    }
    const acc = targetPhrase.length > 0 ? Math.round((correct / targetPhrase.length) * 100) : 0
    setAccuracy(acc)
    
    if (acc >= 80) {
      setScores(s => ({ ...s, [currentPlayer]: (s[currentPlayer] || 0) + 1 }))
      play('correct')
    } else {
      play('wrong')
    }
    setPhase('result')
  }, [typed, targetPhrase, currentPlayer, play])

  const handleTyping = (value: string) => {
    setTyped(value)
    if (value === targetPhrase) {
      finishRound()
    }
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

  const resultText = players.map(p => `${p}: ${scores[p] || 0}分`).join('、')

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main">
      <GameRules rules="限時打字挑戰！準確率低於80%要喝酒！" rulesKey="fast-type.rules" />

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
            <h2 className="text-2xl font-bold text-white">第 {round} 回合</h2>
            <p className="text-white/80">{currentPlayer} 的回合</p>
            <button
              onClick={startRound}
              className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-2xl text-white font-bold text-xl transition-colors"
            >
              開始打字
            </button>
          </motion.div>
        )}

        {phase === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
            className="flex flex-col items-center gap-4 w-full max-w-md"
          >
            <div className="text-4xl font-bold text-accent-400">{timeLeft}秒</div>
            <div className="text-2xl text-white font-medium p-4 bg-white/10 rounded-xl w-full text-center">
              {targetPhrase.split('').map((char, i) => (
                <span
                  key={i}
                  className={
                    i < typed.length
                      ? typed[i] === char
                        ? 'text-green-400'
                        : 'text-red-400'
                      : 'text-white/60'
                  }
                >
                  {char}
                </span>
              ))}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={typed}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="開始打字..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white text-center text-xl border border-white/20 focus:border-primary-400 outline-none"
            />
            <div className="text-white/60">進度：{typed.length}/{targetPhrase.length}</div>
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <div className={`text-5xl font-bold ${accuracy >= 80 ? 'text-green-400' : 'text-red-400'}`}>
              {accuracy}%
            </div>
            <div className={`text-2xl font-bold ${accuracy >= 80 ? 'text-green-400' : 'text-red-400'}`}>
              {accuracy >= 80 ? '過關！' : '失敗！喝一口！'}
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
            <CopyResultButton text={`打字比賽 ${resultText}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
