'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Wine, Check, X } from 'lucide-react'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import { DrinkingAnimation } from './DrinkingAnimation'
import { useGameReduceMotion } from './GameWrapper'
import { shuffleAlcoholTrivia, type AlcoholTriviaItem } from '@/data/alcohol-trivia'

const QUESTION_COUNT = 8

/** R2-168：酒精知識王 — 酒精/品酒專用題庫，答錯喝 */
export default function AlcoholTrivia() {
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const [questions, setQuestions] = useState<AlcoholTriviaItem[]>(() => shuffleAlcoholTrivia(QUESTION_COUNT))
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const nextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const q = questions[current]
  const isWrong = isAnswered && selected !== null && q && selected !== q.correct

  const goNext = useCallback(() => {
    if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current)
    nextTimeoutRef.current = null
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1)
      setSelected(null)
      setIsAnswered(false)
    }
  }, [current, questions.length])

  const handleAnswer = useCallback(
    (index: number) => {
      if (isAnswered || !q) return
      setSelected(index)
      setIsAnswered(true)
      const correct = index === q.correct
      if (correct) {
        play('correct')
        setScore((s) => s + 1)
      } else {
        play('wrong')
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
      }
      nextTimeoutRef.current = setTimeout(goNext, correct ? 1500 : 2200)
    },
    [isAnswered, q, play, goNext]
  )

  useEffect(() => {
    return () => {
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current)
    }
  }, [])

  const restart = useCallback(() => {
    if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current)
    play('click')
    setQuestions(shuffleAlcoholTrivia(QUESTION_COUNT))
    setCurrent(0)
    setSelected(null)
    setIsAnswered(false)
    setScore(0)
  }, [play])

  const showResult = questions.length > 0 && current >= questions.length - 1 && isAnswered

  return (
    <div className="flex flex-col items-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="酒精知識王">
      <GameRules
        rules="酒精與品酒知識選擇題，答對得分、答錯喝一口。"
        rulesKey="alcohol-trivia.rules"
      />
      <Wine className="w-12 h-12 text-primary-400 mb-2" />
      <p className="text-white/60 text-sm mb-2">酒精知識王 · 答錯喝</p>
      <p className="text-white/50 text-xs mb-4">
        第 {current + 1} / {questions.length} 題 · 得分 {score}
      </p>

      {!showResult && q && (
        <m.div key={current} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg">
          <p className="text-white font-medium mb-4 text-center">{q.q}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.a.map((opt, i) => {
              const chosen = selected === i
              const correct = i === q.correct
              const showCorrect = isAnswered && correct
              const showWrong = isAnswered && chosen && !correct
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAnswer(i)}
                  disabled={isAnswered}
                  className={`min-h-[48px] px-4 py-3 rounded-xl border-2 text-left games-focus-ring flex items-center gap-2 ${
                    showCorrect
                      ? 'bg-green-500/20 border-green-500 text-white'
                      : showWrong
                        ? 'bg-red-500/20 border-red-500 text-white'
                        : chosen
                          ? 'bg-white/15 border-white/40 text-white'
                          : 'bg-white/10 border-white/20 text-white/90 hover:bg-white/15'
                  }`}
                >
                  {isAnswered && (showCorrect ? <Check className="w-5 h-5 text-green-400 shrink-0" /> : showWrong ? <X className="w-5 h-5 text-red-400 shrink-0" /> : null)}
                  <span>{opt}</span>
                </button>
              )
            })}
          </div>
          {isWrong && (
            <div className="mt-4 text-center">
              <p className="text-red-300 font-medium">答錯了～喝一口！</p>
              {!reducedMotion && <DrinkingAnimation duration={1.2} className="my-3 mx-auto" />}
            </div>
          )}
        </m.div>
      )}

      <AnimatePresence>
        {showResult && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center max-w-md mt-4"
          >
            <p className="text-white text-lg mb-2">本輪結束</p>
            <p className="text-primary-300 font-bold text-xl mb-4">得分 {score} / {questions.length}</p>
            <button type="button" onClick={restart} className="btn-primary min-h-[48px] px-6 py-3 games-focus-ring">
              再玩一輪
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
