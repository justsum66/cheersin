import { describe, it, expect } from 'vitest'
import { getPromptsByCategory, CATEGORY_LABEL, type SecretRevealCategory } from './secret-reveal'

describe('secret-reveal', () => {
  it('getPromptsByCategory(all) returns prompts', () => {
    const prompts = getPromptsByCategory('all')
    expect(Array.isArray(prompts)).toBe(true)
    expect(prompts.length).toBeGreaterThan(0)
    const first = prompts[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('text')
    expect(first).toHaveProperty('level')
  })

  it('getPromptsByCategory(love) returns love prompts', () => {
    const prompts = getPromptsByCategory('love')
    expect(Array.isArray(prompts)).toBe(true)
    prompts.forEach((p) => expect(p.text).toBeDefined())
  })

  it('CATEGORY_LABEL has all categories', () => {
    const cats: SecretRevealCategory[] = ['love', 'embarrassing', 'secrets', 'confession', 'wild']
    cats.forEach((c) => expect(CATEGORY_LABEL[c]).toBeDefined())
  })
})
