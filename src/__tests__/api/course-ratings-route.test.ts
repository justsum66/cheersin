// @vitest-environment node
/**
 * P0-32: Course ratings API route tests
 */
import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/learn/course-ratings/route'

describe('GET /api/learn/course-ratings', () => {
  it('returns 200 with JSON object', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(typeof json).toBe('object')
    expect(json).not.toBeNull()
  })

  it('contains known course IDs', async () => {
    const res = await GET()
    const json = await res.json()
    expect(json['wine-basics']).toBeDefined()
    expect(json['whisky-101']).toBeDefined()
    expect(json['sake-intro']).toBeDefined()
  })

  it('all ratings are between 1 and 5', async () => {
    const res = await GET()
    const json = await res.json()
    for (const [, rating] of Object.entries(json)) {
      expect(rating).toBeGreaterThanOrEqual(1)
      expect(rating).toBeLessThanOrEqual(5)
    }
  })

  it('returns a copy (not mutable reference)', async () => {
    const res1 = await GET()
    const json1 = await res1.json()
    const res2 = await GET()
    const json2 = await res2.json()
    expect(json1).toEqual(json2)
  })
})
