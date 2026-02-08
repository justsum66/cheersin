/**
 * P2-388 / The Trivia API 整合：代理題目，供 Trivia 遊戲使用
 * GET ?limit=8&difficulty=easy|medium|hard
 * 需設定 TRIVIA_API_KEY（the-trivia-api.com 註冊取得）
 */
import { NextResponse } from 'next/server'

const TRIVIA_API = 'https://the-trivia-api.com/v2/questions'

export async function GET(request: Request) {
  const apiKey = process.env.TRIVIA_API_KEY?.trim()
  const { searchParams } = new URL(request.url)
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') ?? '8', 10)))
  const difficulty = searchParams.get('difficulty') ?? ''

  if (!apiKey) {
    return NextResponse.json({ error: 'Trivia API not configured' }, { status: 503 })
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
