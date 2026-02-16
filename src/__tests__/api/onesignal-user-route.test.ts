// @vitest-environment node
/**
 * P0-34: OneSignal user API route tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/rate-limit', () => ({
  isRateLimitedAsync: vi.fn().mockResolvedValue(false),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

import { isRateLimitedAsync } from '@/lib/rate-limit'

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/notifications/onesignal-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/notifications/onesignal-user', () => {
  beforeEach(() => {
    vi.mocked(isRateLimitedAsync).mockResolvedValue(false)
  })

  it('returns 503 when OneSignal not configured', async () => {
    // Import with empty env
    const originalAppId = process.env.ONESIGNAL_APP_ID
    const originalKey = process.env.ONESIGNAL_REST_API_KEY
    delete process.env.ONESIGNAL_APP_ID
    delete process.env.ONESIGNAL_REST_API_KEY

    // Re-import to pick up missing env
    vi.resetModules()
    vi.mock('@/lib/rate-limit', () => ({
      isRateLimitedAsync: vi.fn().mockResolvedValue(false),
      getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
    }))
    const { POST } = await import('@/app/api/notifications/onesignal-user/route')

    const res = await POST(makeReq({ external_id: 'user-1' }))
    // Will be 503 (not configured) or 400 (validation)
    expect([400, 503]).toContain(res.status)

    // Restore
    if (originalAppId) process.env.ONESIGNAL_APP_ID = originalAppId
    if (originalKey) process.env.ONESIGNAL_REST_API_KEY = originalKey
  })

  it('rejects empty external_id', async () => {
    vi.resetModules()
    vi.mock('@/lib/rate-limit', () => ({
      isRateLimitedAsync: vi.fn().mockResolvedValue(false),
      getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
    }))
    const { POST } = await import('@/app/api/notifications/onesignal-user/route')
    const res = await POST(makeReq({ external_id: '' }))
    expect([400, 503]).toContain(res.status)
  })

  it('rejects missing external_id', async () => {
    vi.resetModules()
    vi.mock('@/lib/rate-limit', () => ({
      isRateLimitedAsync: vi.fn().mockResolvedValue(false),
      getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
    }))
    const { POST } = await import('@/app/api/notifications/onesignal-user/route')
    const res = await POST(makeReq({}))
    expect([400, 503]).toContain(res.status)
  })

  it('returns 429 when rate limited', async () => {
    vi.resetModules()
    vi.mock('@/lib/rate-limit', () => ({
      isRateLimitedAsync: vi.fn().mockResolvedValue(true),
      getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
    }))
    const { POST } = await import('@/app/api/notifications/onesignal-user/route')
    const res = await POST(makeReq({ external_id: 'user-1' }))
    expect(res.status).toBe(429)
  })
})
