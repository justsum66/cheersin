// @vitest-environment node
/**
 * P0-30: Admin auth unit tests
 */
import { describe, it, expect } from 'vitest'
import { verifyAdminSecret, isAdminRequest } from './admin-auth'

describe('verifyAdminSecret', () => {
  it('returns true for matching secret', () => {
    expect(verifyAdminSecret('my-secret-123', 'my-secret-123')).toBe(true)
  })

  it('returns false for wrong secret', () => {
    expect(verifyAdminSecret('wrong', 'my-secret-123')).toBe(false)
  })

  it('returns false for null header', () => {
    expect(verifyAdminSecret(null, 'my-secret')).toBe(false)
  })

  it('returns false when secret is undefined', () => {
    expect(verifyAdminSecret('something', undefined)).toBe(false)
  })

  it('returns false when secret is empty', () => {
    expect(verifyAdminSecret('something', '')).toBe(false)
  })

  it('returns false for different length strings', () => {
    expect(verifyAdminSecret('short', 'much-longer-secret')).toBe(false)
  })

  it('handles empty header with valid secret', () => {
    expect(verifyAdminSecret('', 'secret')).toBe(false)
  })
})

describe('isAdminRequest', () => {
  it('allows dev mode when no secret set', () => {
    expect(isAdminRequest(null, undefined, true)).toBe(true)
  })

  it('allows dev mode with empty secret', () => {
    expect(isAdminRequest(null, '', true)).toBe(true)
  })

  it('denies non-dev when no secret set', () => {
    expect(isAdminRequest(null, undefined, false)).toBe(false)
  })

  it('verifies secret in production', () => {
    expect(isAdminRequest('correct', 'correct', false)).toBe(true)
    expect(isAdminRequest('wrong', 'correct', false)).toBe(false)
  })

  it('verifies secret even in dev when secret is set', () => {
    expect(isAdminRequest('correct', 'correct', true)).toBe(true)
    expect(isAdminRequest('wrong', 'correct', true)).toBe(false)
  })
})
