'use client'

import { useState, useCallback } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Brain, RotateCcw } from 'lucide-react'
import { useGameSound } from '@/hooks/useGameSound'
import { usePunishmentCopy } from '@/hooks/usePunishmentCopy'
import GameRules from './GameRules'
import {
  PSYCH_QUIZ_QUESTIONS,
  getPsychQuizResult,
  type PsychQuizResult,
} from '@/data/psych-quiz'

/** R2-164：心理測驗喝酒版 — 靜態題目＋計分結果，結果頁可帶「建議喝一口」等 */
export default function PsychQuiz() {
  const { play } = useGameSound()
  const punishment = usePunishmentCopy()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<('A' | 'B' | 'C')[]>([])
  const [result, setResult] = useState<PsychQuizResult | null>(null)

  const q = PSYCH_QUIZ_QUESTIONS[step]
  const isLastQuestion = step >= PSYCH_QUIZ_QUESTIONS.length - 1

  const handleChoice = useCallback(
    (value: 'A' | 'B' | 'C') => {
      play('click')
      const next = [...answers, value]
      setAnswers(next)
      if (isLastQuestion) {
        setResult(getPsychQuizResult(next))
      } else {
        setStep((s) => s + 1)
      }
    },
    [answers, isLastQuestion, play]
  )

  const restart = useCallback(() => {
    play('click')
    setStep(0)
    setAnswers([])
    setResult(null)
  }, [play])

  return (
    <div className="flex flex-col items-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="心理測驗喝酒版">
      <GameRules
        rules="依題目選一個最像你的選項，全部答完會得到你的類型與小建議（如喝一口／做一下）。"
        rulesKey="psych-quiz.rules"
      />
      <Brain className="w-12 h-12 text-primary-400 mb-2" />
      <p className="text-white/60 text-sm mb-4">心理測驗 · 喝酒版</p>

      <AnimatePresence mode="wait">
        {result ? (
          <m.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md text-center p-6 rounded-2xl bg-white/5 border border-primary-500/30"
          >
            <h2 className="text-xl font-bold text-primary-300 mb-2">{result.title}</h2>
            <p className="text-white/80 text-sm mb-4">{result.description}</p>
            <p className="text-amber-300/90 text-sm font-medium mb-4">
              建議：{result.suggestion.replace(/喝一口|喝一杯/g, punishment.drinkOne).replace(/做一下/g, punishment.drinkOne)}
            </p>
            <button type="button" onClick={restart} className="btn-primary min-h-[48px] px-6 py-3 games-focus-ring inline-flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              再測一次
            </button>
          </m.div>
        ) : q ? (
          <m.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg"
          >
            <p className="text-white/50 text-xs mb-2">第 {step + 1} / {PSYCH_QUIZ_QUESTIONS.length} 題</p>
            <p className="text-white font-medium mb-4">{q.q}</p>
            <div className="flex flex-col gap-2">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChoice(opt.value)}
                  className="min-h-[48px] px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-left text-white/90 hover:bg-white/15 games-focus-ring"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
