// @vitest-environment node
/**
 * P0-26: Rate limiter unit tests
 */
import { describe, it, expect } from 'vitest'
import { checkRateLimit, cleanupExpiredEntries, getClientIP } from './rate-limit'
import type { RateLimitConfig } from './rate-limit'

describe('checkRateLimit', () => {
  const testConfig: RateLimitConfig = { maxRequests: 3, windowMs: 1000 }

  it('allows first request', () => {
    const result = checkRateLimit('test-rate-1-' + Date.now(), testConfig)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('decrements remaining on each request', () => {
    const key = 'test-rate-dec-' + Date.now()
    const r1 = checkRateLimit(key, testConfig)
    expect(r1.remaining).toBe(2)
    const r2 = checkRateLimit(key, testConfig)
    expect(r2.remaining).toBe(1)
    const r3 = checkRateLimit(key, testConfig)
    expect(r3.remaining).toBe(0)
  })

  it('blocks after max requests', () => {
    const key = 'test-rate-block-' + Date.now()
    checkRateLimit(key, testConfig)
    checkRateLimit(key, testConfig)
    checkRateLimit(key, testConfig)
    const result = checkRateLimit(key, testConfig)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('resets after window expires', async () => {
    const shortConfig: RateLimitConfig = { maxRequests: 1, windowMs: 50 }
    const key = 'test-rate-reset-' + Date.now()
    checkRateLimit(key, shortConfig)
    const blocked = checkRateLimit(key, shortConfig)
    expect(blocked.success).toBe(false)
    await new Promise(r => setTimeout(r, 60))
    const result = checkRateLimit(key, shortConfig)
    expect(result.success).toBe(true)
  })

  it('provides resetAt timestamp', () => {
    const key = 'test-rate-resetat-' + Date.now()
    const result = checkRateLimit(key, testConfig)
    expect(result.resetAt).toBeGreaterThan(Date.now() - 100)
  })
})

describe('cleanupExpiredEntries', () => {
  it('returns number of cleaned entries', () => {
    const cleaned = cleanupExpiredEntries()
    expect(typeof cleaned).toBe('number')
    expect(cleaned).toBeGreaterThanOrEqual(0)
  })
})

describe('getClientIP', () => {
  it('extracts cf-connecting-ip', () => {
    const headers = new Headers({ 'cf-connecting-ip': '1.2.3.4' })
    expect(getClientIP(headers)).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip', () => {
    const headers = new Headers({ 'x-real-ip': '5.6.7.8' })
    expect(getClientIP(headers)).toBe('5.6.7.8')
  })

  it('falls back to x-forwarded-for first IP', () => {
    const headers = new Headers({ 'x-forwarded-for': '10.0.0.1, 10.0.0.2' })
    expect(getClientIP(headers)).toBe('10.0.0.1')
  })

  it('returns unknown when no headers', () => {
    const headers = new Headers()
    expect(getClientIP(headers)).toBe('unknown')
  })

  it('trims whitespace from IP', () => {
    const headers = new Headers({ 'cf-connecting-ip': '  1.2.3.4  ' })
    expect(getClientIP(headers)).toBe('1.2.3.4')
  })

  it('prefers cf-connecting-ip over x-forwarded-for', () => {
    const headers = new Headers({
      'cf-connecting-ip': '1.1.1.1',
      'x-forwarded-for': '2.2.2.2',
    })
    expect(getClientIP(headers)).toBe('1.1.1.1')
  })
})
