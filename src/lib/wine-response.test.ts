import { describe, it, expect } from 'vitest'
import { parseWinesFromResponse } from './wine-response'

describe('parseWinesFromResponse', () => {
  it('returns empty wines when no [WINES] block', () => {
    const { text, wines } = parseWinesFromResponse('只是一段普通回覆。')
    expect(text).toBe('只是一段普通回覆。')
    expect(wines).toEqual([])
  })

  it('parses [WINES] array and strips block from text', () => {
    const input = `推薦你試試這款。\n\n[WINES]\n[{"id":"w1","name":"貓頭鷹黑皮諾","type":"紅酒","region":"勃艮第"}]\n[/WINES]`
    const { text, wines } = parseWinesFromResponse(input)
    expect(text).toBe('推薦你試試這款。')
    expect(wines).toHaveLength(1)
    expect(wines[0]).toMatchObject({ id: 'w1', name: '貓頭鷹黑皮諾', type: '紅酒', region: '勃艮第' })
  })

  it('parses wines object with wines key', () => {
    const input = `回覆\n\n[WINES]\n{"wines":[{"id":"a","name":"A","type":"白酒"}]}\n[/WINES]`
    const { text, wines } = parseWinesFromResponse(input)
    expect(wines).toHaveLength(1)
    expect(wines[0]).toMatchObject({ id: 'a', name: 'A', type: '白酒' })
  })

  it('normalizes missing id/name/type', () => {
    const input = `x\n[WINES]\n[{"name":"無ID酒款","type":"紅酒"}]\n[/WINES]`
    const { wines } = parseWinesFromResponse(input)
    expect(wines).toHaveLength(1)
    expect(wines[0].id).toMatch(/^w-\d+$/)
    expect(wines[0].name).toBe('無ID酒款')
    expect(wines[0].type).toBe('紅酒')
  })

  it('keeps only items with non-empty name', () => {
    const input = 'pre\n[WINES]\n[{"id":"w2","name":"B","type":"white"}]\n[/WINES]'
    const { text, wines } = parseWinesFromResponse(input)
    expect(text).toBe('pre')
    expect(wines).toHaveLength(1)
    expect(wines[0]).toMatchObject({ id: 'w2', name: 'B', type: 'white' })
  })

  it('returns full text when [WINES] present but no closing tag', () => {
    const input = 'hello\n[WINES]\n[{"id":"1","name":"X","type":"Y"}'
    const { text, wines } = parseWinesFromResponse(input)
    expect(text).toBe(input.trim())
    expect(wines).toEqual([])
  })

  it('handles empty string', () => {
    const { text, wines } = parseWinesFromResponse('')
    expect(text).toBe('')
    expect(wines).toEqual([])
  })
})
