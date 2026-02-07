/**
 * H04 / E46：首頁 Hero A/B 副標與文案可配置
 * P0-001：圍繞「你的 AI 派對靈魂伴侶」價值主張
 * variant 0 = 長版副標，variant 1 = 短版「30 秒命定酒款」
 */
export const HERO_SUBTITLE_VARIANTS: [string, string] = [
  '你的 AI 派對靈魂伴侶 — 靈魂酒測、選遊戲、問酒款，從測驗到派對一站滿足。',
  '30 秒找到你的命定酒款，AI 陪你選遊戲、問酒款。',
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

/** B29/B50：Bento 四卡文案可配置（品牌）；P0-001 圍繞 AI 派對靈魂伴侶 */
export const BENTO_CARDS = [
  { id: 'quiz' as const, title: '靈魂酒測', description: '30 秒測出你的命定酒款，AI 精準推薦。', badge: '最受歡迎' },
  { id: 'games' as const, title: '派對遊樂場', description: '你的 AI 派對靈魂伴侶 — 真心話、國王杯；懲罰可自訂，不飲酒也能玩。', badge: undefined },
  { id: 'assistant' as const, title: 'AI 侍酒師', description: '幫你選遊戲、依人數推薦、問酒款搭餐，派對組織者。', badge: undefined },
  { id: 'learn' as const, title: '品酒學院', description: '系統化課程，從入門到進階，輕鬆學。', badge: undefined },
] as const
