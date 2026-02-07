'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGamesPlayers } from '../GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from '../GameRules'
import CopyResultButton from '../CopyResultButton'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

const QUESTIONS: string[] = [
  '最喜歡的顏色？',
  '最喜歡的季節？',
  '最想去的國家？',
  '最喜歡的動物？',
  '早餐最常吃什麼？',
  '最喜歡的飲料？',
  '最討厭的食物？',
  '最喜歡的數字？',
  '下雨天最想做什麼？',
  '最喜歡的電影類型？',
]

/** 默契大考驗：兩人一組同時回答同一題，答案相同則安全，不同則喝。 */
export default function ChemistryTest() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [phase, setPhase] = useState<'idle' | 'pair' | 'answer' | 'result'>('idle')
  const [pair, setPair] = useState<[number, number]>([0, 1])
  const [question, setQuestion] = useState('')
  const [answerA, setAnswerA] = useState('')
  const [answerB, setAnswerB] = useState('')

  const startRound = useCallback(() => {
    play('click')
    const a = Math.floor(Math.random() * players.length)
    let b = Math.floor(Math.random() * players.length)
    while (b === a) b = Math.floor(Math.random() * players.length)
    setPair([a, b])
    setQuestion(QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)])
    setAnswerA('')
    setAnswerB('')
    setPhase('pair')
  }, [players.length, play])

  const goAnswer = useCallback(() => { play('click'); setPhase('answer') }, [play])
  const sameAnswer = answerA.trim().toLowerCase() === answerB.trim().toLowerCase()
  const canReveal = answerA.trim() !== '' && answerB.trim() !== ''
  const revealResult = useCallback(() => {
    play(sameAnswer ? 'correct' : 'wrong')
    if (!sameAnswer && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
    setPhase('result')
  }, [play, sameAnswer])

  useEffect(() => {
    if (phase !== 'result') return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') startRound() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, startRound])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="默契大考驗">
      <GameRules
        rules={`系統隨機選兩人一組，出同一道題。\n兩人同時寫下答案（不讓對方看到），再同時亮出。\n答案相同則安全，不同則兩人各喝一杯。`}
      />
      <p className="text-white/50 text-sm mb-2 text-center">默契大考驗</p>

      {phase === 'idle' && (
        <motion.button
          type="button"
          className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold games-focus-ring"
          onClick={startRound}
          whileTap={{ scale: 0.98 }}
        >
          開始
        </motion.button>
      )}

      {phase === 'pair' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          <p className="text-white/70 mb-2">本輪搭檔：<span className="font-bold text-primary-300">{players[pair[0]]}</span> & <span className="font-bold text-primary-300">{players[pair[1]]}</span></p>
          <p className="text-lg font-bold text-white mb-4">{question}</p>
          <button
            type="button"
            className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring"
            onClick={goAnswer}
          >
            各自寫答案
          </button>
        </motion.div>
      )}

      {phase === 'answer' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md w-full">
          <p className="text-white/70 mb-4">{question}</p>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-left text-white/60 text-sm mb-1">{players[pair[0]]}</label>
              <input
                type="text"
                value={answerA}
                onChange={(e) => setAnswerA(e.target.value)}
                placeholder="答案（不讓對方看到）"
                className="w-full min-h-[48px] px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40"
              />
            </div>
            <div>
              <label className="block text-left text-white/60 text-sm mb-1">{players[pair[1]]}</label>
              <input
                type="text"
                value={answerB}
                onChange={(e) => setAnswerB(e.target.value)}
                placeholder="答案（不讓對方看到）"
                className="w-full min-h-[48px] px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={!canReveal}
            className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring disabled:opacity-50"
            onClick={revealResult}
          >
            揭曉
          </button>
        </motion.div>
      )}

      {phase === 'result' && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <p className="text-white/70 mb-2">{players[pair[0]]}：{answerA || '—'}</p>
            <p className="text-white/70 mb-4">{players[pair[1]]}：{answerB || '—'}</p>
            <p className={`text-lg font-bold mb-4 ${sameAnswer ? 'text-green-400' : 'text-red-400'}`}>
              {sameAnswer ? '默契十足！安全' : '不一樣，兩人各喝一杯'}
            </p>
            <span className="sr-only" aria-live="polite">
              {`默契大考驗：${players[pair[0]]}、${players[pair[1]]}，${sameAnswer ? '默契十足安全' : '不一樣兩人各喝一杯'}`}
            </span>
            <CopyResultButton
              text={`默契大考驗：${players[pair[0]]}「${answerA || '—'}」vs ${players[pair[1]]}「${answerB || '—'}」，${sameAnswer ? '默契十足安全' : '不一樣兩人各喝一杯'}`}
              className="mb-4 games-focus-ring"
            />
            <button
              type="button"
              className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring"
              onClick={startRound}
            >
              下一題
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
