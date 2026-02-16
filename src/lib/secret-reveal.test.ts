import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getPromptsByCategory, CATEGORY_LABEL, type SecretRevealCategory } from './secret-reveal'

describe('secret-reveal', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        prompts: {
          love: [
            { id: 1, text: 'Secret 1', level: 'mild' },
          ],
          embarrassing: [
            { id: 2, text: 'Secret 2', level: 'normal' },
          ],
          secrets: [
            { id: 3, text: 'Secret 3', level: 'mild' },
          ],
          confession: [
            { id: 4, text: 'Secret 4', level: 'normal' },
          ],
          wild: [
            { id: 5, text: 'Secret 5', level: 'wild' },
          ],
        },
      }),
    })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('getPromptsByCategory(all) returns prompts', async () => {
    const prompts = await getPromptsByCategory('all')
    expect(Array.isArray(prompts)).toBe(true)
    expect(prompts.length).toBeGreaterThan(0)
    const first = prompts[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('text')
    expect(first).toHaveProperty('level')
  })

  it('getPromptsByCategory(love) returns love prompts', async () => {
    const prompts = await getPromptsByCategory('love')
    expect(Array.isArray(prompts)).toBe(true)
    prompts.forEach((p) => expect(p.text).toBeDefined())
  })

  it('CATEGORY_LABEL has all categories', () => {
    const cats: SecretRevealCategory[] = ['love', 'embarrassing', 'secrets', 'confession', 'wild']
    cats.forEach((c) => expect(CATEGORY_LABEL[c]).toBeDefined())
  })
})
