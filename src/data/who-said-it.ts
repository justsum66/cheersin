/**
 * R2-158：誰說的 — 題庫為「語錄 + 人名」，多選一猜誰說的
 */

export interface WhoSaidItItem {
  quote: string
  person: string
  /** 選項（含正確答案 + 干擾項） */
  options: string[]
}

export const WHO_SAID_IT_ITEMS: WhoSaidItItem[] = [
  { quote: '我思故我在。', person: '笛卡兒', options: ['笛卡兒', '康德', '尼采', '蘇格拉底'] },
  { quote: '知識就是力量。', person: '培根', options: ['培根', '牛頓', '達爾文', '愛因斯坦'] },
  { quote: '人生而自由，卻無往不在枷鎖之中。', person: '盧梭', options: ['盧梭', '伏爾泰', '孟德斯鳩', '洛克'] },
  { quote: '存在先於本質。', person: '沙特', options: ['沙特', '卡繆', '海德格', '尼采'] },
  { quote: '未經檢視的人生不值得活。', person: '蘇格拉底', options: ['蘇格拉底', '柏拉圖', '亞里斯多德', '伊比鳩魯'] },
  { quote: '一切堅固的東西都煙消雲散了。', person: '馬克思', options: ['馬克思', '恩格斯', '列寧', '毛澤東'] },
  { quote: '上帝已死。', person: '尼采', options: ['尼采', '叔本華', '齊克果', '海德格'] },
  { quote: '我們唯一要害怕的，就是恐懼本身。', person: '羅斯福', options: ['羅斯福', '邱吉爾', '林肯', '甘迺迪'] },
  { quote: '己所不欲，勿施於人。', person: '孔子', options: ['孔子', '孟子', '老子', '荀子'] },
  { quote: '道可道，非常道。', person: '老子', options: ['老子', '莊子', '韓非', '墨子'] },
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

/** 洗牌選項並回傳題目（每題選項順序隨機） */
export function pickRandomWhoSaidIt(count: number): WhoSaidItItem[] {
  const pool = shuffle(WHO_SAID_IT_ITEMS).slice(0, count)
  return pool.map((item) => ({
    ...item,
    options: shuffle(item.options),
  }))
}
