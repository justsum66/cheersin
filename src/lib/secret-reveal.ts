/**
 * 秘密爆料引導題庫：從 src/data/secretReveal.json 載入（任務 236–245）
 */

export type SecretRevealCategory = 'love' | 'embarrassing' | 'secrets' | 'confession' | 'wild'

export interface SecretRevealPrompt {
  id: number
  text: string
  level: string
}

const CATEGORIES: SecretRevealCategory[] = ['love', 'embarrassing', 'secrets', 'confession', 'wild']

export const CATEGORY_LABEL: Record<SecretRevealCategory, string> = {
  love: '愛情',
  embarrassing: '糗事',
  secrets: '秘密',
  confession: '坦白',
  wild: '勁爆',
}

async function loadPromptsFromJson(): Promise<Record<SecretRevealCategory, SecretRevealPrompt[]>> {
  try {
    const res = await fetch('/data/secretReveal.json')
    if (!res.ok) throw new Error('Failed to fetch data')
    const mod = await res.json()
    const p = (mod as { prompts?: Record<string, Array<{ id: number; text: string; level: string }>> }).prompts

    if (!p || typeof p !== 'object') {
      return CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {} as Record<SecretRevealCategory, SecretRevealPrompt[]>)
    }
    const out = {} as Record<SecretRevealCategory, SecretRevealPrompt[]>
    for (const cat of CATEGORIES) {
      const list = p[cat]
      out[cat] = Array.isArray(list) ? list.filter((x): x is SecretRevealPrompt => x?.text != null) : []
    }
    return out
  } catch (error) {
    console.error('Failed to load SecretReveal data:', error)
    return CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {} as Record<SecretRevealCategory, SecretRevealPrompt[]>)
  }
}

export async function getPromptsByCategory(category: SecretRevealCategory | 'all'): Promise<SecretRevealPrompt[]> {
  const promptsByCategory = await loadPromptsFromJson()

  if (category === 'all') {
    return CATEGORIES.flatMap((cat) => promptsByCategory[cat])
  }
  return [...promptsByCategory[category]]
}
