import { describe, it, expect } from 'vitest'
import { EMBEDDING_DIMENSION, EMBEDDING_MODEL_DEFAULT } from './embedding'

describe('embedding constants', () => {
  it('EMBEDDING_DIMENSION is 1536 or env-driven number', () => {
    expect([1024, 1536]).toContain(EMBEDDING_DIMENSION)
    expect(Number.isFinite(EMBEDDING_DIMENSION)).toBe(true)
  })
  it('EMBEDDING_MODEL_DEFAULT is non-empty string', () => {
    expect(typeof EMBEDDING_MODEL_DEFAULT).toBe('string')
    expect(EMBEDDING_MODEL_DEFAULT.length).toBeGreaterThan(0)
  })
})
