/**
 * R2-146：歷史知識問答喝酒版 — 專用歷史冷知識題庫
 */

export interface HistoryTriviaItem {
  q: string
  a: string[]
  correct: number
}

export const HISTORY_TRIVIA: HistoryTriviaItem[] = [
  { q: '「杯酒釋兵權」是哪位皇帝？', a: ['唐太宗', '宋太祖', '明太祖', '清康熙'], correct: 1 },
  { q: '古埃及人用什麼釀啤酒？', a: ['大麥', '小麥', '玉米', '稻米'], correct: 0 },
  { q: '香檳最早在哪個世紀出現？', a: ['15 世紀', '16 世紀', '17 世紀', '18 世紀'], correct: 2 },
  { q: '美國禁酒令（Prohibition）約在何年結束？', a: ['1925', '1933', '1940', '1950'], correct: 1 },
  { q: '「葡萄美酒夜光杯」出自哪首詩？', a: ['涼州詞', '將進酒', '出塞', '從軍行'], correct: 0 },
  { q: '蘇格蘭威士忌最早用於何種用途？', a: ['藥用', '祭祀', '皇室專用', '海軍配給'], correct: 0 },
  { q: '啤酒花（蛇麻）何時開始廣泛用於啤酒？', a: ['中世紀', '羅馬時代', '19 世紀', '20 世紀'], correct: 0 },
  { q: '日本清酒「杜氏」是指？', a: ['酒廠名', '釀酒師傅', '產區', '等級'], correct: 1 },
  { q: '「乾杯」一詞在中文最早與何有關？', a: ['祭祀', '軍中誓師', '宴席禮儀', '婚禮'], correct: 0 },
  { q: '波爾多葡萄酒貿易史上與哪國關係最深？', a: ['英國', '荷蘭', '西班牙', '德國'], correct: 0 },
  { q: '古羅馬人常在水裡加什麼以淨化飲用？', a: ['醋', '葡萄酒', '鹽', '蜂蜜'], correct: 1 },
  { q: '中國黃酒「紹興酒」產自哪一省？', a: ['江蘇', '浙江', '安徽', '福建'], correct: 1 },
]

/** 洗牌並取前 n 題，選項順序隨機 */
export function shuffleHistoryTrivia(count: number): HistoryTriviaItem[] {
  const pool = [...HISTORY_TRIVIA].sort(() => Math.random() - 0.5).slice(0, count)
  return pool.map((item) => {
    const indices = [0, 1, 2, 3].sort(() => Math.random() - 0.5)
    const newA = indices.map((i) => item.a[i])
    const newCorrect = indices.indexOf(item.correct)
    return { q: item.q, a: newA, correct: newCorrect }
  })
}
