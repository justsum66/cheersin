// @vitest-environment node
/**
 * P0-31: Analytics API route tests
 */
import { describe, it, expect, vi } from 'vitest'

// Mock dependencies before importing route
vi.mock('@/lib/supabase-server', () => ({
  createServerClientOptional: () => null,
}))
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))
vi.mock('@/lib/rate-limit', () => ({
  isRateLimitedAsync: vi.fn().mockResolvedValue(false),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))
vi.mock('@/config/analytics.config', () => ({
  getPersistEventNames: () => new Set(['CLS', 'LCP', 'FID']),
}))

import { POST } from '@/app/api/analytics/route'
import { NextRequest } from 'next/server'
import { isRateLimitedAsync } from '@/lib/rate-limit'

function makeReq(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/analytics', () => {
  it('accepts valid analytics payload', async () => {
    const res = await POST(makeReq({ name: 'CLS', value: 0.12 }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
  })

  it('accepts payload with optional id', async () => {
    const res = await POST(makeReq({ name: 'LCP', value: 1200, id: 'v3-12345' }))
    expect(res.status).toBe(200)
  })

  it('rejects empty name', async () => {
    const res = await POST(makeReq({ name: '', value: 100 }))
    expect(res.status).toBe(400)
  })

  it('rejects missing value', async () => {
    const res = await POST(makeReq({ name: 'CLS' }))
    expect(res.status).toBe(400)
  })

  it('rejects negative value', async () => {
    const res = await POST(makeReq({ name: 'CLS', value: -1 }))
    expect(res.status).toBe(400)
  })

  it('rejects value exceeding max', async () => {
    const res = await POST(makeReq({ name: 'CLS', value: 1_000_001 }))
    expect(res.status).toBe(400)
  })

  it('returns 429 when rate limited', async () => {
    vi.mocked(isRateLimitedAsync).mockResolvedValueOnce(true)
    const res = await POST(makeReq({ name: 'CLS', value: 0.1 }))
    expect(res.status).toBe(429)
  })

  it('handles invalid JSON gracefully', async () => {
    const req = new NextRequest('http://localhost/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
