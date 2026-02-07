/**
 * EXPERT_60 P3：PayPal webhook 單元測試 — 冪等、無效 body、GET 健康檢查
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, GET } from '../route'

function createMockSupabase(insertError: { code: string } | null = null) {
  const chain = {
    insert: vi.fn().mockResolvedValue({ error: insertError }),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockResolvedValue({ error: null }),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    select: vi.fn().mockReturnThis(),
  }
  const from = vi.fn(() => chain)
  return { from, ...chain }
}

vi.mock('@/lib/supabase-server', () => ({
  createServerClientOptional: vi.fn(),
}))

const { createServerClientOptional } = await import('@/lib/supabase-server')

describe('PayPal webhook POST', () => {
  const validBody = JSON.stringify({
    id: 'evt-idempotency-test',
    event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
    resource: {
      id: 'sub-123',
      custom_id: 'user-456',
      plan_id: 'P-XXX',
      billing_info: { next_billing_time: '2026-03-01T00:00:00Z' },
    },
  })

  beforeEach(() => {
    vi.mocked(createServerClientOptional).mockReset()
    ;(process.env as { NODE_ENV?: string }).NODE_ENV = 'test'
  })

  it('無 Supabase 時仍回 200（不擋部署）', async () => {
    vi.mocked(createServerClientOptional).mockReturnValue(null)
    const req = new NextRequest('http://localhost/api/webhooks/paypal', {
      method: 'POST',
      body: validBody,
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)
  })

  it('有效 body + Supabase 插入成功回 200', async () => {
    const mock = createMockSupabase(null)
    vi.mocked(createServerClientOptional).mockReturnValue(mock as never)
    const req = new NextRequest('http://localhost/api/webhooks/paypal', {
      method: 'POST',
      body: validBody,
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mock.from).toHaveBeenCalledWith('webhook_events')
    expect(mock.insert).toHaveBeenCalled()
  })

  it('冪等：重複 event_id 時回 200 且 duplicate: true', async () => {
    const mock = createMockSupabase(null)
    // req1: webhook_events insert -> null, subscription_audit insert -> null；req2: webhook_events insert -> 23505
    mock.insert
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { code: '23505', message: 'duplicate key' } })
    vi.mocked(createServerClientOptional).mockReturnValue(mock as never)
    const req1 = new NextRequest('http://localhost/api/webhooks/paypal', {
      method: 'POST',
      body: validBody,
    })
    const res1 = await POST(req1)
    expect(res1.status).toBe(200)
    const req2 = new NextRequest('http://localhost/api/webhooks/paypal', {
      method: 'POST',
      body: validBody,
    })
    const res2 = await POST(req2)
    expect(res2.status).toBe(200)
    const json = await res2.json()
    expect(json.received).toBe(true)
    expect(json.duplicate).toBe(true)
  })

  it('無效 JSON body 回 500', async () => {
    vi.mocked(createServerClientOptional).mockReturnValue(null)
    const req = new NextRequest('http://localhost/api/webhooks/paypal', {
      method: 'POST',
      body: 'not json {{{',
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toContain('failed')
  })
})

describe('PayPal webhook GET', () => {
  it('健康檢查回 200 且 status healthy', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('healthy')
    expect(json.webhook).toContain('PayPal')
  })
})
