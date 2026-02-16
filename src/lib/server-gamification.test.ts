// @vitest-environment node
/**
 * P1-43 test: Server-side gamification validation
 */
import { describe, it, expect } from 'vitest'
import {
  validatePointAward,
  validateBadgeUnlock,
  validateStreak,
  validateSommelierLevel,
} from './server-gamification'

describe('validatePointAward', () => {
  it('accepts valid point action', () => {
    const result = validatePointAward('complete_chapter', 10)
    expect(result.valid).toBe(true)
    expect(result.expectedPoints).toBe(10)
  })

  it('rejects wrong point amount', () => {
    const result = validatePointAward('complete_chapter', 999)
    expect(result.valid).toBe(false)
    expect(result.expectedPoints).toBe(10)
  })

  it('rejects unknown action', () => {
    const result = validatePointAward('hack_points', 100)
    expect(result.valid).toBe(false)
  })

  it('rejects negative points', () => {
    const result = validatePointAward('complete_chapter', -10)
    expect(result.valid).toBe(false)
  })

  it('rejects zero points', () => {
    const result = validatePointAward('complete_chapter', 0)
    expect(result.valid).toBe(false)
  })

  it('rejects exceeding max per action', () => {
    const result = validatePointAward('complete_course', 1000)
    expect(result.valid).toBe(false)
  })
})

describe('validateBadgeUnlock', () => {
  it('rejects unknown badge', () => {
    const result = validateBadgeUnlock('fake-badge', {})
    expect(result.eligible).toBe(false)
  })

  it('allows first-quiz badge', () => {
    const result = validateBadgeUnlock('first-quiz', {})
    expect(result.eligible).toBe(true)
  })

  it('allows games-10 with enough games', () => {
    const result = validateBadgeUnlock('games-10', { gamesPlayed: 10 })
    expect(result.eligible).toBe(true)
  })

  it('rejects games-10 without enough games', () => {
    const result = validateBadgeUnlock('games-10', { gamesPlayed: 5 })
    expect(result.eligible).toBe(false)
  })

  it('checks learn minutes for learn badges', () => {
    expect(validateBadgeUnlock('learn-60', { learnMinutes: 59 }).eligible).toBe(false)
    expect(validateBadgeUnlock('learn-60', { learnMinutes: 60 }).eligible).toBe(true)
    expect(validateBadgeUnlock('learn-120', { learnMinutes: 120 }).eligible).toBe(true)
    expect(validateBadgeUnlock('learn-300', { learnMinutes: 300 }).eligible).toBe(true)
  })

  it('checks bookmarks for bookmark badges', () => {
    expect(validateBadgeUnlock('bookmark-5', { bookmarks: 4 }).eligible).toBe(false)
    expect(validateBadgeUnlock('bookmark-5', { bookmarks: 5 }).eligible).toBe(true)
    expect(validateBadgeUnlock('bookmark-10', { bookmarks: 10 }).eligible).toBe(true)
  })
})

describe('validateStreak', () => {
  it('validates zero streak with no date', () => {
    const result = validateStreak('', 0)
    expect(result.valid).toBe(true)
    expect(result.correctedDays).toBe(0)
  })

  it('rejects negative streak', () => {
    const result = validateStreak('', -5)
    expect(result.valid).toBe(false)
  })

  it('caps streak at 365', () => {
    const result = validateStreak('2026-01-01', 1000)
    expect(result.valid).toBe(false)
    expect(result.correctedDays).toBe(365)
  })

  it('rejects invalid date', () => {
    const result = validateStreak('not-a-date', 5)
    expect(result.valid).toBe(false)
    expect(result.correctedDays).toBe(0)
  })
})

describe('validateSommelierLevel', () => {
  it('correctly validates levels', () => {
    expect(validateSommelierLevel(null, 0).valid).toBe(true)
    expect(validateSommelierLevel('銅牌', 3).valid).toBe(true)
    expect(validateSommelierLevel('銀牌', 8).valid).toBe(true)
    expect(validateSommelierLevel('金牌', 15).valid).toBe(true)
    expect(validateSommelierLevel('品酒師', 25).valid).toBe(true)
  })

  it('detects spoofed level', () => {
    expect(validateSommelierLevel('品酒師', 2).valid).toBe(false)
    expect(validateSommelierLevel('品酒師', 2).correctLevel).toBeNull()
  })
})
