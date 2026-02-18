/**
 * Design System Tokens - 統一匯出
 * 整合所有設計 tokens 的單一入口點
 */

// 匯入所有 tokens
import { DESIGN_COLORS } from './colors'
import { DESIGN_SPACING } from './spacing'
import { DESIGN_ELEVATION } from './elevation'
import { DESIGN_GLASS } from './glass'

// ============================================
// 完整設計系統
// ============================================
export const DESIGN_SYSTEM = {
  colors: DESIGN_COLORS,
  spacing: DESIGN_SPACING,
  elevation: DESIGN_ELEVATION,
  glass: DESIGN_GLASS,
} as const

// ============================================
// 便利的解構匯出
// ============================================

// 顏色系統
export const {
  brand: BRAND_COLORS,
  background: BACKGROUND_COLORS,
  text: TEXT_COLORS,
  state: STATE_COLORS,
  interactive: INTERACTIVE_COLORS,
  border: BORDER_COLORS,
  button: BUTTON_COLORS,
  form: FORM_COLORS,
  card: CARD_COLORS,
  navigation: NAVIGATION_COLORS,
} = DESIGN_COLORS

// 間距系統
export const {
  grid: GRID_UNITS,
  semantic: SEMANTIC_SPACING,
  container: CONTAINER_SPACING,
  component: COMPONENT_SPACING,
  typography: TYPOGRAPHY_SPACING,
  responsive: RESPONSIVE_SPACING,
  special: SPECIAL_SPACING,
  ratios: SPACING_RATIOS,
} = DESIGN_SPACING

// 層級系統
export const {
  levels: ELEVATION_LEVELS,
  semantic: SEMANTIC_ELEVATION,
  zIndex: Z_INDEX_LEVELS,
  zIndexMap: ELEVATION_Z_INDEX_MAP,
  transitions: ELEVATION_TRANSITIONS,
  classes: ELEVATION_CLASSES,
  responsive: ELEVATION_RESPONSIVE,
} = DESIGN_ELEVATION

// 玻璃擬態系統
export const {
  intensity: GLASS_INTENSITY,
  blur: BACKDROP_BLUR_VALUES,
  opacity: OPACITY_VALUES,
  semantic: SEMANTIC_GLASS,
  states: GLASS_STATES,
  classes: GLASS_CLASSES,
  responsive: GLASS_RESPONSIVE,
} = DESIGN_GLASS

// ============================================
// 類型定義
// ============================================
export type DesignSystem = typeof DESIGN_SYSTEM
export type { DesignColors } from './colors'
export type { DesignSpacing } from './spacing'
export type { DesignElevation } from './elevation'
export type { DesignGlass } from './glass'

// ============================================
// 工具函數
// ============================================

/**
 * 驗證設計 token 是否存在
 */
export const validateToken = (category: keyof DesignSystem, token: string): boolean => {
  return token in DESIGN_SYSTEM[category]
}

/**
 * 取得設計 token 值
 */
export const getToken = <T extends keyof DesignSystem>(
  category: T,
  token: string
): DesignSystem[T][keyof DesignSystem[T]] | undefined => {
  const tokens = DESIGN_SYSTEM[category] as Record<string, any>
  return tokens[token]
}

/**
 * 取得所有可用的 token 名稱
 */
export const getTokenNames = <T extends keyof DesignSystem>(category: T): string[] => {
  return Object.keys(DESIGN_SYSTEM[category] as Record<string, any>)
}

// ============================================
// Tailwind 設定整合
// ============================================

/**
 * 產生 Tailwind theme 配置
 */
export const getTailwindTheme = () => ({
  colors: {
    ...BRAND_COLORS,
    background: BACKGROUND_COLORS,
    text: TEXT_COLORS,
    state: STATE_COLORS,
    border: BORDER_COLORS,
  },
  spacing: {
    ...GRID_UNITS,
    ...SEMANTIC_SPACING,
  },
  boxShadow: Object.fromEntries(
    Object.entries(ELEVATION_LEVELS).map(([key, value]) => [key, value.shadow])
  ),
  backdropBlur: BACKDROP_BLUR_VALUES,
  zIndex: Z_INDEX_LEVELS,
})

export default DESIGN_SYSTEM