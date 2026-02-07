/**
 * 84 測驗邏輯單元測試：quiz correctIndex、options 驗證
 */
import { describe, it, expect } from 'vitest'
import { getCourse, getCourseIds } from './courses'

describe('course quiz logic', () => {
  it('all quiz items have valid correctIndex', () => {
    const ids = getCourseIds()
    for (const id of ids) {
      const course = getCourse(id)
      if (!course?.chapters) continue
      for (const ch of course.chapters) {
        for (const q of ch.quiz ?? []) {
          expect(Array.isArray(q.options)).toBe(true)
          expect(q.options.length).toBeGreaterThan(0)
          expect(q.correctIndex).toBeGreaterThanOrEqual(0)
          expect(q.correctIndex).toBeLessThan(q.options.length)
          expect(typeof q.question).toBe('string')
          expect(q.question.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('chapters without quiz can have empty or undefined quiz', () => {
    const course = getCourse('beginner-faq')
    expect(course).not.toBeNull()
    if (course) {
      const withQuiz = course.chapters.filter((ch) => ch.quiz && ch.quiz.length > 0)
      expect(withQuiz.length).toBe(0)
    }
  })

  it('chapters with quiz have at least one question', () => {
    const course = getCourse('wine-basics')
    expect(course).not.toBeNull()
    if (course) {
      const withQuiz = course.chapters.filter((ch) => ch.quiz && ch.quiz.length > 0)
      expect(withQuiz.length).toBeGreaterThan(0)
      for (const ch of withQuiz) {
        expect(ch.quiz!.length).toBeGreaterThanOrEqual(1)
      }
    }
  })
})
