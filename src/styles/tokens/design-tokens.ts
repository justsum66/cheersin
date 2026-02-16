/**
 * Task 2.01: 元件庫標準化
 * 統一的設計 tokens - 讓所有元件都有相同的 DNA
 */

// 🎨 色彩系統 (就像調色盤一樣統一)
export const COLORS = {
  // 品牌主色 - 奢華金黑配色
  brand: {
    primary: '#D4AF37',    // 金黃色 - 品牌主色
    secondary: '#E5E4E2',  // 白金 - 輔助色
    accent: '#FF2E63',     // 紅色 - 緊急按鈕專用
  },
  
  // 背景層次 - 從純黑到深灰的漸層
  background: {
    primary: '#000000',    // 純黑 OLED 背景
    secondary: '#0A0A0A',  // 深灰背景
    tertiary: '#121212',   // 中灰背景
    card: '#1A1A1A',       // 卡片背景
  },
  
  // 文字層次 - 白色的漸層變化
  text: {
    primary: '#FFFFFF',     // 純白主要文字
    secondary: '#FFFFFFB3', // 70% 透明度次級文字
    tertiary: '#FFFFFF66',  // 40% 透明度提示文字
    disabled: '#FFFFFF33',  // 20% 透明度停用文字
  },
  
  // 語意色彩 - 狀態指示燈
  semantic: {
    success: '#00FF9D',     // 成功綠
    error: '#FF4D4D',       // 錯誤紅
    warning: '#FFB700',     // 警告黃
    info: '#4D9EFF',        // 資訊藍
  },
  
  // 玻璃擬態效果 - 現代 UI 必備
  glass: {
    light: '#FFFFFF0D',     // 5% 透明度
    medium: '#FFFFFF1A',    // 10% 透明度
    heavy: '#FFFFFF33',     // 20% 透明度
    border: '#FFFFFF26',    // 15% 邊框透明度
  }
} as const

// 📏 間距系統 (8px 網格系統 - 像素完美主義)
export const SPACING = {
  // 原子間距 - 最小單位
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  
  // 語意間距 - 用途導向
  container: '1rem',      // 容器內距
  section: '4rem',        // 區塊間距
  card: '1rem',          // 卡片內距
  element: '0.5rem',     // 元件間距
} as const

// 🔠 字型系統 (響應式排版 - 讓文字會呼吸)
export const TYPOGRAPHY = {
  // 字型家族 - 萬國語言支援
  family: {
    display: 'var(--font-display)',  // 標題字型
    body: 'var(--font-sans)',        // 內文字型
    mono: 'ui-monospace, monospace', // 等寬字型
  },
  
  // 字級 scale - 完美比例系統
  size: {
    xs: '0.75rem',      // 12px - 微小文字
    sm: '0.875rem',     // 14px - 小文字
    base: '1rem',       // 16px - 基礎文字
    lg: '1.125rem',     // 18px - 大文字
    xl: '1.25rem',      // 20px - XL 文字
    '2xl': '1.5rem',    // 24px - 2XL 文字
    '3xl': '1.875rem',  // 30px - 3XL 文字
    '4xl': '2.25rem',   // 36px - 4XL 文字
    '5xl': '3rem',      // 48px - 5XL 文字
    hero: 'clamp(2.5rem, 5vw + 1rem, 3.5rem)', // 響應式英雄標題
  },
  
  // 字重系統 - 粗細層次
  weight: {
    thin: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
  
  // 行高系統 - 閱讀舒適度
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.65',
  },
  
  // 字距調整 - 精緻排版
  tracking: {
    tight: '-0.02em',
    normal: '0.01em',
    wide: '0.05em',
  }
} as const

// 🎯 圓角系統 (一致性是王道)
export const RADIUS = {
  none: '0',
  sm: '0.25rem',    // 4px - 微圓角
  md: '0.5rem',     // 8px - 標準圓角
  lg: '0.75rem',    // 12px - 大圓角
  xl: '1rem',       // 16px - XL 圓角
  full: '9999px',   // 橢圓形
} as const

// 🌊 陰影系統 (立體感製造機)
export const SHADOW = {
  // 輕量陰影
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  // 標準陰影
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  // 重陰影
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  // 極重陰影
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  // 內陰影
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  // 玻璃效果陰影
  glass: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
} as const

// ⚡ 動畫系統 (流暢度控制器)
export const MOTION = {
  // 持續時間
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slowest: '1000ms',
  },
  
  // 緩動函數
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // 延遲時間
  delay: {
    none: '0ms',
    short: '100ms',
    medium: '200ms',
    long: '300ms',
  }
} as const

// 📱 響應式斷點 (裝置適配專家)
export const BREAKPOINTS = {
  xs: '480px',    // 手機直立
  sm: '640px',    // 手機橫向
  md: '768px',    // 平板
  lg: '1024px',   // 筆電
  xl: '1280px',   // 桌機
  '2xl': '1536px', // 大螢幕
} as const

// 🎯 Z 軸層級 (層疊秩序維護者)
export const Z_INDEX = {
  auto: 'auto',
  base: '0',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modalBackdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
  toast: '1080',
  max: '9999',
} as const

// 🎪 玻璃擬態特效 (現代 UI 必備)
export const GLASSMORPHISM = {
  backdrop: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  background: 'rgba(26, 10, 46, 0.7)',
  shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
} as const

// 🎯 按鈕標準化 (互動元件規範)
export const BUTTON = {
  padding: {
    sm: '0.5rem 1rem',
    md: '0.75rem 1.5rem',
    lg: '1rem 2rem',
  },
  height: {
    sm: '2rem',
    md: '2.5rem',
    lg: '3rem',
  },
  fontSize: {
    sm: TYPOGRAPHY.size.sm,
    md: TYPOGRAPHY.size.base,
    lg: TYPOGRAPHY.size.lg,
  }
} as const

// 🎨 設計 tokens 整合輸出
export const DESIGN_TOKENS = {
  colors: COLORS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  radius: RADIUS,
  shadow: SHADOW,
  motion: MOTION,
  breakpoints: BREAKPOINTS,
  zIndex: Z_INDEX,
  glassmorphism: GLASSMORPHISM,
  button: BUTTON,
} as const

// 🎯 型別定義 (TypeScript 安全網)
export type ColorToken = keyof typeof COLORS
export type SpacingToken = keyof typeof SPACING
export type TypographyToken = keyof typeof TYPOGRAPHY
export type RadiusToken = keyof typeof RADIUS
export type ShadowToken = keyof typeof SHADOW
export type BreakpointToken = keyof typeof BREAKPOINTS
export type ZIndexToken = keyof typeof Z_INDEX

export default DESIGN_TOKENS