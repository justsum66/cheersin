/**
 * R2-022：TheCocktailDB API 整合 — 侍酒師問調酒時可注入題材
 * 免費 API：search.php?s= 以名稱搜尋；測試 key "1"
 */
const API_BASE = 'https://www.thecocktaildb.com/api/json/v1/1'
const REQUEST_TIMEOUT_MS = 6000

export interface CocktailItem {
  id: string
  name: string
  category: string | null
  alcoholic: string | null
  glass: string | null
  instructions: string | null
  instructionsZh: string | null
  ingredients: { name: string; measure: string | null }[]
  thumb: string | null
}

/** 從 API 回傳的 drink 物件解析出 ingredients（strIngredient1..15, strMeasure1..15） */
function parseIngredients(d: Record<string, unknown>): { name: string; measure: string | null }[] {
  const out: { name: string; measure: string | null }[] = []
  for (let i = 1; i <= 15; i++) {
    const name = d[`strIngredient${i}`]
    if (typeof name === 'string' && name.trim()) {
      const measure = d[`strMeasure${i}`]
      out.push({ name: name.trim(), measure: typeof measure === 'string' && measure.trim() ? measure.trim() : null })
    }
  }
  return out
}

/** 依名稱關鍵字搜尋調酒，回傳最多 5 筆，供 LLM 參考 */
export async function searchCocktails(query: string): Promise<CocktailItem[]> {
  const q = (query || '').trim().slice(0, 80)
  if (!q) return []
  const url = `${API_BASE}/search.php?s=${encodeURIComponent(q)}`
  try {
    const controller = new AbortController()
    const tid = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 300 } })
    clearTimeout(tid)
    if (!res.ok) return []
    const data = (await res.json()) as { drinks?: Record<string, unknown>[] }
    const drinks = data.drinks
    if (!Array.isArray(drinks) || drinks.length === 0) return []
    return drinks.slice(0, 5).map((d) => {
      const id = typeof d.idDrink === 'string' ? d.idDrink : ''
      const name = typeof d.strDrink === 'string' ? d.strDrink : 'Unknown'
      const category = typeof d.strCategory === 'string' ? d.strCategory : null
      const alcoholic = typeof d.strAlcoholic === 'string' ? d.strAlcoholic : null
      const glass = typeof d.strGlass === 'string' ? d.strGlass : null
      const instructions = typeof d.strInstructions === 'string' ? d.strInstructions : null
      const instructionsZh = typeof (d as Record<string, unknown>).strInstructionsZH === 'string'
        ? (d as Record<string, unknown>).strInstructionsZH as string
        : null
      return {
        id,
        name,
        category,
        alcoholic,
        glass,
        instructions,
        instructionsZh,
        ingredients: parseIngredients(d as Record<string, unknown>),
        thumb: typeof d.strDrinkThumb === 'string' ? d.strDrinkThumb : null,
      }
    })
  } catch {
    return []
  }
}

/** 判斷用戶訊息是否在問調酒（關鍵字：調酒、雞尾酒、cocktail、recipe、配方、瑪格麗特 等） */
export function isCocktailIntent(text: string): boolean {
  const lower = (text || '').toLowerCase().trim()
  const keywords = [
    '調酒', '雞尾酒', 'cocktail', 'cocktails', 'recipe', '配方', '做法',
    'margarita', 'mojito', '瑪格麗特', '莫吉托', '血腥瑪麗', 'bloody mary',
    '長島', 'long island', '琴酒', 'gin ', '伏特加', 'vodka ', '龍舌蘭', 'tequila',
    '怎麼調', '如何做', '推薦調酒', '簡單調酒',
  ]
  return keywords.some((k) => lower.includes(k))
}

/** 從用戶訊息抽出搜尋詞（簡易：取最後一句或關鍵詞） */
export function extractCocktailSearchQuery(text: string): string {
  const t = (text || '').trim()
  if (!t) return 'cocktail'
  const lower = t.toLowerCase()
  const match = t.match(/(?:調酒|雞尾酒|cocktail|recipe|配方|做法)[：:\s]*([^\s。.?!]+)/i)
  if (match?.[1]) return match[1].trim().slice(0, 50)
  if (lower.includes('margarita') || lower.includes('瑪格麗特')) return 'margarita'
  if (lower.includes('mojito') || lower.includes('莫吉托')) return 'mojito'
  if (lower.includes('bloody') || lower.includes('血腥瑪麗')) return 'bloody mary'
  if (lower.includes('長島') || lower.includes('long island')) return 'long island'
  if (lower.includes('琴酒') || lower.includes('gin')) return 'gin'
  if (lower.includes('伏特加') || lower.includes('vodka')) return 'vodka'
  if (lower.includes('龍舌蘭') || lower.includes('tequila')) return 'tequila'
  return 'cocktail'
}

/** 將搜尋結果格式化成給 LLM 的參考文字 */
export function formatCocktailsForPrompt(cocktails: CocktailItem[]): string {
  if (cocktails.length === 0) return ''
  return cocktails
    .map((c) => {
      const ing = c.ingredients.map((i) => (i.measure ? `${i.name} ${i.measure}` : i.name)).join('、')
      const instr = c.instructionsZh || c.instructions || ''
      return `【${c.name}】${c.category ? ` 類別：${c.category}` : ''}${c.glass ? ` 杯具：${c.glass}` : ''}\n材料：${ing}\n作法：${instr.slice(0, 400)}`
    })
    .join('\n\n')
}
