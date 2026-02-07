/**
 * 書籤單元測試
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { getBookmarks, addBookmark, removeBookmark, hasBookmark, getBookmarkLimit } from './learn-bookmarks'

describe('learn-bookmarks', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear()
  })

  it('returns empty when no bookmarks', () => {
    expect(getBookmarks()).toEqual([])
  })

  it('addBookmark adds and returns ok', () => {
    const r = addBookmark({ courseId: 'wine-basics', chapterId: 1, title: 'Ch1', courseTitle: '葡萄酒' })
    expect(r.ok).toBe(true)
    expect(getBookmarks()).toHaveLength(1)
  })

  it('does not duplicate same course+chapter', () => {
    addBookmark({ courseId: 'wine', chapterId: 1, title: 'A', courseTitle: 'Wine' })
    const r = addBookmark({ courseId: 'wine', chapterId: 1, title: 'A', courseTitle: 'Wine' })
    expect(r.ok).toBe(false)
    expect(getBookmarks()).toHaveLength(1)
  })

  it('hasBookmark returns true when exists', () => {
    addBookmark({ courseId: 'x', chapterId: 2, title: 'T', courseTitle: 'C' })
    expect(hasBookmark('x', 2)).toBe(true)
    expect(hasBookmark('x', 3)).toBe(false)
  })

  it('removeBookmark removes entry', () => {
    addBookmark({ courseId: 'a', chapterId: 1, title: 'T', courseTitle: 'C' })
    removeBookmark('a', 1)
    expect(hasBookmark('a', 1)).toBe(false)
    expect(getBookmarks()).toHaveLength(0)
  })

  it('getBookmarkLimit returns 50', () => {
    expect(getBookmarkLimit()).toBe(50)
  })

  it('addBookmark at limit returns atLimit', () => {
    for (let i = 0; i < 50; i++) {
      addBookmark({ courseId: `c${i}`, chapterId: 1, title: 'T', courseTitle: 'C' })
    }
    const r = addBookmark({ courseId: 'c50', chapterId: 1, title: 'T', courseTitle: 'C' })
    expect(r.ok).toBe(false)
    expect(r.atLimit).toBe(true)
  })
})
