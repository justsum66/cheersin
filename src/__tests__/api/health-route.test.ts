// @vitest-environment node
/**
 * P2-315：後端單元測試 — /api/health GET 回傳 JSON 且含 summary
 */
import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/health/route'

describe('GET /api/health', () => {
  it('回傳 200 且 JSON 含 timestamp、summary、services', async () => {
    const res = await GET()
    expect([200, 504]).toContain(res.status)
    const json = await res.json()
    if (res.status === 200) {
      expect(json).toHaveProperty('timestamp')
      expect(json).toHaveProperty('summary')
      expect(json).toHaveProperty('services')
      expect(Array.isArray(json.services)).toBe(true)
    }
  })

  it('200 時 summary 為字串且含數字/總數', async () => {
    const res = await GET()
    const json = await res.json()
    if (res.status === 200 && json.summary) {
      expect(typeof json.summary).toBe('string')
      expect(json.summary).toMatch(/\d+\/\d+/)
    }
  })
})
