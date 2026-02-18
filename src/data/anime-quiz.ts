/**
 * R2-142：動漫猜謎喝酒遊戲 — 題庫為「台詞/語錄 + 出處（作品/角色）」，多選一猜出處
 * 純文字題庫，無版權圖。
 */

export interface AnimeQuizItem {
  quote: string
  source: string
  options: string[]
  /** GAME-097: Optional hint text (e.g. character name, scene) */
  hint?: string
  /** GAME-098: Series/genre category for filtering */
  series?: string
}

export const ANIME_QUIZ_ITEMS: AnimeQuizItem[] = [
  { quote: '我要成為海賊王！', source: '航海王', options: ['航海王', '火影忍者', '死神', '進擊的巨人'], hint: '草帽小子的夢想', series: '少年' },
  { quote: '真相永遠只有一個。', source: '名偵探柯南', options: ['名偵探柯南', '金田一', '死亡筆記本', 'Psycho-Pass'], hint: '縮小的偵探', series: '推理' },
  { quote: '你已經死了。', source: '北斗神拳', options: ['北斗神拳', '七龍珠', 'JoJo', '刃牙'], hint: '拳四郎的名言', series: '經典' },
  { quote: '代表月亮懲罰你！', source: '美少女戰士', options: ['美少女戰士', '小魔女DoReMi', '光之美少女', '庫洛魔法使'], hint: '變身少女', series: '少女' },
  { quote: '還差得遠呢。', source: '網球王子', options: ['網球王子', '排球少年', '黑子的籃球', '灌籃高手'], hint: '手塚部長的口頭禪', series: '運動' },
  { quote: '我不會放棄，總有一天要當上火影。', source: '火影忍者', options: ['火影忍者', '航海王', '我的英雄學院', '鬼滅之刃'], hint: '木葉村的吊車尾', series: '少年' },
  { quote: '人類的讚歌就是勇氣的讚歌。', source: 'JoJo的奇妙冒險', options: ['JoJo的奇妙冒險', '進擊的巨人', '鋼之鍊金術師', '鬼滅之刃'], hint: '齊貝林的哲學', series: '少年' },
  { quote: '沒有什麼是拳頭解決不了的。', source: '一拳超人', options: ['一拳超人', '我的英雄學院', '靈能百分百', '咒術迴戰'], hint: '禿頭披風俠', series: '少年' },
  { quote: '這不是請求，是命令。', source: 'Code Geass', options: ['Code Geass', '死亡筆記本', 'Psycho-Pass', '進擊的巨人'], hint: 'Geass 的力量', series: '科幻' },
  { quote: '我不當人類了，JoJo！', source: 'JoJo的奇妙冒險', options: ['JoJo的奇妙冒險', '進擊的巨人', '東京喰種', '寄生獸'], hint: 'DIO 的宣言', series: '少年' },
]

/** GAME-098: Extract unique series categories */
export function getAnimeSeriesCategories(): string[] {
  const set = new Set<string>()
  for (const item of ANIME_QUIZ_ITEMS) {
    if (item.series) set.add(item.series)
  }
  return Array.from(set)
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function pickRandomAnimeQuiz(count: number, seriesFilter?: string): AnimeQuizItem[] {
  let filtered = ANIME_QUIZ_ITEMS
  if (seriesFilter) {
    filtered = ANIME_QUIZ_ITEMS.filter(item => item.series === seriesFilter)
    if (filtered.length === 0) filtered = ANIME_QUIZ_ITEMS
  }
  const pool = shuffle(filtered).slice(0, count)
  return pool.map((item) => ({
    ...item,
    options: shuffle(item.options),
  }))
}
