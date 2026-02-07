/**
 * 秘密爆料引導題庫：從 src/data/secretReveal.json 載入（任務 236–245）
 */
import secretRevealJson from '@/data/secretReveal.json'

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

function getPromptsFromJson(): Record<SecretRevealCategory, SecretRevealPrompt[]> {
  const p = (secretRevealJson as { prompts?: Record<string, Array<{ id: number; text: string; level: string }>> }).prompts
  if (!p || typeof p !== 'object') {
    return CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {} as Record<SecretRevealCategory, SecretRevealPrompt[]>)
  }
  const out = {} as Record<SecretRevealCategory, SecretRevealPrompt[]>
  for (const cat of CATEGORIES) {
    const list = p[cat]
    out[cat] = Array.isArray(list) ? list.filter((x): x is SecretRevealPrompt => x?.text != null) : []
  }
  return out
}

const promptsByCategory = getPromptsFromJson()

export function getPromptsByCategory(category: SecretRevealCategory | 'all'): SecretRevealPrompt[] {
  if (category === 'all') {
    return CATEGORIES.flatMap((cat) => promptsByCategory[cat])
  }
  return [...promptsByCategory[category]]
}
