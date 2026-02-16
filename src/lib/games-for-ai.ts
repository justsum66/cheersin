/**
 * 遊戲資訊 - 供 AI 聊天使用
 * 提供遊戲列表給 AI 助手，讓它能推薦適合的派對遊戲
 */

export interface GameInfo {
  id: string
  name: string
  nameTw: string
  description: string
  minPlayers: number
  maxPlayers: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string[]
  isPremium: boolean
}

/**
 * 遊戲列表
 */
export const GAMES_LIST: GameInfo[] = [
  {
    id: 'truth-or-dare',
    name: 'Truth or Dare',
    nameTw: '真心話大冒險',
    description: '經典派對遊戲，選擇回答真心話或執行大冒險任務',
    minPlayers: 2,
    maxPlayers: 20,
    difficulty: 'easy',
    category: ['party', 'ice-breaker'],
    isPremium: false,
  },
  {
    id: 'never-have-i-ever',
    name: 'Never Have I Ever',
    nameTw: '我從來沒有',
    description: '說出你沒做過的事，做過的人要喝酒',
    minPlayers: 3,
    maxPlayers: 20,
    difficulty: 'easy',
    category: ['drinking', 'party'],
    isPremium: false,
  },
  {
    id: 'spin-the-bottle',
    name: 'Spin the Bottle',
    nameTw: '轉瓶子',
    description: '轉動瓶子，被指到的人執行任務',
    minPlayers: 4,
    maxPlayers: 12,
    difficulty: 'easy',
    category: ['party', 'random'],
    isPremium: false,
  },
  {
    id: 'kings-cup',
    name: "King's Cup",
    nameTw: '國王遊戲',
    description: '抽牌遊戲，每張牌有不同規則',
    minPlayers: 3,
    maxPlayers: 10,
    difficulty: 'medium',
    category: ['drinking', 'cards'],
    isPremium: false,
  },
  {
    id: 'drunk-jenga',
    name: 'Drunk Jenga',
    nameTw: '酒醉疊疊樂',
    description: '每塊積木上都有挑戰任務',
    minPlayers: 2,
    maxPlayers: 8,
    difficulty: 'medium',
    category: ['drinking', 'skill'],
    isPremium: true,
  },
  {
    id: 'beer-pong',
    name: 'Beer Pong',
    nameTw: '乒乓酒',
    description: '將球投入對方杯中，命中則對方喝酒',
    minPlayers: 2,
    maxPlayers: 4,
    difficulty: 'medium',
    category: ['drinking', 'skill', 'competitive'],
    isPremium: true,
  },
  {
    id: 'flip-cup',
    name: 'Flip Cup',
    nameTw: '翻杯遊戲',
    description: '喝完酒後用手指翻轉杯子',
    minPlayers: 4,
    maxPlayers: 20,
    difficulty: 'easy',
    category: ['drinking', 'team', 'competitive'],
    isPremium: false,
  },
  {
    id: 'quarters',
    name: 'Quarters',
    nameTw: '彈硬幣',
    description: '將硬幣彈入杯中',
    minPlayers: 2,
    maxPlayers: 8,
    difficulty: 'medium',
    category: ['drinking', 'skill'],
    isPremium: false,
  },
  {
    id: 'power-hour',
    name: 'Power Hour',
    nameTw: '力量一小時',
    description: '每分鐘喝一小口，持續一小時',
    minPlayers: 1,
    maxPlayers: 50,
    difficulty: 'hard',
    category: ['drinking', 'endurance'],
    isPremium: true,
  },
  {
    id: 'most-likely-to',
    name: 'Most Likely To',
    nameTw: '最有可能',
    description: '投票誰最有可能做某事',
    minPlayers: 3,
    maxPlayers: 20,
    difficulty: 'easy',
    category: ['party', 'voting'],
    isPremium: false,
  },
]

/**
 * 獲取遊戲列表（供 AI Prompt 使用）
 */
export function getGamesListForPrompt(): string {
  const gameDescriptions = GAMES_LIST.map((game) => {
    const premium = game.isPremium ? ' [Premium]' : ''
    return `- ${game.nameTw} (${game.name})${premium}: ${game.description} (${game.minPlayers}-${game.maxPlayers}人)`
  }).join('\n')

  return `
## 可用的派對遊戲

${gameDescriptions}

你可以根據聚會人數、氣氛和用戶偏好推薦合適的遊戲。Premium 遊戲需要訂閱才能遊玩。
`.trim()
}

/**
 * 根據人數推薦遊戲
 */
export function recommendGamesByPlayerCount(playerCount: number): GameInfo[] {
  return GAMES_LIST.filter(
    (game) => playerCount >= game.minPlayers && playerCount <= game.maxPlayers
  )
}

/**
 * 根據類別獲取遊戲
 */
export function getGamesByCategory(category: string): GameInfo[] {
  return GAMES_LIST.filter((game) => game.category.includes(category))
}

/**
 * 獲取免費遊戲
 */
export function getFreeGames(): GameInfo[] {
  return GAMES_LIST.filter((game) => !game.isPremium)
}

/**
 * 獲取 Premium 遊戲
 */
export function getPremiumGames(): GameInfo[] {
  return GAMES_LIST.filter((game) => game.isPremium)
}
