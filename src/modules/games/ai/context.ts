/**
 * P2-378 / P2-404：供 AI 系統提示使用的遊戲列表（推薦遊戲、派對/遊戲配酒）
 * 僅匯出文字摘要，避免在 API 中直接依賴 icons
 */
import { GAMES_META } from '@/config/games.config'

export function getGamesListForPrompt(): string {
  return GAMES_META.map((g) => `${g.name}（${g.players}）：${g.description}`).join('\n')
}
