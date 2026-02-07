/**
 * 真心話大冒險題庫單元測試：getTruthPool、getDarePool
 */
import { describe, it, expect } from 'vitest'
import { getTruthPool, getDarePool } from './truth-or-dare'

describe('getTruthPool', () => {
  it('returns array', () => {
    const pool = getTruthPool()
    expect(Array.isArray(pool)).toBe(true)
    expect(pool.length).toBeGreaterThan(0)
  })

  it('each item has text, level, optional stars', () => {
    const pool = getTruthPool()
    pool.slice(0, 5).forEach((item) => {
      expect(typeof item.text).toBe('string')
      expect(['mild', 'spicy', 'adult']).toContain(item.level)
    })
  })
})

describe('getDarePool', () => {
  it('returns array', () => {
    const pool = getDarePool()
    expect(Array.isArray(pool)).toBe(true)
    expect(pool.length).toBeGreaterThan(0)
  })

  it('each item has text and level', () => {
    const pool = getDarePool()
    pool.slice(0, 5).forEach((item) => {
      expect(typeof item.text).toBe('string')
      expect(['mild', 'spicy', 'adult']).toContain(item.level)
    })
  })
})
