import { describe, it, expect } from 'vitest'
import { getTaiwanWinesContext, getTaiwanWinesBrands, getTaiwanWinesHotBottles, filterBottles, parsePriceRangeMax } from './taiwan-wines'

describe('taiwan-wines', () => {
  it('getTaiwanWinesContext returns non-empty string', () => {
    const ctx = getTaiwanWinesContext()
    expect(typeof ctx).toBe('string')
    expect(ctx.length).toBeGreaterThan(0)
    expect(ctx).toContain('台灣')
  })

  it('getTaiwanWinesBrands returns array with brands', () => {
    const brands = getTaiwanWinesBrands()
    expect(Array.isArray(brands)).toBe(true)
    expect(brands.length).toBeGreaterThan(0)
    const first = brands[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('name')
    expect(first).toHaveProperty('category')
    expect(first.bottles).toBeDefined()
    expect(Array.isArray(first.bottles)).toBe(true)
  })

  it('getTaiwanWinesHotBottles returns flat list with brand info', () => {
    const hot = getTaiwanWinesHotBottles({ limit: 5 })
    expect(Array.isArray(hot)).toBe(true)
    if (hot.length > 0) {
      expect(hot[0]).toHaveProperty('name')
      expect(hot[0]).toHaveProperty('type')
      expect(hot[0]).toHaveProperty('brandId')
      expect(hot[0]).toHaveProperty('brandName')
      expect(hot[0]).toHaveProperty('category')
    }
    expect(hot.length).toBeLessThanOrEqual(5)
  })

  it('getTaiwanWinesHotBottles filters by category when provided', () => {
    const wineOnly = getTaiwanWinesHotBottles({ category: 'wine', limit: 20 })
    const allCat = new Set(wineOnly.map((b) => b.category))
    expect(allCat.size).toBeLessThanOrEqual(1)
    if (wineOnly.length > 0) expect(wineOnly[0].category).toBe('wine')
  })

  it('parsePriceRangeMax extracts max number from price range string', () => {
    expect(parsePriceRangeMax('NT$ 800–1200')).toBe(1200)
    expect(parsePriceRangeMax('NT$ 2,200–2,800')).toBe(2800)
    expect(parsePriceRangeMax('NT$ 3,500+')).toBe(3500)
    expect(parsePriceRangeMax('')).toBeUndefined()
    expect(parsePriceRangeMax(undefined)).toBeUndefined()
  })

  it('filterBottles filters by type and maxPrice', () => {
    const hot = getTaiwanWinesHotBottles({ limit: 50 })
    const whisky = filterBottles(hot, { typeKeyword: '威士忌' })
    expect(whisky.every((b) => b.type?.includes('威士忌') || b.category === 'whisky')).toBe(true)
    const under1000 = filterBottles(hot, { maxPrice: 1000 })
    expect(under1000.every((b) => (parsePriceRangeMax(b.priceRange) ?? 0) <= 1000)).toBe(true)
  })
})
