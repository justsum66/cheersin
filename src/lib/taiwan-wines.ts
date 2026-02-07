/**
 * 任務 140：台灣在地酒款資料庫，供 AI 侍酒師推薦使用
 * 資料結構與 taiwan-wines.json 對齊；必填欄位：Bottle.name/type、Brand.id/name/category/bottles
 */
import taiwanWinesJson from '@/data/taiwan-wines.json'

/** 單一酒款：品名、類型、價格區間（與 JSON bottles[] 一致） */
export interface Bottle {
  name: string
  type: string
  priceRange?: string
}

/** 品牌：id、名稱、類別、產區、描述、酒款列表 */
export interface Brand {
  id: string
  name: string
  category: string
  region?: string
  description?: string
  bottles: Bottle[]
}

/** JSON 根結構：metadata、categories、brands、可選 importers */
export interface TaiwanWinesData {
  metadata?: { name: string; description?: string; lastUpdated: string; sources?: string }
  categories?: string[]
  brands: Brand[]
  importers?: { name: string; focus: string }[]
}

const data = taiwanWinesJson as TaiwanWinesData

/** 回傳可供寫入系統提示的台灣酒款文字摘要（供 140 台灣在地酒款推薦） */
export function getTaiwanWinesContext(): string {
  const brands = data.brands ?? []
  if (brands.length === 0) return ''
  const lines: string[] = ['以下為台灣在地／常見酒款與品牌，推薦時可優先提及：']
  for (const b of brands) {
    const desc = b.description ? `（${b.description}）` : ''
    const bottles = (b.bottles ?? []).map((x) => `${x.name}${x.priceRange ? ` ${x.priceRange}` : ''}`).join('、')
    lines.push(`- ${b.name}${desc}：${bottles || '多款酒款'}`)
  }
  const importers = data.importers ?? []
  if (importers.length > 0) {
    lines.push('台灣常見進口商：' + importers.map((i) => `${i.name}（${i.focus}）`).join('、'))
  }
  return lines.join('\n')
}

/** 回傳品牌列表（供 API 或前端篩選） */
export function getTaiwanWinesBrands(): Brand[] {
  return [...(data.brands ?? [])]
}

/** 熱賣清單：攤平為酒款列表，依品牌順序＋品名字母排序；可配置來源為 data.brands */
export interface BottleWithBrand extends Bottle {
  brandId: string
  brandName: string
  category: string
  region?: string
}

export function getTaiwanWinesHotBottles(opts?: { category?: string; limit?: number }): BottleWithBrand[] {
  const brands = data.brands ?? []
  const category = opts?.category?.toLowerCase()
  const limit = opts?.limit ?? 100
  const flat: BottleWithBrand[] = []
  for (const b of brands) {
    if (category && b.category?.toLowerCase() !== category) continue
    for (const bottle of b.bottles ?? []) {
      flat.push({
        ...bottle,
        brandId: b.id,
        brandName: b.name,
        category: b.category,
        region: b.region,
      })
    }
  }
  flat.sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'))
  return flat.slice(0, limit)
}

/** WINE #4 篩選選項：類型關鍵字、產區關鍵字、價格上限（從 priceRange 解析數字，取區間最大值比對） */
export interface FilterBottlesOptions {
  typeKeyword?: string
  regionKeyword?: string
  maxPrice?: number
}

/** 從 priceRange 字串（如 "NT$ 800–1200"）解析出最高價數字，無法解析時回傳 undefined */
export function parsePriceRangeMax(priceRange: string | undefined): number | undefined {
  if (!priceRange || typeof priceRange !== 'string') return undefined
  const numbers = priceRange.replace(/,/g, '').match(/\d+/g)
  if (!numbers?.length) return undefined
  const nums = numbers.map(Number)
  return Math.max(...nums)
}

/** 依類型／產區／價格上限篩選 BottleWithBrand 列表（用於測驗結果、助理推薦、列表頁） */
export function filterBottles(
  bottles: BottleWithBrand[],
  opts: FilterBottlesOptions
): BottleWithBrand[] {
  let out = bottles
  if (opts.typeKeyword?.trim()) {
    const k = opts.typeKeyword.trim().toLowerCase()
    out = out.filter((b) => b.type?.toLowerCase().includes(k) || b.category?.toLowerCase().includes(k))
  }
  if (opts.regionKeyword?.trim()) {
    const k = opts.regionKeyword.trim().toLowerCase()
    out = out.filter((b) => b.region?.toLowerCase().includes(k))
  }
  if (opts.maxPrice != null && opts.maxPrice > 0) {
    out = out.filter((b) => {
      const max = parsePriceRangeMax(b.priceRange)
      return max != null && max <= opts.maxPrice!
    })
  }
  return out
}
