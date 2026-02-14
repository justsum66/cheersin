/**
 * 真心話大冒險題庫單元測試：getTruthPool、getDarePool
 */
import { describe, it, expect } from 'vitest'
import { getTruthPool, getDarePool } from './truth-or-dare'

describe('getTruthPool', () => {
  it('returns array', async () => {
    const pool = await getTruthPool()
    expect(Array.isArray(pool)).toBe(true)
    expect(pool.length).toBeGreaterThan(0)
  })

  it('each item has text, level, optional stars', async () => {
    const pool = await getTruthPool()
    pool.slice(0, 5).forEach((item) => {
      expect(typeof item.text).toBe('string')
      expect(['mild', 'spicy', 'adult']).toContain(item.level)
    })
  })
})

describe('getDarePool', () => {
  it('returns array', async () => {
    const pool = await getDarePool()
    expect(Array.isArray(pool)).toBe(true)
    expect(pool.length).toBeGreaterThan(0)
  })

  it('each item has text and level', async () => {
    const pool = await getDarePool()
    pool.slice(0, 5).forEach((item) => {
      expect(typeof item.text).toBe('string')
      expect(['mild', 'spicy', 'adult']).toContain(item.level)
    })
  })
})
