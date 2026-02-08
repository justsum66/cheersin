// @vitest-environment node
/**
 * P2-315：遊戲房間 API 單元測試 — GET 參數驗證
 */
import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/games/rooms/route'

describe('GET /api/games/rooms', () => {
  it('回傳 400 當未帶 host=me', async () => {
    const req = new Request('http://localhost/api/games/rooms')
    const res = await GET(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty('error')
    const errMsg = typeof json.error === 'string' ? json.error : (json.error?.message ?? json.error?.code ?? '')
    expect(errMsg).toMatch(/host|Bad request/i)
  })
})
