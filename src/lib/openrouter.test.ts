import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.mock('./fetch-retry', () => ({ fetchWithRetry: (url: string, opts: unknown) => mockFetch(url, opts) }))
vi.mock('./env-config', () => ({
  OPENROUTER_API_KEY: 'sk-or-test-key',
  OPENROUTER_CHAT_MODEL: 'anthropic/claude-3.5-sonnet',
  OPENROUTER_HEALTH_API_KEY: '',
}))

import { chatWithOpenRouter, testOpenRouterConnection, OpenRouterApiError } from './openrouter'

describe('openrouter', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('chatWithOpenRouter', () => {
    it('returns text and optional usage on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: 'Hi there' } }],
            usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
          }),
      })
      const out = await chatWithOpenRouter([{ role: 'user', content: 'Hi' }])
      expect(out.text).toBe('Hi there')
      expect(out.usage).toEqual({ prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 })
    })

    it('throws OpenRouterApiError on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('unauthorized'),
      })
      try {
        await chatWithOpenRouter([{ role: 'user', content: 'Hi' }])
        expect.fail('should have thrown')
      } catch (e) {
        expect(e).toBeInstanceOf(OpenRouterApiError)
        expect((e as OpenRouterApiError).status).toBe(401)
      }
    })
  })

  describe('testOpenRouterConnection', () => {
    it('returns success when chat succeeds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: 'OK' } }] }),
      })
      const result = await testOpenRouterConnection()
      expect(result.success).toBe(true)
      expect(result.message).toContain('Connection successful')
    })

    it('returns success: false when chat fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401, text: () => Promise.resolve('bad key') })
      const result = await testOpenRouterConnection()
      expect(result.success).toBe(false)
      expect(result.message).toContain('401')
    })
  })
})
