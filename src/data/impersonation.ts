/**
 * R2-166：模仿大賽 — 抽名人/角色名，其他人猜；題庫靜態
 */

export const IMPERSONATION_TOPICS: string[] = [
  '周星馳',
  '麥可·傑克森',
  '貓王',
  '李小龍',
  '川普',
  '歐巴馬',
  '愛因斯坦',
  '卓別林',
  '瑪麗蓮·夢露',
  '麥可·喬丹',
  '柯南',
  '悟空',
  '蜘蛛人',
  '鋼鐵人',
  '小丑',
  '吸血鬼',
  '殭屍',
  '機器人',
  '老人家',
  '嬰兒',
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function pickRandomImpersonation(): string {
  const list = shuffle(IMPERSONATION_TOPICS)
  return list[0] ?? IMPERSONATION_TOPICS[0]
}
