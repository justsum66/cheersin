'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGamesPlayers } from '../GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from '../GameRules'
import CopyResultButton from '../CopyResultButton'
import { GameResultActions } from '../GameResultActions'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

const STARTERS: string[] = [
  '從前有一個酒鬼',
  '有一天他走進一家酒吧',
  '半夜三更',
  '在很久很久以前',
]

/** 故事接龍：每人說一句接下去，離題或卡住的人喝。主持人或大家判定離題。 */
export default function StoryChain() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [phase, setPhase] = useState<'idle' | 'playing' | 'result'>('idle')
  const [starter, setStarter] = useState('')
  const [lines, setLines] = useState<string[]>([])
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0)
  const [input, setInput] = useState('')
  const [offTopicIndex, setOffTopicIndex] = useState<number | null>(null)

  const startGame = useCallback(() => {
    play('click')
    const s = STARTERS[Math.floor(Math.random() * STARTERS.length)]
    setStarter(s)
    setLines([])
    setCurrentSpeakerIndex(0)
    setInput('')
    setOffTopicIndex(null)
    setPhase('playing')
  }, [play])

  const addLine = useCallback(() => {
    const text = input.trim()
    if (!text) return
    play('click')
    setLines((prev) => [...prev, text])
    setInput('')
    setCurrentSpeakerIndex((i) => (i + 1) % players.length)
  }, [input, players.length, play])

  const markOffTopic = useCallback((playerIndex: number) => {
    play('wrong')
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
    setOffTopicIndex(playerIndex)
    setPhase('result')
  }, [play])

  const nextRound = useCallback(() => setPhase('idle'), [])

  useEffect(() => {
    if (phase !== 'result') return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') nextRound() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, nextRound])

  const currentName = players[currentSpeakerIndex]
  const fullStory = [starter, ...lines].join('，')

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="故事接龍">
      <GameRules
        rules={`系統給一個開頭，每人輪流接一句話，串成一個故事。\n離題、重複、或卡住太久的人喝。\n由大家或主持人判定是否離題。`}
      />
      <p className="text-white/50 text-sm mb-2 text-center">故事接龍</p>

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

      {phase === 'playing' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md w-full">
          <p className="text-white/60 text-sm mb-2">故事：{fullStory || starter}</p>
          <p className="text-white/70 mb-2">輪到 <span className="font-bold text-primary-300">{currentName}</span> 接下一句</p>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLine()}
              placeholder="輸入下一句"
              className="flex-1 min-h-[48px] px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40"
            />
            <button
              type="button"
              className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring"
              onClick={addLine}
            >
              接下去
            </button>
          </div>
          <button
            type="button"
            className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-red-500/20 text-red-300 text-sm games-focus-ring"
            onClick={() => markOffTopic(currentSpeakerIndex)}
          >
            判定離題（此人喝）
          </button>
        </motion.div>
      )}

      {phase === 'result' && offTopicIndex != null && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <p className="text-white/70 mb-2">完整故事：{fullStory}</p>
            <p className="text-red-400 font-bold mb-4">{players[offTopicIndex]} 離題，喝！</p>
            <CopyResultButton
              text={`故事接龍：${players[offTopicIndex]} 離題喝。故事：${fullStory}`}
              className="mb-4 games-focus-ring"
            />
            <GameResultActions onRestart={nextRound} />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
