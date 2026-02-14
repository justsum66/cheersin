/**
 * 266–270 我從來沒有題庫：從 src/data/neverHaveIEver.json 載入，
 * 分類 愛情/職場/生活/黑歷史/18+；組件直接使用題庫數據。
 */

export type NeverHaveIEverCategory = 'love' | 'work' | 'life' | 'dark' | 'adult'

export interface NeverHaveIEverItem {
  id: number
  text: string
  level: string
}

const CATEGORIES: NeverHaveIEverCategory[] = ['love', 'work', 'life', 'dark', 'adult']

export const CATEGORY_LABEL: Record<NeverHaveIEverCategory, string> = {
  love: '愛情',
  work: '職場',
  life: '生活',
  dark: '黑歷史',
  adult: '18+',
}

async function loadQuestionsFromJson(): Promise<Record<NeverHaveIEverCategory, NeverHaveIEverItem[]>> {
  try {
    const mod = await import('@/data/neverHaveIEver.json')
    const q = (mod.default as { questions?: Record<string, Array<{ id: number; text: string; level: string }>> }).questions

    if (!q || typeof q !== 'object') {
      return CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {} as Record<NeverHaveIEverCategory, NeverHaveIEverItem[]>)
    }
    const out = {} as Record<NeverHaveIEverCategory, NeverHaveIEverItem[]>
    for (const cat of CATEGORIES) {
      const list = q[cat]
      out[cat] = Array.isArray(list) ? list.filter((x): x is NeverHaveIEverItem => x?.text != null) : []
    }
    return out
  } catch (error) {
    console.error('Failed to load NeverHaveIEver data:', error)
    return CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {} as Record<NeverHaveIEverCategory, NeverHaveIEverItem[]>)
  }
}

/** 依分類取得題目；all 時合併全部 */
export async function getStatementsByCategory(category: NeverHaveIEverCategory | 'all'): Promise<{ text: string; category: NeverHaveIEverCategory }[]> {
  const questionsByCategory = await loadQuestionsFromJson()

  if (category === 'all') {
    return CATEGORIES.flatMap((cat) =>
      questionsByCategory[cat].map((item) => ({ text: item.text, category: cat }))
    )
  }
  return questionsByCategory[category].map((item) => ({ text: item.text, category }))
}
