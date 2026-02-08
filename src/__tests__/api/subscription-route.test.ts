// @vitest-environment node
/**
 * P3-67：API 錯誤路徑單元測試 — subscription 503（PayPal 未設定）
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/subscription/route'

describe('POST /api/subscription', () => {
  const savedEnv: Record<string, string | undefined> = {}

  beforeEach(() => {
    savedEnv.PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
    savedEnv.PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
  })

  afterEach(() => {
    if (savedEnv.PAYPAL_CLIENT_ID !== undefined) process.env.PAYPAL_CLIENT_ID = savedEnv.PAYPAL_CLIENT_ID
    if (savedEnv.PAYPAL_CLIENT_SECRET !== undefined) process.env.PAYPAL_CLIENT_SECRET = savedEnv.PAYPAL_CLIENT_SECRET
  })

  it('回傳 503 當 PayPal 未設定', async () => {
    process.env.PAYPAL_CLIENT_ID = ''
    process.env.PAYPAL_CLIENT_SECRET = ''
    const req = new NextRequest('http://localhost/api/subscription', {
      method: 'POST',
      body: JSON.stringify({ action: 'create-subscription', planType: 'basic' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(503)
    const json = await res.json()
    expect(json).toHaveProperty('error')
  })

  it('回傳 400 當 body 無效或缺少必要欄位', async () => {
    const req = new NextRequest('http://localhost/api/subscription', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect([400, 503]).toContain(res.status)
    const json = await res.json()
    expect(json).toHaveProperty('error')
  })
})
