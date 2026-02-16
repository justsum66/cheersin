/**
 * 遊戲 UI 常量
 */

/** 遊戲卡片玩家數 i18n 鍵 */
export const GAMES_CARD_PLAYERS_I18N_KEY = 'games.card.players'

/** 遊戲難度標籤 i18n 鍵 */
export const GAMES_DIFFICULTY_I18N_KEYS = {
  easy: 'games.difficulty.easy',
  medium: 'games.difficulty.medium',
  hard: 'games.difficulty.hard',
} as const

/** 遊戲類別 i18n 鍵 */
export const GAMES_CATEGORY_I18N_KEYS = {
  drinking: 'games.category.drinking',
  party: 'games.category.party',
  skill: 'games.category.skill',
  cards: 'games.category.cards',
  team: 'games.category.team',
} as const

/** 遊戲狀態 i18n 鍵 */
export const GAMES_STATUS_I18N_KEYS = {
  waiting: 'games.status.waiting',
  playing: 'games.status.playing',
  paused: 'games.status.paused',
  finished: 'games.status.finished',
} as const

/** 遊戲動作按鈕 i18n 鍵 */
export const GAMES_ACTION_I18N_KEYS = {
  start: 'games.action.start',
  pause: 'games.action.pause',
  resume: 'games.action.resume',
  end: 'games.action.end',
  restart: 'games.action.restart',
  next: 'games.action.next',
  skip: 'games.action.skip',
} as const

/** 預設遊戲顏色 */
export const DEFAULT_GAME_COLORS = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#FFE66D',
  background: '#2C3E50',
} as const

/** 遊戲卡片尺寸 */
export const GAME_CARD_SIZES = {
  sm: { width: 200, height: 280 },
  md: { width: 280, height: 360 },
  lg: { width: 360, height: 440 },
} as const

/** 動畫時長 (毫秒) */
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
} as const
