/**
 * P2-388 / The Trivia API 整合：代理題目，供 Trivia 遊戲使用
 * R2-023：TRIVIA_API_KEY 未設定時先試 Open Trivia DB（免 key），失敗再用本地題庫
 * GET ?limit=8&difficulty=easy|medium|hard
 */
import { NextResponse } from 'next/server'
import { getTriviaFallback } from '@/data/trivia-fallback'

const TRIVIA_API = 'https://the-trivia-api.com/v2/questions'
const OPENTDB_URL = 'https://opentdb.com/api.php'
type Difficulty = 'easy' | 'medium' | 'hard'
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

/** 解 Open Trivia 回傳的 HTML 實體 */
function decodeHtml(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
}

/** R2-023：從 Open Trivia DB 拉題（免 API key，限 5 秒/次） */
async function fetchOpenTrivia(limit: number, difficulty: string): Promise<{ questions: Array<{ id: string; q: string; a: string[]; correct: number; difficulty: string }> } | null> {
  try {
    const params = new URLSearchParams({ amount: String(limit), type: 'multiple' })
    if (difficulty && DIFFICULTIES.includes(difficulty as Difficulty)) params.set('difficulty', difficulty)
    const res = await fetch(`${OPENTDB_URL}?${params.toString()}`, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { response_code?: number; results?: Array<{ question: string; correct_answer: string; incorrect_answers: string[]; difficulty: string }> }
    if (data.response_code !== 0 || !Array.isArray(data.results) || data.results.length === 0) return null
    const questions = data.results.map((item, i) => {
      const q = decodeHtml(item.question)
      const correct = decodeHtml(item.correct_answer)
      const incorrect = (item.incorrect_answers || []).map(decodeHtml)
      const a = [correct, ...incorrect].sort(() => Math.random() - 0.5)
      return {
        id: `opentdb-${i}-${Date.now()}`,
        q,
        a,
        correct: a.indexOf(correct) >= 0 ? a.indexOf(correct) : 0,
        difficulty: item.difficulty ?? 'medium',
      }
    })
    return { questions }
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const apiKey = process.env.TRIVIA_API_KEY?.trim()
  const { searchParams } = new URL(request.url)
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') ?? '8', 10)))
  const difficultyParam = searchParams.get('difficulty') ?? ''
  const difficulty = DIFFICULTIES.includes(difficultyParam as Difficulty) ? (difficultyParam as Difficulty) : ''

  if (!apiKey) {
    const openTrivia = await fetchOpenTrivia(limit, difficulty)
    if (openTrivia && openTrivia.questions.length > 0) {
      return NextResponse.json({ questions: openTrivia.questions, source: 'opentdb.com' })
    }
    const questions = getTriviaFallback(limit, difficulty)
    return NextResponse.json({ questions, source: 'local' })
  }

  try {
    const params = new URLSearchParams()
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      params.set('difficulties', difficulty)
    }
    params.set('limit', String(limit))
    const url = `${TRIVIA_API}?${params.toString()}`
    const res = await fetch(url, {
      headers: { 'x-api-key': apiKey },
      next: { revalidate: 60 },
    })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Trivia API: ${res.status}` }, { status: 502 })
    }
    const raw = await res.json() as Array<{
      id: string
      question: { text: string }
      correctAnswer: string
      incorrectAnswers: string[]
      difficulty: 'easy' | 'medium' | 'hard'
    }>
    const questions = raw.map((item) => {
      const answers = [item.correctAnswer, ...(item.incorrectAnswers || [])].sort(() => Math.random() - 0.5)
      const correct = answers.indexOf(item.correctAnswer)
      return {
        id: item.id,
        q: item.question?.text ?? '',
        a: answers,
        correct: correct >= 0 ? correct : 0,
        difficulty: item.difficulty ?? 'medium',
      }
    })
    return NextResponse.json({ questions, source: 'the-trivia-api.com' })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Fetch failed' },
      { status: 502 }
    )
  }
}
