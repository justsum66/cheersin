'use client'

import { useState, useEffect, useRef } from 'react'
import { m } from 'framer-motion'
import { HelpCircle, Sparkles } from 'lucide-react'
import { useGameSound } from '@/hooks/useGameSound'
import { addPoints } from '@/lib/gamification'
import { addWrongAnswer } from '@/lib/wrong-answers'
import { getWrongAnswersByCourseAndChapter } from '@/lib/wrong-answers'
import { getQuizPassed, setQuizPassed } from '@/lib/learn-progress.utils'
import { CHAPTER_QUIZ_PASS_THRESHOLD } from '@/config/learn.config'
import type { ChapterQuizItem } from './LearnCourseContent'

interface ChapterQuizProps {
  courseId: string
  courseTitle: string
  chapterId: number
  chapterTitle: string
  quiz: ChapterQuizItem[]
  onQuizStateChange?: (state: { step: number; correctCount: number; passed: boolean }) => void
}

export function ChapterQuiz({
  courseId,
  courseTitle,
  chapterId,
  chapterTitle,
  quiz,
  onQuizStateChange,
}: ChapterQuizProps) {
  const { play } = useGameSound()
  const [step, setStep] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [showCorrect, setShowCorrect] = useState(false)
  const [wrongIdx, setWrongIdx] = useState<number | undefined>(undefined)
  const [shuffledMap, setShuffledMap] = useState<Record<number, number[]>>({})
  const quizPassedSetRef = useRef<Set<string>>(new Set())

  // P2.C2.3 題目難度自適應：曾錯題排後面
  const wrongForChapter = getWrongAnswersByCourseAndChapter(courseId, chapterId)
  const wrongQuestionSet = new Set(wrongForChapter.map((w) => w.question))
  const orderedQuiz = [
    ...quiz.filter((q) => !wrongQuestionSet.has(q.question)),
    ...quiz.filter((q) => wrongQuestionSet.has(q.question)),
  ]

  const chapterPassed = getQuizPassed(courseId, chapterId)
  const quizDone = step >= orderedQuiz.length
  const threshold = Math.ceil(orderedQuiz.length * CHAPTER_QUIZ_PASS_THRESHOLD)
  const quizJustPassed = quizDone && correctCount >= threshold
  const canCompleteChapter = chapterPassed || quizJustPassed

  // 通知父組件測驗狀態變化
  useEffect(() => {
    if (onQuizStateChange) {
      onQuizStateChange({
        step,
        correctCount,
        passed: canCompleteChapter,
      })
    }
  }, [step, correctCount, canCompleteChapter, onQuizStateChange])

  // 當測驗通過時，記錄到 localStorage
  useEffect(() => {
    if (quizJustPassed) {
      const key = `${courseId}-${chapterId}`
      if (!quizPassedSetRef.current.has(key)) {
        quizPassedSetRef.current.add(key)
        setQuizPassed(courseId, chapterId)
      }
    }
  }, [quizJustPassed, courseId, chapterId])

  const handleOption = (qIdx: number, mappedIdx: number) => {
    if (showCorrect) return

    const q = orderedQuiz[qIdx]
    const shuffled = shuffledMap[qIdx] || []
    const optIdx = shuffled[mappedIdx]
    const correct = optIdx === q.correctIndex

    if (correct) {
      setCorrectCount((prev) => prev + 1)
      setStep(qIdx + 1)
      setShowCorrect(false)
      setWrongIdx(undefined)
      addPoints(5)
      play('correct')
    } else {
      setShowCorrect(true)
      setWrongIdx(mappedIdx)
      play('wrong')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
      
      // Phase 2 C2.2: 將錯題加入錯題本
      addWrongAnswer({
        courseId,
        courseTitle,
        chapterId,
        chapterTitle,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        userAnswer: optIdx,
        explanation: q.explanation,
      })
    }
  }

  const getShuffledOptions = (qIdx: number, options: string[]) => {
    if (shuffledMap[qIdx] && shuffledMap[qIdx].length === options.length) {
      return shuffledMap[qIdx]
    }

    const idx = options.map((_, i) => i)
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[idx[i], idx[j]] = [idx[j], idx[i]]
    }

    setShuffledMap((prev) => ({ ...prev, [qIdx]: idx }))
    return idx
  }

  return (
    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-primary-500/20 space-y-3">
      <div className="flex items-center gap-2 text-primary-400 text-sm font-medium">
        <HelpCircle className="w-4 h-4" />
        小測驗
      </div>

      {orderedQuiz.map((q, qIdx) => {
        const isCurrent = step === qIdx
        if (!isCurrent) return null

        const shuffled = getShuffledOptions(qIdx, q.options)

        return (
          <div key={qIdx} className="space-y-2">
            <p className="text-white/90 text-sm font-medium">
              {qIdx + 1}. {q.question}
            </p>

            {/* Phase 1 D4.1: 測驗選項 hover 動畫優化 */}
            <div className="flex flex-wrap gap-2">
              {shuffled.map((origIdx, mappedIdx) => {
                const opt = q.options[origIdx]
                const isCorrect = origIdx === q.correctIndex
                const chosen = showCorrect && isCorrect
                const wrong = showCorrect && wrongIdx === mappedIdx

                return (
                  <m.button
                    key={mappedIdx}
                    type="button"
                    onClick={() => handleOption(qIdx, mappedIdx)}
                    disabled={showCorrect}
                    whileHover={!showCorrect ? { scale: 1.05, y: -2 } : {}}
                    whileTap={!showCorrect ? { scale: 0.95 } : {}}
                    animate={
                      showCorrect
                        ? chosen
                          ? { scale: [1, 1.08, 1.05] }
                          : wrong
                          ? { x: [0, -8, 8, -6, 6, 0] }
                          : {}
                        : {}
                    }
                    transition={
                      showCorrect && (chosen || wrong)
                        ? { duration: chosen ? 0.35 : 0.45, ease: chosen ? 'easeOut' : 'easeInOut' }
                        : { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                    }
                    className={`min-h-[48px] min-w-[48px] px-3 py-2 rounded-lg text-sm border transition-all games-focus-ring ${
                      chosen
                        ? 'bg-primary-500/30 border-primary-500 text-primary-300 ring-2 ring-primary-500/50 shadow-lg'
                        : wrong
                        ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-red-500/20'
                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 hover:shadow-md disabled:opacity-70'
                    }`}
                  >
                    {opt}
                  </m.button>
                )
              })}
            </div>

            {/* Phase 1 D4.2: 測驗結果揭曉動畫 */}
            {/* Phase 2 C1.1: 測驗解析模式 - 顯示詳細解釋 */}
            {showCorrect && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-3"
              >
                <m.p
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="text-white/50 text-xs"
                >
                  正確答案：{q.options[q.correctIndex]}
                </m.p>

                {/* Phase 2 C1.1: 解析區塊 */}
                {q.explanation && (
                  <m.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="p-3 rounded-lg bg-gradient-to-br from-primary-500/10 to-accent-500/5 border border-primary-500/20"
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-primary-300 text-xs font-medium mb-1">解析說明</p>
                        <p className="text-white/70 text-sm leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  </m.div>
                )}

                {qIdx < orderedQuiz.length - 1 && (
                  <m.button
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: q.explanation ? 0.4 : 0.2, duration: 0.3 }}
                    type="button"
                    onClick={() => {
                      setStep(qIdx + 1)
                      setShowCorrect(false)
                      setWrongIdx(undefined)
                    }}
                    className="mt-2 min-h-[48px] px-3 py-2 rounded-lg text-xs text-primary-400 hover:text-primary-300 games-focus-ring"
                  >
                    下一題 →
                  </m.button>
                )}
              </m.div>
            )}
          </div>
        )
      })}

      {quizDone && (
        quizJustPassed ? (
          <p className="text-primary-400 text-xs">測驗通過，可點下方「完成本章」</p>
        ) : (
          <p className="text-amber-400 text-xs">未通過（需 80% 正確），請再答一次</p>
        )
      )}
    </div>
  )
}
