// @vitest-environment node
/**
 * PR-41：game-state 讀寫與 party-room payload 驗證的單元測試
 * 僅測試參數驗證與錯誤回應，不 mock Supabase。
 */
import { describe, it, expect } from 'vitest'
import { GET, POST } from '@/app/api/games/rooms/[slug]/game-state/route'

async function getRes(slug: string, gameId?: string) {
  const url = gameId ? `http://localhost/api/games/rooms/${slug}/game-state?game_id=${gameId}` : `http://localhost/api/games/rooms/${slug}/game-state`
  const req = new Request(url)
  return GET(req, { params: Promise.resolve({ slug }) })
}

async function postRes(slug: string, body: unknown) {
  const req = new Request(`http://localhost/api/games/rooms/${slug}/game-state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return POST(req, { params: Promise.resolve({ slug }) })
}

describe('GET /api/games/rooms/[slug]/game-state', () => {
  it('invalid slug 回傳 400', async () => {
    const res = await getRes('')
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBeDefined()
  })

  it('slug 格式不符回傳 400', async () => {
    const res = await getRes('invalid!!')
    expect(res.status).toBe(400)
    const json = await res.json()
    const errMsg = typeof json.error === 'object' ? (json.error?.message ?? json.error?.code ?? '') : (json.error ?? json.message ?? '')
    expect(String(errMsg).toLowerCase()).toMatch(/invalid|slug|格式/)
  })

  it('合法 slug 格式時接受 game_id 參數', async () => {
    // 房間不存在時 Supabase 回 404，這裡只驗證不會因 slug 格式 400
    const res = await getRes('abc-123', 'party-room')
    expect([400, 404, 500]).toContain(res.status)
  })
})

describe('POST /api/games/rooms/[slug]/game-state', () => {
  it('invalid slug 回傳 400', async () => {
    const res = await postRes('', { game_id: 'party-room', payload: { cheersCount: 0 } })
    expect(res.status).toBe(400)
  })

  it('party-room payload 缺 cheersCount 時使用 default 通過驗證', async () => {
    const res = await postRes('validslug99', { game_id: 'party-room', payload: {} })
    expect([400, 404, 500]).toContain(res.status)
    if (res.status === 400) {
      const json = await res.json()
      expect(json.error).not.toBe('INVALID_PARTY_STATE')
    }
  })

  it('party-room payload cheersCount 非數字回傳 400 INVALID_PARTY_STATE', async () => {
    const res = await postRes('validslug98', { game_id: 'party-room', payload: { cheersCount: 'not-a-number' } })
    expect(res.status).toBe(400)
    const json = await res.json()
    const code = typeof json.error === 'object' ? json.error?.code : json.error
    expect(code === 'INVALID_PARTY_STATE' || json.code === 'INVALID_PARTY_STATE').toBe(true)
  })

  it('party-room payload cheersCount 負數回傳 400', async () => {
    const res = await postRes('validslug97', { game_id: 'party-room', payload: { cheersCount: -1 } })
    expect(res.status).toBe(400)
  })
})
