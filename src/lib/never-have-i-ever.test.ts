/**
 * 我從來沒有題庫單元測試：getStatementsByCategory、CATEGORY_LABEL
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getStatementsByCategory, CATEGORY_LABEL } from './never-have-i-ever'

describe('getStatementsByCategory', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => [
        { text: '我從來沒有 1', category: 'love' },
        { text: '我從來沒有 2', category: 'work' },
        { text: '我從來沒有 3', category: 'life' },
        { text: '我從來沒有 4', category: 'dark' },
        { text: '我從來沒有 5', category: 'adult' },
      ],
    })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns array for all', async () => {
    const list = await getStatementsByCategory('all')
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBeGreaterThan(0)
  })

  it('each item has text and category', async () => {
    const list = await getStatementsByCategory('all')
    const cats = ['love', 'work', 'life', 'dark', 'adult']
    list.slice(0, 5).forEach((item) => {
      expect(typeof item.text).toBe('string')
      expect(item.text.length).toBeGreaterThan(0)
      expect(cats).toContain(item.category)
    })
  })

  it('love category returns array', async () => {
    const list = await getStatementsByCategory('love')
    expect(Array.isArray(list)).toBe(true)
    list.forEach((item) => {
      expect(item.category).toBe('love')
      expect(item.text).toMatch(/我從來沒有/)
    })
  })

  it('work category returns array', async () => {
    const list = await getStatementsByCategory('work')
    expect(Array.isArray(list)).toBe(true)
    list.forEach((item) => expect(item.category).toBe('work'))
  })
})

describe('CATEGORY_LABEL', () => {
  it('has labels for all five categories', () => {
    expect(CATEGORY_LABEL.love).toBe('愛情')
    expect(CATEGORY_LABEL.work).toBe('職場')
    expect(CATEGORY_LABEL.life).toBe('生活')
    expect(CATEGORY_LABEL.dark).toBe('黑歷史')
    expect(CATEGORY_LABEL.adult).toBe('18+')
  })
})
