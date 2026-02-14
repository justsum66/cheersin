import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchWithRetry } from './fetch-retry'

describe('fetchWithRetry', () => {
  const originalFetch = globalThis.fetch
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.stubGlobal('fetch', originalFetch)
  })

  it('returns response on first success', async () => {
    const res = new Response('ok', { status: 200 })
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(res)
    const out = await fetchWithRetry('https://example.com', { method: 'GET' })
    expect(out).toBe(res)
    expect(out.status).toBe(200)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('retries on 503 and then succeeds', async () => {
    const resOk = new Response('ok', { status: 200 })
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(new Response('unavailable', { status: 503 }))
      .mockResolvedValueOnce(resOk)
    const out = await fetchWithRetry('https://example.com', { retries: 2, backoffMs: 10 })
    expect(out.status).toBe(200)
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
  })

  it('retries on 429 and then succeeds', async () => {
    const resOk = new Response('ok', { status: 200 })
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(new Response('rate limit', { status: 429 }))
      .mockResolvedValueOnce(resOk)
    const out = await fetchWithRetry('https://example.com', { retries: 2, backoffMs: 10 })
    expect(out.status).toBe(200)
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
  })

  it('does not retry on 400', async () => {
    const resBad = new Response('bad request', { status: 400 })
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(resBad)
    const out = await fetchWithRetry('https://example.com', { retries: 2 })
    expect(out.status).toBe(400)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('throws after retries exhausted on 5xx', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response('error', { status: 502 }))
    const out = await fetchWithRetry('https://example.com', { retries: 2, backoffMs: 5 })
    expect(out.status).toBe(502)
    expect(globalThis.fetch).toHaveBeenCalledTimes(3)
  })

  it('uses timeout and aborts', async () => {
    vi.mocked(globalThis.fetch).mockImplementation(
      () => new Promise((_, rej) => setTimeout(() => rej(new Error('AbortError')), 5))
    )
    await expect(
      fetchWithRetry('https://example.com', { timeoutMs: 10, retries: 0 })
    ).rejects.toThrow()
  })
})
