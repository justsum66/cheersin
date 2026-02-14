/**
 * R2-164：心理測驗喝酒版 — 靜態題目＋計分結果類型，結果可帶「建議喝一口」等
 */

export interface PsychQuizQuestion {
  q: string
  options: { label: string; value: 'A' | 'B' | 'C' }[]
}

export interface PsychQuizResult {
  type: string
  title: string
  description: string
  /** 建議懲罰/動作，如「喝一口」 */
  suggestion: string
}

export const PSYCH_QUIZ_QUESTIONS: PsychQuizQuestion[] = [
  { q: '聚會時你通常？', options: [{ label: '主動帶動氣氛', value: 'A' }, { label: '靜靜觀察大家', value: 'B' }, { label: '看心情', value: 'C' }] },
  { q: '被敬酒時你的第一反應？', options: [{ label: '乾啦！', value: 'A' }, { label: '隨意就好', value: 'B' }, { label: '先吃點東西', value: 'C' }] },
  { q: '玩遊戲輸了，你傾向？', options: [{ label: '立刻喝，認賭服輸', value: 'A' }, { label: '討價還價', value: 'B' }, { label: '選大冒險代替', value: 'C' }] },
  { q: '你覺得自己酒量？', options: [{ label: '還行', value: 'A' }, { label: '普普', value: 'B' }, { label: '一杯倒', value: 'C' }] },
  { q: '今晚想早點回家時你會？', options: [{ label: '直接說', value: 'A' }, { label: '再撐一下', value: 'B' }, { label: '偷偷溜', value: 'C' }] },
]

/** 依 A/B/C 數量決定結果類型；簡化版：看 A 多、B 多、C 多。suggestion 可依 usePunishmentCopy 替換為「做一下」。 */
export const PSYCH_QUIZ_RESULTS: PsychQuizResult[] = [
  { type: 'A', title: '派對靈魂', description: '你是場子裡的靈魂人物！敢玩敢喝，大家跟你在一起最嗨。', suggestion: '敬大家一杯～' },
  { type: 'B', title: '隨性玩家', description: '你懂得拿捏分寸，該喝喝、該躲躲，是聰明的玩家。', suggestion: '隨意喝一口就好～' },
  { type: 'C', title: '養生系', description: '你比較保護自己，玩得開心但不想過頭，沒毛病！', suggestion: '可以選擇做一下代替喝～' },
]

function getResultType(answers: ('A' | 'B' | 'C')[]): string {
  const counts = { A: 0, B: 0, C: 0 }
  answers.forEach((a) => { counts[a]++ })
  if (counts.A >= counts.B && counts.A >= counts.C) return 'A'
  if (counts.B >= counts.C) return 'B'
  return 'C'
}

export function getPsychQuizResult(answers: ('A' | 'B' | 'C')[]): PsychQuizResult {
  const type = getResultType(answers)
  return PSYCH_QUIZ_RESULTS.find((r) => r.type === type) ?? PSYCH_QUIZ_RESULTS[1]
}
