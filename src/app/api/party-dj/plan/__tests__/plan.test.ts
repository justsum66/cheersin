/**
 * P2-315：party-dj plan API 單元測試
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/config/games.config', () => ({
  gamesWithCategory: [
    { id: 'truth-dare', category: 'party', estimatedMinutes: 15 },
    { id: 'roulette', category: 'reaction', estimatedMinutes: 5 },
    { id: 'adult-game', category: 'adult', estimatedMinutes: 10 },
  ],
}))

describe('POST /api/party-dj/plan', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns phases with valid body (paid tier allows 120 min)', async () => {
    const { POST } = await import('../route')
    const body = { peopleCount: 6, durationMin: 120, allow18: false, subscriptionTier: 'premium' }
    const req = new Request('http://localhost/api/party-dj/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.phases).toBeDefined()
    expect(Array.isArray(data.phases)).toBe(true)
    expect(data.phases.length).toBe(4)
    expect(data.totalMin).toBe(120)
    data.phases.forEach((p: { phase: string; durationMin: number; transitionText: string }) => {
      expect(p.phase).toBeDefined()
      expect(typeof p.durationMin).toBe('number')
      expect(p.transitionText).toBeDefined()
    })
  })

  it('defaults peopleCount and durationMin when missing (free tier caps at 30 min)', async () => {
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/party-dj/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.peopleCount).toBe(6)
    expect(data.totalMin).toBe(30)
  })

  it('free tier caps duration at 30 min', async () => {
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/party-dj/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peopleCount: 4, durationMin: 90, subscriptionTier: 'free' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.totalMin).toBe(30)
  })
})
