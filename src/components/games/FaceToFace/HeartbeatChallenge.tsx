'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGamesPlayers } from '../GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { preventNumberScrollOnWheel } from '@/hooks/usePreventNumberScroll'
import GameRules from '../GameRules'
import CopyResultButton from '../CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

/** 心跳大挑戰：選一位玩家，其他人猜其心跳（bpm）。以手機感測或模擬隨機值比對，最接近者安全、最遠者喝。 */
export default function HeartbeatChallenge() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [phase, setPhase] = useState<'idle' | 'target' | 'guess' | 'result'>('idle')
  const [targetIndex, setTargetIndex] = useState<number | null>(null)
  const [guesses, setGuesses] = useState<Record<number, number>>({})
  const [realBpm, setRealBpm] = useState<number | null>(null)
  const [measured, setMeasured] = useState(false)

  const startGame = useCallback(() => {
    play('click')
    const idx = Math.floor(Math.random() * players.length)
    setTargetIndex(idx)
    setGuesses({})
    setRealBpm(null)
    setMeasured(false)
    setPhase('target')
  }, [players.length, play])

  const goGuess = useCallback(() => { play('click'); setPhase('guess') }, [play])
  const submitGuess = useCallback((playerIndex: number, bpm: number) => {
    setGuesses((prev) => ({ ...prev, [playerIndex]: bpm }))
  }, [])

  /** 模擬測量：隨機 60–100 bpm，或提示使用實機感測 */
  const measureBpm = useCallback(() => {
    play('click')
    const bpm = 60 + Math.floor(Math.random() * 41)
    setRealBpm(bpm)
    setMeasured(true)
  }, [play])

  const showResult = useCallback(() => {
    if (realBpm == null) return
    play('win')
    const guessEntries = Object.entries(guesses).map(([i, b]) => ({ i: Number(i), b }))
    if (guessEntries.length > 0 && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
    setPhase('result')
  }, [realBpm, guesses, play])

  const reset = useCallback(() => setPhase('idle'), [])

  const targetName = targetIndex != null ? players[targetIndex] : ''
  const guessEntries = Object.entries(guesses).map(([i, b]) => ({ i: Number(i), b }))
  const closest = realBpm != null && guessEntries.length > 0
    ? guessEntries.reduce((a, b) =>
        Math.abs(a.b - realBpm) <= Math.abs(b.b - realBpm) ? a : b
      )
    : null
  const farthest = realBpm != null && guessEntries.length > 0
    ? guessEntries.reduce((a, b) =>
        Math.abs(a.b - realBpm) >= Math.abs(b.b - realBpm) ? a : b
      )
    : null

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="心跳大挑戰">
      <GameRules
        rules={`選出一位玩家作為「被測者」，其他人猜他／她的心跳（每分鐘幾下）。\n可請被測者用手指壓鏡頭模擬脈搏，或由主持人隨機公布一個數字。\n最接近真實值的人安全，離最遠的人喝。`}
      />
      <p className="text-white/50 text-sm mb-2 text-center">心跳大挑戰</p>

      {phase === 'idle' && (
        <motion.button
          type="button"
          className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold games-focus-ring"
          onClick={startGame}
          whileTap={{ scale: 0.98 }}
        >
          開始
        </motion.button>
      )}

      {phase === 'target' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          <p className="text-white/70 mb-4">被測者：<span className="font-bold text-primary-300">{targetName}</span></p>
          <p className="text-white/50 text-sm mb-4">請被測者放鬆，其他人準備猜心跳（bpm）</p>
          <button
            type="button"
            className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold mb-2 games-focus-ring"
            onClick={goGuess}
          >
            開始猜
          </button>
          <button
            type="button"
            className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 text-white text-sm block mx-auto games-focus-ring"
            onClick={measureBpm}
          >
            模擬測量（隨機 bpm）
          </button>
        </motion.div>
      )}

      {phase === 'guess' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md w-full">
          <p className="text-white/70 mb-2">猜 <span className="font-bold text-primary-300">{targetName}</span> 的心跳（每分鐘幾下）</p>
          <p className="text-white/40 text-xs mb-4">輸入 50–120 的數字，或由主持人代為輸入</p>
          <div className="space-y-2 max-h-48 overflow-auto">
            {players.map((name, i) =>
              i === targetIndex ? null : (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-white/80 w-24 text-left">{name}</span>
                  <input
                    type="number"
                    min={50}
                    max={120}
                    step={1}
                    placeholder="bpm"
                    value={guesses[i] ?? ''}
                    onWheel={preventNumberScrollOnWheel}
                    className="flex-1 min-h-[48px] px-3 rounded-lg bg-white/10 border border-white/20 text-white w-20"
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10)
                      if (!Number.isNaN(v)) submitGuess(i, v)
                    }}
                  />
                </div>
              )
            )}
          </div>
          {!measured ? (
            <button
              type="button"
              className="mt-4 min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 text-white text-sm games-focus-ring"
              onClick={measureBpm}
            >
              模擬測量
            </button>
          ) : (
            <button
              type="button"
              className="mt-4 min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring"
              onClick={showResult}
            >
              揭曉
            </button>
          )}
        </motion.div>
      )}

      {phase === 'result' && realBpm != null && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <p className="text-white/70 mb-1">真實心跳：<span className="font-bold text-primary-300">{realBpm} bpm</span></p>
            {closest && <p className="text-green-400 font-medium mb-1">最接近：{players[closest.i]} 安全</p>}
            {farthest && <p className="text-red-400 font-medium mb-4">離最遠：{players[farthest.i]} 喝</p>}
            <span className="sr-only" aria-live="polite">
              {`心跳大挑戰：真實 ${realBpm} bpm${closest ? `，最接近 ${players[closest.i]} 安全` : ''}${farthest ? `，離最遠 ${players[farthest.i]} 喝` : ''}`}
            </span>
            <CopyResultButton
              text={`心跳大挑戰：真實 ${realBpm} bpm${closest ? `，最接近 ${players[closest.i]} 安全` : ''}${farthest ? `，離最遠 ${players[farthest.i]} 喝` : ''}`}
              className="mb-4 games-focus-ring"
            />
            <button
              type="button"
              className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring"
              onClick={reset}
            >
              再來一局
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
