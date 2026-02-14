import { describe, it, expect } from 'vitest'
import {
  CHAT_PRIMARY,
  CHAT_FALLBACK_ORDER,
  RAG_TOP_K_CONFIG,
  RAG_SIMILAR_TOP_K_CONFIG,
  RAG_NAMESPACE,
  RAG_SCORE_MIN,
  type ChatProvider,
} from './chat.config'

const VALID_PROVIDERS: ChatProvider[] = ['groq', 'nim', 'openrouter']

describe('chat.config', () => {
  it('CHAT_PRIMARY is one of valid providers', () => {
    expect(VALID_PROVIDERS).toContain(CHAT_PRIMARY)
  })

  it('CHAT_FALLBACK_ORDER is non-empty array of valid providers', () => {
    expect(Array.isArray(CHAT_FALLBACK_ORDER)).toBe(true)
    expect(CHAT_FALLBACK_ORDER.length).toBeGreaterThan(0)
    for (const p of CHAT_FALLBACK_ORDER) {
      expect(VALID_PROVIDERS).toContain(p)
    }
  })

  it('CHAT_FALLBACK_ORDER contains groq, nim, openrouter in some order', () => {
    const set = new Set(CHAT_FALLBACK_ORDER)
    expect(set.has('groq')).toBe(true)
    expect(set.has('nim')).toBe(true)
    expect(set.has('openrouter')).toBe(true)
  })

  it('RAG config are within expected bounds', () => {
    expect(RAG_TOP_K_CONFIG).toBeGreaterThanOrEqual(1)
    expect(RAG_TOP_K_CONFIG).toBeLessThanOrEqual(20)
    expect(RAG_SIMILAR_TOP_K_CONFIG).toBeGreaterThanOrEqual(1)
    expect(RAG_SIMILAR_TOP_K_CONFIG).toBeLessThanOrEqual(10)
    expect(typeof RAG_NAMESPACE).toBe('string')
    expect(RAG_NAMESPACE.length).toBeGreaterThan(0)
    expect(RAG_SCORE_MIN).toBeGreaterThanOrEqual(0)
    expect(RAG_SCORE_MIN).toBeLessThanOrEqual(1)
  })
})
