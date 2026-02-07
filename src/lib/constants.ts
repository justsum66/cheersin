/**
 * G195 常量集中管理
 * 應用級常數、key 前綴、預設值
 */

export const APP_NAME = 'Cheersin'
export const APP_DOMAIN = 'cheersin.app'

/** localStorage 前綴，與既有 key 一致 */
export const STORAGE_PREFIX = 'cheersin_'

/** 常用 localStorage keys（與各頁面一致） */
export const STORAGE_KEYS = {
  CHAT_HISTORY: 'cheersin_assistant_history',
  WISHLIST: 'cheersin_wishlist',
  TASTE_PREFERENCES: 'cheersin_taste_preferences',
  LEARN_PROGRESS: 'cheersin_learn_progress',
  GAMES_STATS: 'cheersin_games_played',
  QUIZ_LAST_RESULT: 'quiz-last-result',
} as const

/** 預設分頁標題 */
export const DEFAULT_TITLE = 'Cheersin | 探索你的靈魂之酒'

/** 預設 meta 描述 */
export const DEFAULT_DESCRIPTION = 'Cheersin — 你的 AI 派對靈魂伴侶。靈魂酒測、選遊戲、問酒款、品酒學院，一站滿足。'

/** EXPERT_60 P1：社會認證數字動態化 — 可由 env NEXT_PUBLIC_SOCIAL_PROOF_COUNT 覆寫，後端可改為 API */
export const SOCIAL_PROOF_USER_COUNT = typeof process.env.NEXT_PUBLIC_SOCIAL_PROOF_COUNT !== 'undefined'
  ? Math.max(0, parseInt(process.env.NEXT_PUBLIC_SOCIAL_PROOF_COUNT, 10) || 12000)
  : 12000

/** API 預設逾時（ms） */
export const API_TIMEOUT_MS = 30000

/** 防抖預設延遲（ms） */
export const DEBOUNCE_DELAY_MS = 300

/** 節流預設間隔（ms） */
export const THROTTLE_INTERVAL_MS = 200
