/**
 * G195 常量集中管理
 * 應用級常數、key 前綴、預設值
 */

export const APP_NAME = 'Cheersin'
export const APP_DOMAIN = 'cheersin.app'

/** localStorage 前綴，與既有 key 一致 */
export const STORAGE_PREFIX = 'cheersin_'

/** R2-252：localStorage 版本，用於遷移或清除舊格式；讀寫時可附於 key 或單獨存 */
export const STORAGE_VERSION = 1

/** 常用 localStorage keys（與各頁面一致）；P2-236 集中管理，新代碼請由此引用 */
export const STORAGE_KEYS = {
  CHAT_HISTORY: 'cheersin_assistant_history',
  WISHLIST: 'cheersin_wishlist',
  TASTE_PREFERENCES: 'cheersin_taste_preferences',
  LEARN_PROGRESS: 'cheersin_learn_progress',
  GAMES_STATS: 'cheersin_games_played',
  QUIZ_LAST_RESULT: 'quiz-last-result',
  /** 遊戲大廳：玩家名單、房間加入狀態、最近玩過、教學完成；R2-134 自訂播放列表 */
  GAMES_PLAYERS: 'cheersin_games_players',
  ROOM_JOINED: 'cheersin_room_joined',
  RECENT_GAMES: 'cheersin_games_recent',
  TUTORIAL_DONE: 'cheersin_games_tutorial_done',
  GAMES_PLAYLISTS: 'cheersin_games_playlists',
  /** 助理頁：聊天歷史、反饋記錄 */
  ASSISTANT_FEEDBACK: 'cheersin_assistant_feedback',
  /** 測驗進度 */
  QUIZ_PROGRESS: 'quiz-progress',
} as const

/** API 路徑集中；P2-236 新代碼請由此引用 */
export const API_ROUTES = {
  ANALYTICS: '/api/analytics',
  CHAT: '/api/chat',
  REPORT: '/api/report',
  SUBSCRIPTION: '/api/subscription',
  HEALTH: '/api/health',
} as const

/** 預設分頁標題 */
export const DEFAULT_TITLE = 'Cheersin | 探索你的靈魂之酒'

/** 預設 meta 描述 */
export const DEFAULT_DESCRIPTION = 'Cheersin — 你的 AI 派對靈魂伴侶。靈魂酒測、選遊戲、問酒款、品酒學院，一站滿足。'

/** EXPERT_60 P1：社會認證數字動態化 — 可由 env NEXT_PUBLIC_SOCIAL_PROOF_COUNT 覆寫，後端可改為 API */
export const SOCIAL_PROOF_USER_COUNT = typeof process.env.NEXT_PUBLIC_SOCIAL_PROOF_COUNT !== 'undefined'
  ? Math.max(0, parseInt(process.env.NEXT_PUBLIC_SOCIAL_PROOF_COUNT, 10) || 12000)
  : 12000

/** R2-195：免費方案自訂題目數量上限（各遊戲共用） */
export const FREE_CUSTOM_QUESTIONS_LIMIT = 5

/** API 預設逾時（ms） */
export const API_TIMEOUT_MS = 30000

/** 防抖預設延遲（ms） */
export const DEBOUNCE_DELAY_MS = 300

/** 節流預設間隔（ms） */
export const THROTTLE_INTERVAL_MS = 200

/** 網紅優化 #2：官方 Hashtag，供分享與 UGC 引導 */
export const OFFICIAL_HASHTAG = 'Cheersin派對'
