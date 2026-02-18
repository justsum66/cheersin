import { useState, useEffect, useRef, useCallback } from 'react'
import { LEARN_QUIZ_PASSED_KEY, CHAPTER_QUIZ_PASS_THRESHOLD } from '@/config/learn.config'

export interface QuizStateItem {
  step: number
  showCorrect: boolean
  wrongIdx?: number
  shuffledMap?: Record<number, number[]>
}

interface ChapterWithQuiz {
  id: number
  quiz?: { question: string; options: string[]; correctIndex: number }[]
}

interface UseQuizStateReturn {
  quizState: Record<number, QuizStateItem>
  setQuizState: React.Dispatch<React.SetStateAction<Record<number, QuizStateItem>>>
  quizCorrectCount: Record<number, number>
  setQuizCorrectCount: React.Dispatch<React.SetStateAction<Record<number, number>>>
  isQuizPassed: (chapterId: number) => boolean
}

function getQuizPassed(courseId: string, chapterId: number): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(LEARN_QUIZ_PASSED_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as Record<string, Record<string, boolean>>
    return !!parsed[courseId]?.[String(chapterId)]
  } catch {
    return false
  }
}

function setQuizPassedStorage(courseId: string, chapterId: number): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(LEARN_QUIZ_PASSED_KEY)
    const parsed = (raw ? JSON.parse(raw) : {}) as Record<string, Record<string, boolean>>
    if (!parsed[courseId]) parsed[courseId] = {}
    parsed[courseId][String(chapterId)] = true
    localStorage.setItem(LEARN_QUIZ_PASSED_KEY, JSON.stringify(parsed))
  } catch {
    /* ignore */
  }
}

/**
 * Hook for managing quiz state and pass tracking
 * @param courseId - The course identifier
 * @param chapters - Array of chapters with quiz data
 */
export function useQuizState(
  courseId: string,
  chapters: ChapterWithQuiz[]
): UseQuizStateReturn {
  const [quizState, setQuizState] = useState<Record<number, QuizStateItem>>({})
  const [quizCorrectCount, setQuizCorrectCount] = useState<Record<number, number>>({})
  const [, setQuizPassedRefresh] = useState(0)
  const quizPassedSetRef = useRef<Set<string>>(new Set())

  // Auto-save quiz passed state when threshold is reached
  useEffect(() => {
    chapters.forEach((ch) => {
      if (!ch.quiz?.length) return
      const step = quizState[ch.id]?.step ?? 0
      const correct = quizCorrectCount[ch.id] ?? 0
      const threshold = Math.ceil(ch.quiz.length * CHAPTER_QUIZ_PASS_THRESHOLD)
      if (step >= ch.quiz.length && correct >= threshold) {
        const key = `${courseId}-${ch.id}`
        if (!quizPassedSetRef.current.has(key)) {
          quizPassedSetRef.current.add(key)
          setQuizPassedStorage(courseId, ch.id)
          setQuizPassedRefresh((n) => n + 1)
        }
      }
    })
  }, [courseId, chapters, quizState, quizCorrectCount])

  // Check if quiz is passed for a chapter
  const isQuizPassed = useCallback((chapterId: number): boolean => {
    return getQuizPassed(courseId, chapterId)
  }, [courseId])

  return {
    quizState,
    setQuizState,
    quizCorrectCount,
    setQuizCorrectCount,
    isQuizPassed
  }
}
