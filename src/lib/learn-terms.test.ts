/**
 * 術語解析單元測試
 */
import { describe, it, expect } from 'vitest'
import { parseContentWithTerms, TERM_MAP } from './learn-terms'

describe('learn-terms', () => {
  describe('parseContentWithTerms', () => {
    it('returns plain text when no terms', () => {
      const out = parseContentWithTerms('簡單文字')
      expect(out).toEqual(['簡單文字'])
    })

    it('wraps known terms with structure', () => {
      const out = parseContentWithTerms('紅酒帶有單寧')
      expect(out.some((x) => typeof x === 'object' && 'term' in x && (x as { term: string }).term === '單寧')).toBe(true)
    })

    it('preserves non-term text', () => {
      const out = parseContentWithTerms('風土影響葡萄酒')
      const strParts = out.filter((x) => typeof x === 'string') as string[]
      expect(strParts.join('')).toContain('影響葡萄酒')
    })

    it('handles empty string', () => {
      const out = parseContentWithTerms('')
      expect(out).toEqual([''])
    })
  })

  describe('TERM_MAP', () => {
    it('has expected terms', () => {
      expect(TERM_MAP['單寧']).toBe('Tannin')
      expect(TERM_MAP['風土']).toBe('Terroir')
    })
  })
})
