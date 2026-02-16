// @vitest-environment node
/**
 * P0-33: Generate invitation API route tests
 */
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/rate-limit', () => ({
  isRateLimitedAsync: vi.fn().mockResolvedValue(false),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

import { POST } from '@/app/api/generate-invitation/route'
import { isRateLimitedAsync } from '@/lib/rate-limit'

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/generate-invitation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/generate-invitation', () => {
  it('returns template with default theme when body is empty', async () => {
    const res = await POST(new Request('http://localhost/api/generate-invitation', {
      method: 'POST',
    }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.text).toContain('派對')
    expect(json.text).toContain('Cheersin')
  })

  it('uses provided theme in template', async () => {
    const res = await POST(makeReq({ theme: '紅酒之夜' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.text).toContain('紅酒之夜')
  })

  it('includes date when provided', async () => {
    const res = await POST(makeReq({ theme: '品酒會', date: '2026-03-15' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.text).toContain('2026-03-15')
  })

  it('works with only date (no theme)', async () => {
    const res = await POST(makeReq({ date: '2026-06-01' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.text).toContain('派對')
    expect(json.text).toContain('2026-06-01')
  })

  it('returns 429 when rate limited', async () => {
    vi.mocked(isRateLimitedAsync).mockResolvedValueOnce(true)
    const res = await POST(makeReq({}))
    expect(res.status).toBe(429)
  })

  it('rejects invalid field types', async () => {
    const res = await POST(makeReq({ theme: 12345 }))
    expect(res.status).toBe(400)
  })
})
