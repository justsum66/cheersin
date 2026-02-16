// @vitest-environment node
/**
 * P1-42 test: Server-side subscription tier verification
 */
import { describe, it, expect } from 'vitest'
import {
  isValidTier,
  resolveEffectiveTier,
  verifySubscriptionTier,
  checkFeatureAccess,
} from './server-subscription-verify'

describe('isValidTier', () => {
  it('accepts valid tiers', () => {
    expect(isValidTier('free')).toBe(true)
    expect(isValidTier('basic')).toBe(true)
    expect(isValidTier('premium')).toBe(true)
  })

  it('rejects invalid tiers', () => {
    expect(isValidTier('gold')).toBe(false)
    expect(isValidTier('')).toBe(false)
    expect(isValidTier(null)).toBe(false)
    expect(isValidTier(undefined)).toBe(false)
    expect(isValidTier(42)).toBe(false)
  })
})

describe('resolveEffectiveTier', () => {
  it('returns free for null/undefined', () => {
    expect(resolveEffectiveTier(null)).toBe('free')
    expect(resolveEffectiveTier(undefined)).toBe('free')
  })

  it('returns free for invalid tier string', () => {
    expect(resolveEffectiveTier('gold')).toBe('free')
    expect(resolveEffectiveTier('')).toBe('free')
  })

  it('returns the tier when valid and not expired', () => {
    expect(resolveEffectiveTier('premium')).toBe('premium')
    expect(resolveEffectiveTier('basic')).toBe('basic')
    expect(resolveEffectiveTier('free')).toBe('free')
  })

  it('downgrades to free when expired', () => {
    const past = new Date(Date.now() - 86_400_000).toISOString()
    expect(resolveEffectiveTier('premium', past)).toBe('free')
  })

  it('keeps tier when not expired', () => {
    const future = new Date(Date.now() + 86_400_000).toISOString()
    expect(resolveEffectiveTier('premium', future)).toBe('premium')
  })

  it('handles invalid expiration date gracefully', () => {
    expect(resolveEffectiveTier('premium', 'invalid-date')).toBe('premium')
  })
})

describe('verifySubscriptionTier', () => {
  it('detects mismatch when client lies', () => {
    const result = verifySubscriptionTier('premium', 'free')
    expect(result.effectiveTier).toBe('free')
    expect(result.mismatch).toBe(true)
  })

  it('no mismatch when client is honest', () => {
    const result = verifySubscriptionTier('premium', 'premium')
    expect(result.effectiveTier).toBe('premium')
    expect(result.mismatch).toBe(false)
  })

  it('no mismatch when client sends undefined', () => {
    const result = verifySubscriptionTier(undefined, 'free')
    expect(result.mismatch).toBe(false)
  })
})

describe('checkFeatureAccess', () => {
  it('free cannot access pro courses', () => {
    expect(checkFeatureAccess('free', 'proCourse')).toBe(false)
  })

  it('premium can access pro courses', () => {
    expect(checkFeatureAccess('premium', 'proCourse')).toBe(true)
  })

  it('basic has no ads', () => {
    expect(checkFeatureAccess('basic', 'noAds')).toBe(true)
  })

  it('free has ads', () => {
    expect(checkFeatureAccess('free', 'noAds')).toBe(false)
  })

  it('premium has pro badge', () => {
    expect(checkFeatureAccess('premium', 'proBadge')).toBe(true)
  })
})
