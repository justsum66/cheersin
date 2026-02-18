/**
 * R2-168：酒精知識王 — 酒精/品酒專用題庫，靜態；之後可接品酒學院 API
 */

export interface AlcoholTriviaItem {
  q: string
  a: string[]
  correct: number
  /** GAME-095: Explanation shown after answer */
  explanation?: string
  /** GAME-096: Difficulty level */
  difficulty?: 1 | 2 | 3
}

export const ALCOHOL_TRIVIA: AlcoholTriviaItem[] = [
  { q: '香檳（Champagne）只能產自哪個國家？', a: ['法國', '義大利', '西班牙', '美國'], correct: 0, explanation: '香檳是法國香檳區的專屬產區名稱', difficulty: 1 },
  { q: '清酒的原料主要是什麼？', a: ['小麥', '大麥', '米', '馬鈴薯'], correct: 2, explanation: '日本清酒以米為原料，經發酵釀造', difficulty: 1 },
  { q: '威士忌「單一麥芽」（Single Malt）的意思是？', a: ['只用一種麥芽', '來自單一酒廠', '只蒸餾一次', '單一木桶陳年'], correct: 1, explanation: 'Single Malt 指來自同一間蒸餾廠的麥芽威士忌', difficulty: 2 },
  { q: '葡萄酒的「單寧」主要來自哪裡？', a: ['果肉', '葡萄皮與籽', '酵母', '木桶'], correct: 1, explanation: '單寧主要來自葡萄的皮、籽和梗', difficulty: 2 },
  { q: '「氣泡酒」與「香檳」的關係是？', a: ['相同', '香檳是氣泡酒的一種', '氣泡酒是香檳的一種', '無關'], correct: 1, explanation: '香檳是產自法國香檳區的氣泡酒', difficulty: 1 },
  { q: '「Dry」在酒標上通常表示？', a: ['不甜', '很甜', '酸', '苦'], correct: 0, explanation: 'Dry 表示殘糖量低，口感偏不甜', difficulty: 1 },
  { q: '啤酒的主要原料除了麥芽外還有？', a: ['米', '啤酒花', '葡萄', '甘蔗'], correct: 1, explanation: '啤酒花（Hops）提供啤酒苦味和香氣', difficulty: 1 },
  { q: 'Tequila 的原料龍舌蘭主要產自？', a: ['古巴', '墨西哥', '牙買加', '巴西'], correct: 1, explanation: '正宗 Tequila 只能用墨西哥特定品種的藍色龍舌蘭', difficulty: 1 },
  { q: '紅酒適飲溫度大約是？', a: ['冰鎮 5°C', '室溫 18–20°C', '溫熱 30°C', '常溫即可'], correct: 1, explanation: '紅酒最佳飲用溫度約 16-20°C', difficulty: 2 },
  { q: '雪莉酒（Sherry）產自哪國？', a: ['葡萄牙', '西班牙', '義大利', '希臘'], correct: 1, explanation: '雪莉酒產自西班牙安達盧西亞的赫雷斯地區', difficulty: 2 },
  { q: '品酒時「掛杯」主要代表什麼？', a: ['酒精度較高', '甜度較高', '酸度較高', '品質較好'], correct: 0, explanation: '掛杯（酒腿）主要反映酒精含量和粘稠度', difficulty: 3 },
  { q: '「Brut」在氣泡酒標上表示？', a: ['很甜', '不甜或極干', '半甜', '甜'], correct: 1, explanation: 'Brut 表示每升殘糖量低於 12 克', difficulty: 2 },
  { q: '冰酒（Ice Wine）的葡萄採收時機是？', a: ['夏季', '秋季', '冬季冰凍時', '春季'], correct: 2, explanation: '冰酒葡萄需在 -7°C 以下自然冰凍後採收', difficulty: 3 },
  { q: '日本清酒「大吟釀」的精米步合通常？', a: ['70% 以上', '60% 以下', '50% 以下', '80% 以上'], correct: 2, explanation: '大吟釀要求精米步合 50% 以下，即磨去一半以上米粒', difficulty: 3 },
  { q: 'Prosecco 氣泡酒主要產自哪國？', a: ['法國', '西班牙', '義大利', '德國'], correct: 2, explanation: 'Prosecco 來自義大利的威尼托地區', difficulty: 2 },
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function shuffleAlcoholTrivia(count: number, difficulty?: number): AlcoholTriviaItem[] {
  const filtered = difficulty ? ALCOHOL_TRIVIA.filter(q => q.difficulty === difficulty) : ALCOHOL_TRIVIA
  const pool = shuffle(filtered.length > 0 ? filtered : ALCOHOL_TRIVIA).slice(0, count)
  return pool.map((item) => {
    const indices = [0, 1, 2, 3].sort(() => Math.random() - 0.5)
    const newA = indices.map((i) => item.a[i])
    const newCorrect = indices.indexOf(item.correct)
    return { q: item.q, a: newA, correct: newCorrect }
  })
}
