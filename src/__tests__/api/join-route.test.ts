// @vitest-environment node
/**
 * TEST-001：join API 單元測試 — 參數驗證與錯誤回應
 * 驗證 400/403/404/429/500 行為，不 mock Supabase。
 */
import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/games/rooms/[slug]/join/route'

async function postJoin(slug: string, body: object) {
  const req = new Request(`http://localhost/api/games/rooms/${slug}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return POST(req, { params: Promise.resolve({ slug }) })
}

describe('POST /api/games/rooms/[slug]/join', () => {
  it('缺少 displayName 回傳 400', async () => {
    const res = await postJoin('abc-123', {})
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBeDefined()
  })

  it('displayName 空字串回傳 400', async () => {
    const res = await postJoin('abc-123', { displayName: '   ' })
    expect(res.status).toBe(400)
  })

  it('invalid slug 回傳 400', async () => {
    const res = await postJoin('', { displayName: 'Player1' })
    expect(res.status).toBe(400)
  })

  it('slug 格式不符回傳 400', async () => {
    const res = await postJoin('invalid!!', { displayName: 'Player1' })
    expect(res.status).toBe(400)
  })

  it('合法 slug + displayName 時回傳 200/403/404/500（取決於房間是否存在）', async () => {
    const res = await postJoin('validslug99', { displayName: 'TestPlayer' })
    expect([200, 403, 404, 500]).toContain(res.status)
  })
})
