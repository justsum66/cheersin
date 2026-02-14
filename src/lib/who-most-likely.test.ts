/**
 * 誰最可能題庫單元測試：getQuestionsByCategory、CATEGORY_LABEL
 */
import { describe, it, expect } from 'vitest'
import { getQuestionsByCategory, CATEGORY_LABEL } from './who-most-likely'

describe('getQuestionsByCategory', () => {
  it('returns array for all', async () => {
    const list = await getQuestionsByCategory('all')
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBeGreaterThan(0)
  })

  it('each item has id, text, level', async () => {
    const list = await getQuestionsByCategory('all')
    list.slice(0, 5).forEach((item) => {
      expect(typeof item.id).toBe('number')
      expect(typeof item.text).toBe('string')
      expect(typeof item.level).toBe('string')
      expect(item.text).toMatch(/誰最可能/)
    })
  })

  it('love category returns array', async () => {
    const list = await getQuestionsByCategory('love')
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBeGreaterThan(0)
  })

  it('friendship category returns array', async () => {
    const list = await getQuestionsByCategory('friendship')
    expect(Array.isArray(list)).toBe(true)
  })
})

describe('CATEGORY_LABEL', () => {
  it('has labels for all categories', () => {
    expect(CATEGORY_LABEL.love).toBe('愛情')
    expect(CATEGORY_LABEL.friendship).toBe('友情')
    expect(CATEGORY_LABEL.work).toBe('工作')
    expect(CATEGORY_LABEL.life).toBe('生活')
    expect(CATEGORY_LABEL.funny).toBe('搞笑')
  })
})
