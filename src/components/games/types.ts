import type { LucideIcon } from 'lucide-react'
import type { ComponentType } from 'react'

/** 單一遊戲選項（Lobby 卡牌與頁面 games 陣列用） */
export interface GameOption {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: 'primary' | 'secondary' | 'accent' | 'white'
  players: string
  component: ComponentType
}

/** 遊戲 ID 型別：與 games[].id 一致（已移除 you-drink, nunchi-call, toast-master, wheel-pick, straw-draw） */
export type GameId =
  | 'truth-or-dare'
  | 'roulette'
  | 'trivia'
  | 'dice'
  | 'reaction'
  | 'memory'
  | 'never-have-i-ever'
  | 'kings-cup'
  | 'baskin-robbins-31'
  | 'up-down-stairs'
  | 'surface-tension'
  | 'countdown-toast'
  | 'random-picker'
  | 'drink-or-safe'
  | 'number-race'
  | 'number-nunchi'
  | 'ultimate-code'
  | 'high-low'
  | 'titanic'
  | 'finger-guessing'
  | 'name-train'
  | 'liar-dice'
  | 'heart-attack'
  | 'coin-flip'
  | 'snail-race'
  | 'number-bomb'
  | '369-clap'
  | 'buzz-game'
  | 'category-chain'
  | 'two-truths-one-lie'
  | 'spicy-truth-or-dare'
  | 'spicy-never-have-i-ever'
  | 'spicy-who-most-likely'
  | null
