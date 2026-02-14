/**
 * R2-176：酒令（划拳/行酒令）題材 — 中國傳統酒令用語，數位化抽籤用
 */

export interface JiulingItem {
  /** 酒令詞（如一心敬、兩相好） */
  text: string
  /** 簡短說明或玩法 */
  hint?: string
}

/** 常見划拳/行酒令用語（數字拳 0～10 等） */
export const JIULING_PHRASES: JiulingItem[] = [
  { text: '一心敬', hint: '敬對方一杯' },
  { text: '兩相好', hint: '兩人好' },
  { text: '三桃園', hint: '桃園三結義' },
  { text: '四季財', hint: '四季發財' },
  { text: '五魁首', hint: '五經魁首' },
  { text: '六六順', hint: '六六大順' },
  { text: '七巧', hint: '七夕' },
  { text: '八匹馬', hint: '八駿' },
  { text: '九長有', hint: '長長久久' },
  { text: '滿堂紅', hint: '十全十美' },
  { text: '寶一對', hint: '零／對子' },
  { text: '哥倆好', hint: '兩人好' },
  { text: '三星照', hint: '福祿壽' },
  { text: '四喜財', hint: '四喜臨門' },
  { text: '五經魁', hint: '五魁' },
  { text: '六順風', hint: '順風順水' },
  { text: '七個巧', hint: '乞巧' },
  { text: '八仙到', hint: '八仙' },
  { text: '九連環', hint: '九九連環' },
  { text: '全來到', hint: '全部到齊' },
  { text: '一定中', hint: '一定贏' },
  { text: '兩邊好', hint: '兩好' },
  { text: '三結義', hint: '桃園三結義' },
  { text: '四鴻喜', hint: '四喜' },
  { text: '五子登科', hint: '五子' },
  { text: '六高升', hint: '步步高升' },
  { text: '七仙女', hint: '七仙' },
  { text: '八馬雙', hint: '八匹馬' },
  { text: '九重天', hint: '九天' },
  { text: '十全美', hint: '十全十美' },
]

/** 隨機抽一則酒令 */
export function pickRandomJiuling(): JiulingItem {
  return JIULING_PHRASES[Math.floor(Math.random() * JIULING_PHRASES.length)]
}
