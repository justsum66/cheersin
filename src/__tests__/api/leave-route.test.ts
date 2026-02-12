// @vitest-environment node
/**
 * TEST-001：leave API 單元測試 — 參數驗證與錯誤回應
 * GAME-004：房主離開時房間結束；此測試僅驗證 400/404/500 行為，不 mock Supabase。
 */
import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/games/rooms/[slug]/leave/route'

async function postLeave(slug: string, body: { playerId?: string }) {
  const req = new Request(`http://localhost/api/games/rooms/${slug}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return POST(req, { params: Promise.resolve({ slug }) })
}

describe('POST /api/games/rooms/[slug]/leave', () => {
  it('缺少 playerId 回傳 400', async () => {
    const res = await postLeave('abc-123', {})
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBeDefined()
  })

  it('invalid slug 回傳 400', async () => {
    const res = await postLeave('', { playerId: 'some-uuid' })
    expect(res.status).toBe(400)
  })

  it('slug 格式不符回傳 400', async () => {
    const res = await postLeave('invalid!!', { playerId: 'some-uuid' })
    expect(res.status).toBe(400)
  })

  it('合法 slug + playerId 時回傳 404 或 500（房間/玩家不存在或 Supabase 未設定）', async () => {
    const res = await postLeave('validslug99', { playerId: '00000000-0000-0000-0000-000000000001' })
    expect([404, 500]).toContain(res.status)
  })
})
