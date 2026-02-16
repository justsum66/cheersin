// @vitest-environment node
/**
 * P1-41 test: Server-side AI usage tracking
 */
import { describe, it, expect } from 'vitest'
import {
  getServerAiCallCount,
  incrementServerAiCallCount,
  checkServerAiUsage,
  cleanupExpiredUsageEntries,
} from './server-usage-tracking'

describe('server-usage-tracking', () => {
  it('starts at 0 for new user', () => {
    const uid = 'user-track-' + Date.now()
    expect(getServerAiCallCount(uid)).toBe(0)
  })

  it('increments count', () => {
    const uid = 'user-inc-' + Date.now()
    expect(incrementServerAiCallCount(uid)).toBe(1)
    expect(incrementServerAiCallCount(uid)).toBe(2)
    expect(getServerAiCallCount(uid)).toBe(2)
  })

  it('checkServerAiUsage allows when under limit', () => {
    const uid = 'user-allow-' + Date.now()
    const result = checkServerAiUsage(uid, 3)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(3)
  })

  it('checkServerAiUsage blocks when at limit', () => {
    const uid = 'user-block-' + Date.now()
    incrementServerAiCallCount(uid)
    incrementServerAiCallCount(uid)
    incrementServerAiCallCount(uid)
    const result = checkServerAiUsage(uid, 3)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.used).toBe(3)
  })

  it('unlimited tier (-1) always allowed', () => {
    const uid = 'user-unlimited-' + Date.now()
    for (let i = 0; i < 100; i++) incrementServerAiCallCount(uid)
    const result = checkServerAiUsage(uid, -1)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(-1)
  })

  it('cleanup returns number', () => {
    const cleaned = cleanupExpiredUsageEntries()
    expect(typeof cleaned).toBe('number')
    expect(cleaned).toBeGreaterThanOrEqual(0)
  })
})
