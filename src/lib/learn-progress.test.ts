/**
 * 進度存儲邏輯測試（邊界、格式）
 */
import { describe, it, expect, beforeEach } from 'vitest'

const PROGRESS_KEY = 'cheersin_learn_progress'

function loadProgress(): Record<string, { completed: number; total: number; completedAt?: string }> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (typeof parsed !== 'object' || parsed === null) return {}
    const out: Record<string, { completed: number; total: number; completedAt?: string }> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (v && typeof v === 'object' && 'completed' in v && 'total' in v) {
        const ent = v as { completed: number; total: number; completedAt?: string }
        let completed = Math.floor(Number(ent.completed)) || 0
        let total = Math.floor(Number(ent.total)) || 0
        if (total < 1 || completed < 0) continue
        completed = Math.min(completed, total)
        out[k] = { completed, total }
        if (typeof ent.completedAt === 'string' && ent.completedAt.length >= 10) out[k].completedAt = ent.completedAt
      }
    }
    return out
  } catch {
    return {}
  }
}

describe('learn-progress', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear()
  })

  it('loadProgress returns empty when no storage', () => {
    expect(loadProgress()).toEqual({})
  })

  it('loadProgress clamps completed to total', () => {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ a: { completed: 10, total: 5 } }))
    const p = loadProgress()
    expect(p.a?.completed).toBe(5)
  })

  it('loadProgress ignores invalid entries', () => {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({
      ok: { completed: 2, total: 5 },
      bad: { completed: -1, total: 5 },
      bad2: { completed: 1, total: 0 },
    }))
    const p = loadProgress()
    expect(Object.keys(p)).toEqual(['ok'])
  })
})
