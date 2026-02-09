/**
 * R2-025：Trivia 題目 useQuery — 統一快取、重試
 */
import { useQuery } from '@tanstack/react-query'

export type TriviaDifficulty = 'easy' | 'medium' | 'hard'

export interface TriviaQuestionItem {
  id?: string
  q: string
  a: string[]
  correct: number
  difficulty: string
}

interface TriviaApiResponse {
  questions: TriviaQuestionItem[]
  source?: string
}

async function fetchTriviaQuestions(limit: number, difficulty: string): Promise<TriviaApiResponse> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (difficulty && difficulty !== 'all') params.set('difficulty', difficulty)
  const res = await fetch(`/api/trivia/questions?${params.toString()}`)
  if (!res.ok) throw new Error('Trivia API failed')
  return res.json()
}

export function useTriviaQuestions(limit: number, difficulty: string, refetchKey?: number) {
  return useQuery({
    queryKey: ['trivia', 'questions', limit, difficulty, refetchKey ?? 0],
    queryFn: () => fetchTriviaQuestions(limit, difficulty),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })
}
