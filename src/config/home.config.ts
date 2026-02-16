/**
 * Phase 2 Tasks 21-25：Hero A/B 副標 — 「派對救星」定位
 * variant 0 = 長版副標，variant 1 = 短版「30 秒開始」
 */
export const HERO_SUBTITLE_VARIANTS: [string, string] = [
  '你的 AI 派對救星 — 30 秒選遊戲、配酒款、排流程，嗨翻全場。',
  '30 秒搞定你的派對 — AI 選遊戲、出題、配樂，不用再煩惱。',
]

/** E33–E37：Hero 入場動畫延遲（秒），可配置 */
export const HERO_ANIMATION_DELAYS = {
  logo: 0.2,
  title1: 0.15,
  title2: 0.35,
  subtitle: 0.6,
  cta: 0.75,
  scrollIndicator: 1,
} as const

/** H35：Testimonials 輪播自動播放間隔（ms），可配置 */
export const HOME_TESTIMONIALS_INTERVAL_MS = 5000

/** H34：安全與信任區文案可配置（品牌） */
export const HOME_TRUST_COPY = {
  label: '安全與信任',
  items: ['安全加密付款', '隨時取消', '隱私保護'] as const,
}

/** H41：用戶頭像區字母可配置（社會認證） */
export const HOME_AVATAR_LETTERS = ['A', 'K', 'V', 'D', 'J', 'M', 'L', 'C'] as const

/** H56：Core Features 標籤可配置（品牌） */
export const HOME_FEATURES_LABEL = 'Core Features'

/** F50：Footer 飲酒提醒文案可配置（合規） */
export const FOOTER_DRINK_NOTE = '未滿 18 歲請勿飲酒 · 飲酒過量有害健康'
export const FOOTER_DRINK_NOTE_BOTTOM = '飲酒過量有害健康'

/** R2-095：合作夥伴 Logo 區塊 — 名稱可配置，icon 由 HomePartnerMarquee 對應 */
export const PARTNER_NAMES = ['Wine', 'Cheers', 'Bar', 'Party', 'Learn', 'Chat'] as const

/** Phase 2 Tasks 22-25：Bento 四卡文案 — 派對救星定位 */
export const BENTO_CARDS = [
  { id: 'quiz' as const, title: '靈魂酒測', description: '30 秒 AI 精準推薦你的命定酒款，破冰神器。', badge: '最受歡迎' },
  { id: 'games' as const, title: '派對遊樂場', description: '50+ 遊戲一鍵開玩 — 真心話、國王杯、劇本殺，不喝酒也能嗨。', badge: '🔥' },
  { id: 'script-murder' as const, title: '酒局劇本殺', description: '4–8 人秘密角色、投票、懲罰，選劇本開房即玩。', badge: '新' },
  { id: 'assistant' as const, title: 'AI 派對幫手', description: '幫你排流程、出題、配酒，派對主持零壓力。', badge: undefined },
  { id: 'learn' as const, title: '品酒學院', description: '從入門到進階，輕鬆學會品酒，派對上秀一波。', badge: undefined },
] as const
