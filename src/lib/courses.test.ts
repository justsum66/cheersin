/**
 * 課程資料單元測試：getCourseIds、getCourse、COURSE_META（需在專案根執行，data/courses 存在）
 */
import { describe, it, expect } from 'vitest'
import { getCourseIds, getCourse, COURSE_META } from './courses'

describe('getCourseIds', () => {
  it('returns array of course ids', () => {
    const ids = getCourseIds()
    expect(Array.isArray(ids)).toBe(true)
    expect(ids).toContain('wine-basics')
    expect(ids).toContain('whisky-101')
  })

  it('includes wine-basics and whisky-101', () => {
    const ids = getCourseIds()
    expect(ids.length).toBeGreaterThanOrEqual(2)
  })
})

describe('getCourse', () => {
  it('returns course data for wine-basics', () => {
    const course = getCourse('wine-basics')
    expect(course).not.toBeNull()
    if (course) {
      expect(course.id).toBe('wine-basics')
      expect(course.title).toBe('葡萄酒入門')
      expect(Array.isArray(course.chapters)).toBe(true)
      expect(course.chapters.length).toBeGreaterThan(0)
    }
  })

  it('returns null for invalid course id', () => {
    expect(getCourse('invalid-id-xyz')).toBeNull()
  })

  it('returns course with optional quiz on chapters', () => {
    const course = getCourse('wine-basics')
    if (!course) return
    const withQuiz = course.chapters.find((ch) => ch.quiz && ch.quiz.length > 0)
    expect(withQuiz == null || Array.isArray(withQuiz?.quiz)).toBe(true)
  })
})

describe('COURSE_META', () => {
  it('has entries for wine-basics and whisky-101', () => {
    expect(COURSE_META['wine-basics']).toBeDefined()
    expect(COURSE_META['whisky-101']).toBeDefined()
    expect(COURSE_META['wine-basics'].title).toBe('葡萄酒入門')
    expect(COURSE_META['whisky-101'].free).toBe(true)
  })

  it('free is boolean for each entry', () => {
    Object.values(COURSE_META).forEach((meta) => {
      expect(typeof meta.free).toBe('boolean')
      expect(typeof meta.title).toBe('string')
    })
  })
})
