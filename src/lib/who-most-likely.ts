/**
 * 誰最可能題庫：從 src/data/whoMostLikely.json 載入，供 WhoMostLikely 遊戲使用（226–230）
 */
import whoMostLikelyJson from '@/data/whoMostLikely.json'

export type WhoMostLikelyCategory = 'love' | 'friendship' | 'work' | 'life' | 'funny'

export interface WhoMostLikelyQuestion {
  id: number
  text: string
  level: string
}

const CATEGORIES: WhoMostLikelyCategory[] = ['love', 'friendship', 'work', 'life', 'funny']

export const CATEGORY_LABEL: Record<WhoMostLikelyCategory, string> = {
  love: '愛情',
  friendship: '友情',
  work: '工作',
  life: '生活',
  funny: '搞笑',
}

function getQuestionsFromJson(): Record<WhoMostLikelyCategory, WhoMostLikelyQuestion[]> {
  const q = (whoMostLikelyJson as { questions?: Record<string, Array<{ id: number; text: string; level: string }>> }).questions
  if (!q || typeof q !== 'object') {
    return CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {} as Record<WhoMostLikelyCategory, WhoMostLikelyQuestion[]>)
  }
  const out = {} as Record<WhoMostLikelyCategory, WhoMostLikelyQuestion[]>
  for (const cat of CATEGORIES) {
    const list = q[cat]
    out[cat] = Array.isArray(list) ? list.filter((x): x is WhoMostLikelyQuestion => x?.text != null) : []
  }
  return out
}

const questionsByCategory = getQuestionsFromJson()

export function getQuestionsByCategory(category: WhoMostLikelyCategory | 'all'): WhoMostLikelyQuestion[] {
  if (category === 'all') {
    return CATEGORIES.flatMap((cat) => questionsByCategory[cat])
  }
  return [...questionsByCategory[category]]
}
