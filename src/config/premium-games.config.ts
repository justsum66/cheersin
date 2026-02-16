/**
 * 付費限定遊戲配置
 * 這些遊戲只有付費用戶才能遊玩，免費用戶只能預覽
 */

import type { SubscriptionTier } from '@/lib/subscription'

export interface PremiumGameMeta {
  /** 遊戲 ID */
  id: string
  /** 遊戲名稱 */
  name: string
  /** 遊戲描述 */
  description: string
  /** 需要的訂閱等級 */
  requiredTier: 'basic' | 'premium'
  /** 是否為新遊戲 */
  isNew?: boolean
  /** 標籤（如「🔥 付費限定」） */
  badge?: string
  /** 預覽描述（給免費用戶看） */
  previewDescription?: string
  /** 遊戲分類 */
  category: 'party' | 'reaction' | 'guess' | 'draw' | 'adult'
}

/** 付費限定遊戲列表 */
export const PREMIUM_GAMES: PremiumGameMeta[] = [
  {
    id: 'extreme-truth',
    name: '極限真心話',
    description: '超越普通真心話的刺激問題，挑戰你的極限！',
    requiredTier: 'basic',
    isNew: true,
    badge: '🔥 付費限定',
    previewDescription: '敢問出口嗎？18+ 限定的超刺激問題',
    category: 'adult',
  },
  {
    id: 'dare-master',
    name: '大冒險大師',
    description: '100+ 獨家大冒險挑戰，從溫和到瘋狂應有盡有',
    requiredTier: 'basic',
    isNew: true,
    badge: '🔥 付費限定',
    previewDescription: '獨家挑戰內容，讓派對 high 到最高點',
    category: 'party',
  },
  {
    id: 'drinking-roulette',
    name: '酒神輪盤',
    description: '命運輪盤決定你的懲罰，誰是今晚的酒神？',
    requiredTier: 'basic',
    badge: '⭐ Pro 專屬',
    previewDescription: '刺激的輪盤遊戲，由命運決定誰喝酒',
    category: 'party',
  },
  {
    id: 'wine-sommelier-battle',
    name: '侍酒師對決',
    description: '運用你的酒類知識與 AI 對戰，看誰更懂酒！',
    requiredTier: 'premium',
    badge: '👑 VIP 專屬',
    previewDescription: 'AI 侍酒師挑戰賽，測試你的真實酒量',
    category: 'guess',
  },
  {
    id: 'couples-challenge',
    name: '情侶挑戰賽',
    description: '專為情侶設計的 50+ 甜蜜挑戰，增進感情必玩',
    requiredTier: 'premium',
    badge: '💕 VIP 限定',
    previewDescription: '專屬情侶的浪漫挑戰，升級 VIP 解鎖',
    category: 'adult',
  },
]

/** 免費遊戲 ID 列表（免費用戶只能玩這些） */
export const FREE_GAMES_IDS = [
  'truth-or-dare',
  'never-have-i-ever',
  'dice-drinking',
  'rock-paper-scissors',
  'spin-the-bottle',
]

/**
 * 檢查用戶是否可以遊玩指定遊戲
 * @param gameId 遊戲 ID
 * @param userTier 用戶訂閱等級
 * @returns 是否可以遊玩
 */
export function canPlayGame(gameId: string, userTier: SubscriptionTier): boolean {
  // 免費遊戲所有人都可以玩
  if (FREE_GAMES_IDS.includes(gameId)) {
    return true
  }

  // 檢查付費遊戲
  const premiumGame = PREMIUM_GAMES.find((g) => g.id === gameId)
  if (!premiumGame) {
    // 非付費限定遊戲，預設可玩
    return true
  }

  // 檢查訂閱等級
  if (premiumGame.requiredTier === 'basic') {
    return userTier === 'basic' || userTier === 'premium'
  }
  if (premiumGame.requiredTier === 'premium') {
    return userTier === 'premium'
  }

  return false
}

/**
 * 取得遊戲所需的訂閱等級
 * @param gameId 遊戲 ID
 * @returns 所需等級，null 表示免費
 */
export function getRequiredTier(gameId: string): 'basic' | 'premium' | null {
  const premiumGame = PREMIUM_GAMES.find((g) => g.id === gameId)
  return premiumGame?.requiredTier ?? null
}
