'use client'

/**
 * R2-172：配對遊戲 — 兩人一組回答問題，答案一致得分，不一致喝酒
 * 沿用 SoulMate「同時選項→比對」模式，題庫為酒桌/一般題
 */
import { useState, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { GitCompare } from 'lucide-react'
import { useGamesPlayers } from '@/components/games/GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { usePunishmentCopy } from '@/hooks/usePunishmentCopy'
import GameRules from '@/components/games/GameRules'
import { DrinkingAnimation } from '@/components/games/DrinkingAnimation'
import { useGameReduceMotion } from '@/components/games/GameWrapper'
import { MATCH_ANSWER_QUESTIONS } from '@/data/match-answer-questions'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2']

export default function MatchAnswer() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const punishment = usePunishmentCopy()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [phase, setPhase] = useState<'idle' | 'pick' | 'result'>('idle')
  const [currentQ, setCurrentQ] = useState<typeof MATCH_ANSWER_QUESTIONS[0] | null>(null)
  const [pickA, setPickA] = useState<number | null>(null)
  const [pickB, setPickB] = useState<number | null>(null)
  const [used, setUsed] = useState<Set<number>>(new Set())
  const [score, setScore] = useState(0)

  const getNextQ = useCallback(() => {
    const available = MATCH_ANSWER_QUESTIONS.map((_, i) => i).filter((i) => !used.has(i))
    const idx = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : Math.floor(Math.random() * MATCH_ANSWER_QUESTIONS.length)
    if (available.length <= 1) setUsed(new Set())
    else setUsed((prev) => new Set([...prev, idx]))
    return MATCH_ANSWER_QUESTIONS[idx]
  }, [used])

  const startRound = useCallback(() => {
    play('click')
    setCurrentQ(getNextQ())
    setPickA(null)
    setPickB(null)
    setPhase('pick')
  }, [getNextQ, play])

  const reveal = useCallback(() => {
    if (pickA === null || pickB === null) return
    const match = pickA === pickB
    play(match ? 'correct' : 'wrong')
    if (match) setScore((s) => s + 1)
    if (!match && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
    setPhase('result')
  }, [pickA, pickB, play])

  const canReveal = pickA !== null && pickB !== null
  const match = pickA !== null && pickB !== null && pickA === pickB

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="配對遊戲">
      <GameRules
        rules="兩人同時從選項中選一個（不讓對方看到），再一起揭曉。答案一致得分，不一致兩人各喝一口。"
        rulesKey="match-answer.rules"
      />
      <p className="text-white/50 text-sm mb-2 text-center flex items-center justify-center gap-1">
        <GitCompare className="w-4 h-4 text-primary-400" />
        配對遊戲 · 得分 {score}
      </p>

      {phase === 'idle' && (
        <m.button
          type="button"
          className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold games-focus-ring"
          onClick={startRound}
          whileTap={{ scale: 0.98 }}
        >
          開始
        </m.button>
      )}

      {phase === 'pick' && currentQ && (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md">
          <p className="text-white/80 font-medium mb-4 text-center">{currentQ.q}</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-white/50 text-xs mb-2">{players[0]} 選</p>
              <div className="flex flex-wrap gap-2">
                {currentQ.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPickA(i)}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-sm border games-focus-ring ${pickA === i ? 'bg-primary-500/30 border-primary-500 text-white' : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/15'
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/50 text-xs mb-2">{players[1]} 選</p>
              <div className="flex flex-wrap gap-2">
                {currentQ.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPickB(i)}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-sm border games-focus-ring ${pickB === i ? 'bg-primary-500/30 border-primary-500 text-white' : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/15'
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={!canReveal}
            onClick={reveal}
            className="w-full min-h-[48px] rounded-xl bg-primary-500 text-white font-bold games-focus-ring disabled:opacity-50"
          >
            揭曉
          </button>
        </m.div>
      )}

      {phase === 'result' && currentQ && pickA !== null && pickB !== null && (
        <AnimatePresence>
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <p className="text-white/70 mb-1">{players[0]}：{currentQ.options[pickA]}</p>
            <p className="text-white/70 mb-4">{players[1]}：{currentQ.options[pickB]}</p>
            <p className={`text-lg font-bold mb-4 ${match ? 'text-green-400' : 'text-red-400'}`}>
              {match ? '一致！得 1 分' : punishment.mismatchPair}
            </p>
            {!match && !reducedMotion && <DrinkingAnimation duration={1.2} className="my-3 mx-auto mb-4" />}
            <button
              type="button"
              className="min-h-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring"
              onClick={startRound}
            >
              下一題
            </button>
          </m.div>
        </AnimatePresence>
      )}
    </div>
  )
}
