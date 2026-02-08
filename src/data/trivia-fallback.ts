/**
 * 本地題庫：TRIVIA_API_KEY 未設定時由 API 與 Trivia 元件共用。
 * 與 Trivia 元件內 questionsRaw 同步（單一來源）。
 */
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface TriviaQuestionRaw {
  q: string
  a: string[]
  correct: number
  difficulty: Difficulty
}

export const TRIVIA_FALLBACK_QUESTIONS: TriviaQuestionRaw[] = [
  { q: '香檳（Champagne）只能產自哪個國家？', a: ['法國', '義大利', '西班牙', '美國'], correct: 0, difficulty: 'easy' },
  { q: '哪種葡萄品種被稱為「紅酒之王」？', a: ['Merlot', 'Pinot Noir', 'Cabernet Sauvignon', 'Syrah'], correct: 2, difficulty: 'medium' },
  { q: '這杯酒如果有「軟木塞味」（Corked），聞起來像什麼？', a: ['花香', '濕紙板', '醋味', '焦糖'], correct: 1, difficulty: 'medium' },
  { q: '清酒的原料主要是什麼？', a: ['小麥', '大麥', '米', '馬鈴薯'], correct: 2, difficulty: 'easy' },
  { q: '威士忌「單一麥芽」（Single Malt）的意思是？', a: ['只用一種麥芽', '來自單一酒廠', '只蒸餾一次', '單一木桶陳年'], correct: 1, difficulty: 'medium' },
  { q: '葡萄酒的「單寧」主要來自哪裡？', a: ['果肉', '葡萄皮與籽', '酵母', '木桶'], correct: 1, difficulty: 'medium' },
  { q: '「氣泡酒」與「香檳」的關係是？', a: ['相同', '香檳是氣泡酒的一種', '氣泡酒是香檳的一種', '無關'], correct: 1, difficulty: 'easy' },
  { q: '品酒時「掛杯」主要代表什麼？', a: ['酒精度較高', '甜度較高', '酸度較高', '品質較好'], correct: 0, difficulty: 'medium' },
  { q: '「Dry」在酒標上通常表示？', a: ['不甜', '很甜', '酸', '苦'], correct: 0, difficulty: 'easy' },
  { q: '啤酒的主要原料除了麥芽外還有？', a: ['米', '啤酒花', '葡萄', '甘蔗'], correct: 1, difficulty: 'easy' },
  { q: 'Prosecco 氣泡酒主要產自哪國？', a: ['法國', '西班牙', '義大利', '德國'], correct: 2, difficulty: 'easy' },
  { q: '「陳年」對紅酒的主要影響是？', a: ['變甜', '單寧柔化、風味複雜', '變酸', '變苦'], correct: 1, difficulty: 'medium' },
  { q: 'Tequila 的原料龍舌蘭主要產自？', a: ['古巴', '墨西哥', '牙買加', '巴西'], correct: 1, difficulty: 'easy' },
  { q: '「Nose」在品酒術語中指？', a: ['口感', '香氣', '餘韻', '色澤'], correct: 1, difficulty: 'medium' },
  { q: '香檳法（傳統法）的二次發酵在哪裡進行？', a: ['不鏽鋼槽', '瓶中', '木桶', '槽中'], correct: 1, difficulty: 'hard' },
  { q: '冰酒（Ice Wine）的葡萄採收時機是？', a: ['夏季', '秋季', '冬季冰凍時', '春季'], correct: 2, difficulty: 'medium' },
  { q: '蘇格蘭威士忌必須在蘇格蘭陳年至少幾年？', a: ['1 年', '2 年', '3 年', '5 年'], correct: 2, difficulty: 'hard' },
  { q: '「Brut」在氣泡酒標上表示？', a: ['很甜', '不甜或極干', '半甜', '甜'], correct: 1, difficulty: 'medium' },
  { q: '紅酒適飲溫度大約是？', a: ['冰鎮 5°C', '室溫 18–20°C', '溫熱 30°C', '常溫即可'], correct: 1, difficulty: 'easy' },
  { q: 'Pinot Noir 通常與哪個產區最著名？', a: ['納帕', '波爾多', '勃艮第', '里奧哈'], correct: 2, difficulty: 'medium' },
  { q: '「Corked」酒的主要成因是？', a: ['氧化', 'TCA 軟木塞污染', '過度陳年', '保存不當'], correct: 1, difficulty: 'hard' },
  { q: '雪莉酒（Sherry）產自哪國？', a: ['葡萄牙', '西班牙', '義大利', '希臘'], correct: 1, difficulty: 'easy' },
  { q: '「單寧」在口中的感覺通常是？', a: ['甜', '澀、收斂', '酸', '辣'], correct: 1, difficulty: 'medium' },
  { q: '波爾多混釀常包含哪兩種葡萄？', a: ['Chardonnay + Sauvignon', 'Cabernet + Merlot', 'Pinot + Syrah', 'Riesling + Gewürz'], correct: 1, difficulty: 'hard' },
  { q: '啤酒的「IBU」指的是？', a: ['酒精度', '苦度', '甜度', '色度'], correct: 1, difficulty: 'medium' },
  { q: '日本清酒「大吟釀」的精米步合通常？', a: ['70% 以上', '60% 以下', '50% 以下', '80% 以上'], correct: 2, difficulty: 'hard' },
  { q: '「氧化」對酒的典型影響是？', a: ['變甜', '變苦、失去果香', '變酸', '無影響'], correct: 1, difficulty: 'medium' },
  { q: 'Riesling 最常與哪個產區聯想？', a: ['波爾多', '納帕', '德國／阿爾薩斯', '澳洲'], correct: 2, difficulty: 'medium' },
  { q: '「Finish」在品酒中指？', a: ['開瓶方式', '餘韻、尾韻', '第一印象', '色澤'], correct: 1, difficulty: 'medium' },
  { q: '香檳的 AOC 法定產區主要在哪一區？', a: ['Loire', 'Champagne', 'Burgundy', 'Alsace'], correct: 1, difficulty: 'hard' },
]

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** 依難度篩選、洗牌、取前 limit 題，每題選項順序打亂 */
export function getTriviaFallback(limit: number, difficulty: '' | Difficulty): Array<{ id: string; q: string; a: string[]; correct: number; difficulty: Difficulty }> {
  const pool = difficulty === ''
    ? [...TRIVIA_FALLBACK_QUESTIONS]
    : TRIVIA_FALLBACK_QUESTIONS.filter((item) => item.difficulty === difficulty)
  const usePool = pool.length < limit ? [...TRIVIA_FALLBACK_QUESTIONS] : pool
  const picked = shuffle(usePool).slice(0, limit)
  return picked.map((item, idx) => {
    const indices = [0, 1, 2, 3].sort(() => Math.random() - 0.5)
    const newA = indices.map((i) => item.a[i])
    const correct = indices.indexOf(item.correct)
    return {
      id: `local-${idx}-${Date.now()}`,
      q: item.q,
      a: newA,
      correct: correct >= 0 ? correct : 0,
      difficulty: item.difficulty,
    }
  })
}
