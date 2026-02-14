/**
 * R2-142：動漫猜謎喝酒遊戲 — 題庫為「台詞/語錄 + 出處（作品/角色）」，多選一猜出處
 * 純文字題庫，無版權圖。
 */

export interface AnimeQuizItem {
  quote: string
  source: string
  options: string[]
}

export const ANIME_QUIZ_ITEMS: AnimeQuizItem[] = [
  { quote: '我要成為海賊王！', source: '航海王', options: ['航海王', '火影忍者', '死神', '進擊的巨人'] },
  { quote: '真相永遠只有一個。', source: '名偵探柯南', options: ['名偵探柯南', '金田一', '死亡筆記本', 'Psycho-Pass'] },
  { quote: '你已經死了。', source: '北斗神拳', options: ['北斗神拳', '七龍珠', 'JoJo', '刃牙'] },
  { quote: '代表月亮懲罰你！', source: '美少女戰士', options: ['美少女戰士', '小魔女DoReMi', '光之美少女', '庫洛魔法使'] },
  { quote: '還差得遠呢。', source: '網球王子', options: ['網球王子', '排球少年', '黑子的籃球', '灌籃高手'] },
  { quote: '我不會放棄，總有一天要當上火影。', source: '火影忍者', options: ['火影忍者', '航海王', '我的英雄學院', '鬼滅之刃'] },
  { quote: '人類的讚歌就是勇氣的讚歌。', source: 'JoJo的奇妙冒險', options: ['JoJo的奇妙冒險', '進擊的巨人', '鋼之鍊金術師', '鬼滅之刃'] },
  { quote: '沒有什麼是拳頭解決不了的。', source: '一拳超人', options: ['一拳超人', '我的英雄學院', '靈能百分百', '咒術迴戰'] },
  { quote: '這不是請求，是命令。', source: 'Code Geass', options: ['Code Geass', '死亡筆記本', 'Psycho-Pass', '進擊的巨人'] },
  { quote: '我不當人類了，JoJo！', source: 'JoJo的奇妙冒險', options: ['JoJo的奇妙冒險', '進擊的巨人', '東京喰種', '寄生獸'] },
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function pickRandomAnimeQuiz(count: number): AnimeQuizItem[] {
  const pool = shuffle(ANIME_QUIZ_ITEMS).slice(0, count)
  return pool.map((item) => ({
    ...item,
    options: shuffle(item.options),
  }))
}
