/**
 * R2-148：繞口令挑戰 — 靜態題庫，抽題後可選語音辨識或手動完成/跳過
 */

export const TONGUE_TWISTERS: string[] = [
  '紅鳳凰粉鳳凰，紅粉鳳凰花鳳凰。',
  '四是四，十是十，十四是十四，四十是四十。',
  '吃葡萄不吐葡萄皮，不吃葡萄倒吐葡萄皮。',
  '黑化肥發灰會揮發，灰化肥揮發會發黑。',
  '劉奶奶喝牛奶，牛奶奶請劉奶奶喝牛奶。',
  '扁擔長板凳寬，板凳沒有扁擔長，扁擔沒有板凳寬。',
  '門口有四輛四輪大馬車，你愛拉哪兩輛就拉哪兩輛。',
  '會燉我的燉凍豆腐，來燉我的燉凍豆腐。',
  '坡上立著一隻鵝，坡下就是一條河，寬寬的河，肥肥的鵝。',
  '老龍惱怒鬧老農，老農惱怒鬧老龍。',
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function pickRandomTongueTwister(): string {
  const list = shuffle(TONGUE_TWISTERS)
  return list[0] ?? TONGUE_TWISTERS[0]
}

export function pickRandomTongueTwisters(count: number): string[] {
  return shuffle(TONGUE_TWISTERS).slice(0, count)
}
