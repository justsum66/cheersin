import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validatePromoCode } from './subscription-lifecycle'

vi.mock('./supabase-server', () => ({
  createServerClientOptional: vi.fn(() => null),
}))

describe('validatePromoCode', () => {
  it('returns valid: false for empty string', async () => {
    const result = await validatePromoCode('')
    expect(result.valid).toBe(false)
  })
  it('returns valid: false for whitespace-only', async () => {
    const result = await validatePromoCode('   ')
    expect(result.valid).toBe(false)
  })
  it('returns valid: false when Supabase not configured', async () => {
    const result = await validatePromoCode('WELCOME10')
    expect(result.valid).toBe(false)
  })
})
