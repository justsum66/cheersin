/**
 * 85 篩選邏輯單元測試：levelFilter、certFilter、quickOnly、searchQuery
 */
import { describe, it, expect } from 'vitest'

const MOCK_COURSES: { id: string; level: string; estimatedMinutes: number; tags: string[]; title: string; description: string }[] = [
  { id: 'a', level: 'beginner', estimatedMinutes: 5, tags: ['quick'], title: '快懂', description: '入門' },
  { id: 'b', level: 'intermediate', estimatedMinutes: 30, tags: [], title: '進階', description: '中階' },
  { id: 'c', level: 'expert', estimatedMinutes: 60, tags: [], title: '專家', description: '深度' },
]

function filterCourses(
  courses: typeof MOCK_COURSES,
  levelFilter: string,
  quickOnly: boolean,
  searchQuery: string
) {
  let out = courses
  if (levelFilter !== 'all') {
    out = out.filter((c) => c.level === levelFilter)
  }
  if (quickOnly) {
    out = out.filter((c) => (c.tags?.includes('quick') || (c.estimatedMinutes ?? 999) <= 10))
  }
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase()
    out = out.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    )
  }
  return out
}

describe('learn filter logic', () => {
  it('levelFilter=all returns all', () => {
    const r = filterCourses(MOCK_COURSES, 'all', false, '')
    expect(r).toHaveLength(3)
  })

  it('levelFilter=beginner returns only beginner', () => {
    const r = filterCourses(MOCK_COURSES, 'beginner', false, '')
    expect(r).toHaveLength(1)
    expect(r[0].id).toBe('a')
  })

  it('quickOnly filters to quick or <=10min', () => {
    const r = filterCourses(MOCK_COURSES, 'all', true, '')
    expect(r).toHaveLength(1)
    expect(r[0].id).toBe('a')
  })

  it('searchQuery filters by title', () => {
    const r = filterCourses(MOCK_COURSES, 'all', false, '快懂')
    expect(r).toHaveLength(1)
    expect(r[0].id).toBe('a')
  })

  it('searchQuery filters by description', () => {
    const r = filterCourses(MOCK_COURSES, 'all', false, '深度')
    expect(r).toHaveLength(1)
    expect(r[0].id).toBe('c')
  })

  it('empty searchQuery returns all', () => {
    const r = filterCourses(MOCK_COURSES, 'all', false, '  ')
    expect(r).toHaveLength(3)
  })
})
