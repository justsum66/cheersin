/**
 * R2-152：表情包大戰 — 情境＋多選表情包選項，投票決勝；題庫與選項靜態
 */

export interface EmojiBattleRound {
  scenario: string
  options: string[]
  /** 最貼切的一個（可選，用於揭曉時提示） */
  best?: string
}

export const EMOJI_BATTLE_ROUNDS: EmojiBattleRound[] = [
  { scenario: '老闆說「明天不用來了」時你的表情', options: ['😭', '😤', '🙂', '🤡', '💀'], best: '💀' },
  { scenario: '看到前任牽新歡時', options: ['😏', '🙄', '😶', '🔥', '👀'], best: '🙄' },
  { scenario: '半夜餓到不行時', options: ['😩', '🤤', '🫠', '💀', '🙏'], best: '🤤' },
  { scenario: '被朋友背叛的瞬間', options: ['😱', '😤', '💔', '🤡', '👊'], best: '💔' },
  { scenario: '週一早上鬧鐘響', options: ['😴', '😵', '🫠', '🙃', '💀'], best: '🫠' },
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function pickRandomEmojiBattle(): EmojiBattleRound {
  const list = shuffle(EMOJI_BATTLE_ROUNDS)
  return { ...list[0], options: shuffle(list[0].options) }
}
