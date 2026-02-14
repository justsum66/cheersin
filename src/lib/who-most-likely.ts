/**
 * 誰最可能題庫：從 src/data/whoMostLikely.json 載入，供 WhoMostLikely 遊戲使用（226–230）
 */

export type WhoMostLikelyCategory = 'love' | 'friendship' | 'work' | 'life' | 'funny' | 'adult'

export interface WhoMostLikelyQuestion {
  id: number
  text: string
  level: string
  category?: WhoMostLikelyCategory // Add category field for inline items
}

const CATEGORIES: WhoMostLikelyCategory[] = ['love', 'friendship', 'work', 'life', 'funny', 'adult']

export const CATEGORY_LABEL: Record<WhoMostLikelyCategory, string> = {
  love: '愛情',
  friendship: '友情',
  work: '工作',
  life: '生活',
  funny: '搞笑',
  adult: '18+ 辣味',
}

const SPICY_QUESTIONS_INLINE = [
  '誰最可能有秘密交往對象？',
  '誰最可能在辦公室跟同事搞曖昧？',
  '誰最可能一夜情之後還約第二次？',
  '誰最可能用約會軟體找對象？',
  '誰最可能劈腿？',
  '誰最可能被劈腿還不知道？',
  '誰最可能跟前任復合？',
  '誰最可能醉酒後做出後悔的事？',
  '誰最可能有一個以上的砲友？',
  '誰最可能談辦公室戀情？',
  '誰最可能跟朋友的前任在一起？',
  '誰最可能為了上床而說謊？',
  '誰最可能有最多前任？',
  '誰最可能在第一次約會就上床？',
  '誰最可能有過三人行？',
  '誰最可能收過或送過裸照？',
  '誰最可能跟比自己大很多的人交往？',
  '誰最可能用錢維持關係？',
  '誰最可能被發現在看限制級內容？',
  '誰最可能去過夜店找艷遇？',
  '誰最可能有最奇怪的癖好？',
  '誰最可能偷偷喜歡在場某人？',
  '誰最可能被前任纏著不放？',
  '誰最可能是大家公認的情聖？',
  '誰最可能在感情中最善變？',
  '誰最可能為愛情做傻事？',
  '誰最可能撒謊自己是單身？',
  '誰最可能被人掛念著？',
  '誰最可能在旅行時發生艷遇？',
  '誰最可能私底下最悶騷？',
]

async function loadQuestionsFromJson(): Promise<Record<WhoMostLikelyCategory, WhoMostLikelyQuestion[]>> {
  try {
    const mod = await import('@/data/whoMostLikely.json')
    const q = (mod.default as { questions?: Record<string, Array<{ id: number; text: string; level: string }>> }).questions

    if (!q || typeof q !== 'object') {
      return CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {} as Record<WhoMostLikelyCategory, WhoMostLikelyQuestion[]>)
    }
    const out = {} as Record<WhoMostLikelyCategory, WhoMostLikelyQuestion[]>
    for (const cat of CATEGORIES) {
      const list = q[cat]
      out[cat] = Array.isArray(list) ? list.filter((x): x is WhoMostLikelyQuestion => x?.text != null) : []
    }
    return out
  } catch (error) {
    console.error('Failed to load WhoMostLikely data:', error)
    return CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {} as Record<WhoMostLikelyCategory, WhoMostLikelyQuestion[]>)
  }
}

export async function getQuestionsByCategory(category: WhoMostLikelyCategory | 'all'): Promise<WhoMostLikelyQuestion[]> {
  const questionsByCategory = await loadQuestionsFromJson()

  if (category === 'all') {
    return CATEGORIES.flatMap((cat) => questionsByCategory[cat])
  }
  return [...questionsByCategory[category]]
}
