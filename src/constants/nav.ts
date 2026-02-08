/**
 * N10/N28/N29：Nav Bar 常數與型別 — 單一來源，供 Navigation 與測試使用
 */
import type { LucideIcon } from 'lucide-react'
import {
  Wine,
  Sparkles,
  Gamepad2,
  MessageCircle,
  GraduationCap,
} from 'lucide-react'

/** i18n key 對應 messages.nav.* */
export type NavKey = 'home' | 'quiz' | 'games' | 'assistant' | 'learn'

/** N13/N27：導出型別供元件與測試使用；label 由 i18n t(`nav.${navKey}`) 取得 */
export interface NavItem {
  href: string
  navKey: NavKey
  icon: LucideIcon
}

/** N10：導航項目（順序與桌面/行動一致，N19）；文案由 useTranslation t('nav.*') 提供 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/', navKey: 'home', icon: Wine },
  { href: '/quiz', navKey: 'quiz', icon: Sparkles },
  { href: '/games', navKey: 'games', icon: Gamepad2 },
  { href: '/assistant', navKey: 'assistant', icon: MessageCircle },
  { href: '/learn', navKey: 'learn', icon: GraduationCap },
]

/** N28：滾動閾值（px）— 超過則 nav 縮小、背景不透明 */
export const SCROLL_COMPACT_PX = 40
export const SCROLL_OPACITY_MAX_PX = 80

/** N21：z-index 常數 */
export const Z_NAV_TOP = 50
export const Z_NAV_BOTTOM = 40
export const Z_MOBILE_MENU = 40

/** N29：行動選單 id，供 aria-controls / aria-labelledby */
export const MOBILE_MENU_ID = 'mobile-nav-menu'

/** UX_LAYOUT_200 #65：行動選單展開動畫時長適中（ms） */
/** P2 任務 55：行動選單開合動畫 0.25–0.3s，與 design-tokens 一致 */
export const MOBILE_MENU_DURATION_MS = 300

/** N14：訂閱方案顯示文案 */
export const TIER_LABELS: Record<string, string> = {
  free: '免費方案',
  basic: 'Pro',
  premium: 'VIP',
}
export const getTierLabel = (tier: string | undefined): string =>
  TIER_LABELS[tier ?? 'free'] ?? '免費方案'

/** N14：行動選單 CTA 文案 */
export const CTA_UNLOCK_PRO = '解鎖 Pro 功能'

/** 最小觸控目標（px）— N17 */
export const MIN_TOUCH_TARGET_PX = 44
