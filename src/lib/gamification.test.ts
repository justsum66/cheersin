/**
 * 遊戲化單元測試：積分、連續天數、徽章、排行榜（jsdom localStorage）
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { getPoints, addPoints, getStreak, recordStudyToday, getUnlockedBadges, getLeaderboard } from './gamification'

describe('gamification', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
  })

  describe('getPoints', () => {
    it('returns 0 when no storage', () => {
      expect(getPoints()).toBe(0)
    })

    it('returns stored points when valid number', () => {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem('cheersin_points', '100')
      expect(getPoints()).toBe(100)
    })

    it('returns 0 for invalid stored value', () => {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem('cheersin_points', 'abc')
      expect(getPoints()).toBe(0)
    })
  })

  describe('addPoints', () => {
    it('adds delta and returns new total', () => {
      const next = addPoints(10)
      expect(next).toBe(10)
      expect(getPoints()).toBe(10)
    })

    it('does not go below 0', () => {
      addPoints(5)
      const next = addPoints(-10)
      expect(next).toBe(0)
      expect(getPoints()).toBe(0)
    })
  })

  describe('getStreak', () => {
    it('returns 0 days when no storage', () => {
      const s = getStreak()
      expect(s.days).toBe(0)
      expect(s.lastDate).toBe('')
    })

    it('returns stored streak when set', () => {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem('cheersin_streak_last_date', '2026-02-01')
      localStorage.setItem('cheersin_streak_days', '3')
      const s = getStreak()
      expect(s.days).toBe(3)
      expect(s.lastDate).toBe('2026-02-01')
    })
  })

  describe('recordStudyToday', () => {
    it('updates streak when called', () => {
      const days = recordStudyToday()
      expect(typeof days).toBe('number')
      expect(days).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getUnlockedBadges', () => {
    it('returns empty array when no storage', () => {
      expect(getUnlockedBadges()).toEqual([])
    })

    it('returns parsed array when valid JSON', () => {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem('cheersin_badges', '["first-quiz","streak-7"]')
      expect(getUnlockedBadges()).toContain('first-quiz')
      expect(getUnlockedBadges()).toContain('streak-7')
    })
  })

  describe('getLeaderboard', () => {
    it('returns array of entries with rank and points', () => {
      const list = getLeaderboard()
      expect(Array.isArray(list)).toBe(true)
      expect(list.length).toBeGreaterThan(0)
      list.forEach((e) => {
        expect(typeof e.rank).toBe('number')
        expect(typeof e.name).toBe('string')
        expect(typeof e.points).toBe('number')
      })
    })
  })
})
