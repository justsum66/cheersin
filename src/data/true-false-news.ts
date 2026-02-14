/**
 * R2-154：真假新聞 — 題庫為「標題 + 真/假」，之後可接 API
 */

export interface TrueFalseNewsItem {
  title: string
  isTrue: boolean
}

export const TRUE_FALSE_NEWS: TrueFalseNewsItem[] = [
  { title: '科學家證實每天一杯紅酒可延年益壽', isTrue: false },
  { title: '啤酒最早可能源自約一萬年前的中東地區', isTrue: true },
  { title: '香檳開瓶時噴出的氣泡會讓酒精濃度升高', isTrue: false },
  { title: '日本清酒「大吟釀」精米步合需 50% 以下', isTrue: true },
  { title: '威士忌陳年越久酒精度會越高', isTrue: false },
  { title: '葡萄酒的單寧主要來自葡萄皮與籽', isTrue: true },
  { title: '「掛杯」越明顯代表酒越甜', isTrue: false },
  { title: 'Tequila 的原料龍舌蘭必須產自墨西哥特定產區', isTrue: true },
  { title: '啤酒加檸檬可以解酒', isTrue: false },
  { title: '香檳法定產區僅限法國香檳區', isTrue: true },
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function pickRandomTrueFalseNews(count: number): TrueFalseNewsItem[] {
  return shuffle(TRUE_FALSE_NEWS).slice(0, count)
}
