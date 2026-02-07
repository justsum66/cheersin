import { describe, it, expect, vi, beforeAll } from 'vitest'

vi.mock('groq-sdk', () => ({ default: vi.fn(() => ({})) }))

import {
  getSommelierSystemPrompt,
  SOMMELIER_SYSTEM_PROMPT,
  type SommelierUserContext,
} from './groq'

describe('getSommelierSystemPrompt', () => {
  it('returns base prompt when no context', () => {
    const prompt = getSommelierSystemPrompt()
    expect(prompt).toContain('Cheersin')
    expect(prompt).toContain('酒神')
    expect(prompt).toContain('幽默輕鬆')
  })

  it('includes zodiac when provided', () => {
    const ctx: SommelierUserContext = { zodiac: '牡羊座' }
    const prompt = getSommelierSystemPrompt(ctx)
    expect(prompt).toContain('星座：牡羊座')
  })

  it('includes soulWine when provided', () => {
    const ctx: SommelierUserContext = { soulWine: '紅酒' }
    const prompt = getSommelierSystemPrompt(ctx)
    expect(prompt).toContain('靈魂酒款')
    expect(prompt).toContain('紅酒')
  })

  it('adds professional personality when personality is professional', () => {
    const ctx: SommelierUserContext = { personality: 'professional' }
    const prompt = getSommelierSystemPrompt(ctx)
    expect(prompt).toContain('嚴謹專業')
  })

  it('adds ragContext when provided', () => {
    const ctx: SommelierUserContext = { ragContext: '參考內容 [1]' }
    const prompt = getSommelierSystemPrompt(ctx)
    expect(prompt).toContain('參考內容 [1]')
    expect(prompt).toContain('來源編號')
  })
})

describe('SOMMELIER_SYSTEM_PROMPT', () => {
  it('is a non-empty string', () => {
    expect(typeof SOMMELIER_SYSTEM_PROMPT).toBe('string')
    expect(SOMMELIER_SYSTEM_PROMPT.length).toBeGreaterThan(100)
  })
})
