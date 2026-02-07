'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGamesPlayers } from '../GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from '../GameRules'
import CopyResultButton from '../CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']
const EXPRESSIONS = ['開心', '驚訝', '生氣', '難過', '搞怪', '裝可愛', '翻白眼', '瞇眼笑']

/** 表情模仿：抽目標表情，用前鏡頭拍照後由大家評分或系統模擬相似度，最低分喝。 */
export default function MimicFace() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [phase, setPhase] = useState<'idle' | 'target' | 'photo' | 'result'>('idle')
  const [targetExpression, setTargetExpression] = useState<string | null>(null)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [scores, setScores] = useState<Record<number, number>>({})

  const drawExpression = useCallback(() => {
    play('click')
    const expr = EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)]
    setTargetExpression(expr)
    setCurrentPlayerIndex(0)
    setScores({})
    setPhase('target')
  }, [play])

  const goPhoto = useCallback(() => { play('click'); setPhase('photo') }, [play])
  /** 模擬評分 1–10（實作可接前鏡頭 + 簡單比對或大家舉手投票） */
  const submitScore = useCallback((score: number) => {
    play('click')
    const nextScores = { ...scores, [currentPlayerIndex]: score }
    setScores((prev) => ({ ...prev, [currentPlayerIndex]: score }))
    if (currentPlayerIndex + 1 >= players.length) {
      const entries = Object.entries(nextScores).map(([i, s]) => ({ i: Number(i), s }))
      const low = entries.length > 0 ? entries.reduce((a, b) => (a.s <= b.s ? a : b)) : null
      if (low && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
      setPhase('result')
    } else {
      setCurrentPlayerIndex((i) => i + 1)
    }
  }, [currentPlayerIndex, players.length, scores, play])
  const reset = useCallback(() => setPhase('idle'), [])

  useEffect(() => {
    if (phase !== 'result') return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') reset() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, reset])

  const currentName = players[currentPlayerIndex]
  const entries = Object.entries(scores).map(([i, s]) => ({ i: Number(i), s }))
  const lowest = entries.length > 0 ? entries.reduce((a, b) => (a.s <= b.s ? a : b)) : null

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="表情模仿">
      <GameRules
        rules={`抽出一種目標表情，每人輪流用前鏡頭做出該表情並拍照。\n由大家舉手投票或主持人給 1–10 分，最低分的人喝。\n（本版為模擬評分，可改為大家喊「過／喝」）`}
      />
      <p className="text-white/50 text-sm mb-2 text-center">表情模仿</p>

      {phase === 'idle' && (
        <motion.button
          type="button"
          className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold games-focus-ring"
          onClick={drawExpression}
          whileTap={{ scale: 0.98 }}
        >
          抽表情
        </motion.button>
      )}

      {phase === 'target' && targetExpression && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          <p className="text-2xl font-bold text-primary-300 mb-4">模仿表情：{targetExpression}</p>
          <button
            type="button"
            className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring"
            onClick={goPhoto}
          >
            開始拍照
          </button>
        </motion.div>
      )}

      {phase === 'photo' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          <p className="text-white/70 mb-2">輪到 <span className="font-bold text-primary-300">{currentName}</span> 模仿「{targetExpression}」</p>
          <p className="text-white/50 text-sm mb-4">拍照後由大家評分 1–10，或按下方模擬評分</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                className="min-h-[48px] min-w-[48px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium games-focus-ring"
                onClick={() => submitScore(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {phase === 'result' && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <p className="text-white/70 mb-2">本輪表情：{targetExpression}</p>
            {lowest && <p className="text-red-400 font-bold text-lg mb-4">最低分：{players[lowest.i]} 喝</p>}
            <span className="sr-only" aria-live="polite">
              {`表情模仿：本輪表情 ${targetExpression}${lowest ? `，最低分 ${players[lowest.i]} 喝` : ''}`}
            </span>
            <ul className="text-white/60 text-sm mb-4 space-y-1">
              {entries.sort((a, b) => a.i - b.i).map(({ i, s }) => (
                <li key={i}>{players[i]}：{s} 分</li>
              ))}
            </ul>
            <CopyResultButton
              text={`表情模仿：本輪表情 ${targetExpression}${lowest ? `，最低分 ${players[lowest.i]} 喝` : ''}`}
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
