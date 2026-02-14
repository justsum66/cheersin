import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.mock('./fetch-retry', () => ({ fetchWithRetry: (url: string, opts: unknown) => mockFetch(url, opts) }))
vi.mock('./env-config', () => ({
  NVIDIA_NIM_API_KEY: 'nvapi-test-key',
  CHAT_TIMEOUT_MS: 30_000,
  hasNim: true,
}))

import { chatWithNIM, hasNIM, NIMApiError } from './nim'

describe('nim', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('chatWithNIM', () => {
    it('returns content on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: 'Hello' } }] }),
      })
      const out = await chatWithNIM([{ role: 'user', content: 'Hi' }])
      expect(out).toBe('Hello')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/chat/completions'),
        expect.objectContaining({ method: 'POST', body: expect.any(String) })
      )
    })

    it('throws NIMApiError on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve('rate limit'),
      })
      try {
        await chatWithNIM([{ role: 'user', content: 'Hi' }])
        expect.fail('should have thrown')
      } catch (e) {
        expect(e).toBeInstanceOf(NIMApiError)
        expect((e as NIMApiError).status).toBe(429)
        expect((e as NIMApiError).body).toBe('rate limit')
      }
    })

    it('prepends system prompt when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: 'OK' } }] }),
      })
      await chatWithNIM(
        [{ role: 'user', content: 'Hi' }],
        { systemPrompt: 'You are a sommelier.' }
      )
      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.messages[0]).toEqual({ role: 'system', content: 'You are a sommelier.' })
      expect(body.messages[1]).toEqual({ role: 'user', content: 'Hi' })
    })
  })

  describe('hasNIM', () => {
    it('returns true when hasNim is true from env-config', () => {
      expect(hasNIM()).toBe(true)
    })
  })
})
