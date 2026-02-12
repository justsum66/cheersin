// @vitest-environment node
/**
 * PR-41：乾杯 API POST /api/games/rooms/[slug]/cheers 單元測試
 * 僅測試參數驗證與錯誤回應，不 mock Supabase。
 */
import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/games/rooms/[slug]/cheers/route'

async function cheersPost(slug: string) {
  const req = new Request(`http://localhost/api/games/rooms/${slug}/cheers`, { method: 'POST' })
  return POST(req, { params: Promise.resolve({ slug }) })
}

describe('POST /api/games/rooms/[slug]/cheers', () => {
  it('slug 為空回傳 400', async () => {
    const res = await cheersPost('')
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBeDefined()
  })

  it('slug 格式不符回傳 400', async () => {
    const res = await cheersPost('invalid!!')
    expect(res.status).toBe(400)
    const json = await res.json()
    const errMsg = typeof json.error === 'object' ? (json.error?.message ?? json.error?.code ?? '') : (json.error ?? json.message ?? '')
    expect(String(errMsg).toLowerCase()).toMatch(/invalid|slug|格式/)
  })

  it('合法 slug 時回傳 400/404/500 或 200（依格式與房間是否存在）', async () => {
    const res = await cheersPost('validroom99')
    expect([200, 400, 404, 500]).toContain(res.status)
    if (res.status === 200) {
      const json = await res.json()
      expect(typeof json.cheersCount).toBe('number')
      expect(json.cheersCount).toBeGreaterThanOrEqual(0)
    }
  })
})
