// @vitest-environment node
/**
 * P3-67：API 錯誤路徑單元測試 — chat 400（無效 messages）
 */
import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/chat/route'

describe('POST /api/chat', () => {
  it('回傳 400 當 body 無 messages 陣列', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty('error', 'Invalid payload')
  })

  it('回傳 400 當 messages 非陣列', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: 'not-array' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty('error', 'Invalid payload')
  })
})
