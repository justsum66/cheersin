/**
 * Design Tokens - Single Source of Truth (Application-Level)
 * U001: Consolidated color, spacing, typography, and animation tokens
 * 
 * This file serves as the central design system configuration
 * All UI components should reference these tokens instead of hardcoded values
 * 
 * NOTE: Tailwind theme tokens are in @/lib/design-tokens (themeExtend).
 * This file contains richer tokens (animations, a11y, zIndex) for runtime use.
 */

// ============================================
// COLOR TOKENS
// ============================================
// P3 任務 41：色板註解 — 用途與使用情境供設計/開發對照
// primary: CTA 按鈕、連結、焦點環、進度條、品牌強調
// secondary: 香檳金點綴、徽章、次要強調
// accent: VIP/進階功能、遊戲分類、次要 CTA

export const colors = {
  // Brand Colors
  brand: {
    primary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#8B0000', // Deep Wine Red
      600: '#7a0000',
      700: '#6b0000',
      800: '#5c0000',
      900: '#4d0000',
      950: '#2a0000',
    },
    secondary: {
      50: '#fdf8ed',
      100: '#f9eecd',
      200: '#f3dc9e',
      300: '#ecc96d',
      400: '#e5b83d',
      500: '#D4AF37', // Champagne Gold
      600: '#b8942e',
      700: '#967826',
      800: '#745c1e',
      900: '#524016',
      950: '#30240d',
    },
    accent: {
      500: '#8A2BE2', // Blue Violet
      600: '#7c3aed',
      700: '#6d28d9',
    },
  },

  // Semantic Colors — 表單/API 錯誤、成功狀態、警告提示
  semantic: {
    error: {
      DEFAULT: '#b91c1c',
      light: '#fecaca',
    },
    success: {
      DEFAULT: '#047857',
      light: '#a7f3d0',
    },
    warning: {
      DEFAULT: '#c2410c',
      light: '#fed7aa',
    },
  },

  // Background Colors — 全站漸層起訖、深色區塊
  background: {
    start: 'rgb(26, 10, 46)', // #1a0a2e
    end: 'rgb(10, 10, 10)', // #0a0a0a
    dark: 'rgb(10, 10, 15)', // #0a0a0f
  },

  // Text Colors (with opacity) — 正文、副標、弱化、裝飾用
  text: {
    primary: 'rgb(255, 255, 255)',
    secondary: 'rgba(255, 255, 255, 0.8)', // Increased from 0.7 for better contrast
    muted: 'rgba(255, 255, 255, 0.6)',     // Increased from 0.5 for better contrast
    subtle: 'rgba(255, 255, 255, 0.4)',    // Increased from 0.3 for better contrast
  },
} as const

// ============================================
// SPACING TOKENS (8px Grid System)
// ============================================
// P3 任務 42：主要 section/gap 使用 8 的倍數或本 token；2 = 8px 為基礎單位

export const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px - Base unit
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
} as const

// ============================================
// TYPOGRAPHY TOKENS
// ============================================

export const typography = {
  // Font Sizes (reduced from 11 to 8 core sizes)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },

  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    bold: 700,
  },

  // Line Heights
  lineHeight: {
    tight: 1.25,
    body: 1.6,
    relaxed: 1.75,
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.02em',
    normal: '0.01em',
    wide: '0.02em',
    /** P3 完美像素：標題字距 */
    heading: '-0.025em',
    headingSm: '-0.02em',
  },

  // P3 完美像素：正文行高與 placeholder 對比
  fineTuning: {
    bodyLineHeight: 1.65,
    placeholderOpacity: 0.38,
  },
} as const

// ============================================
// BORDER RADIUS TOKENS
// ============================================

export const borderRadius = {
  sm: '0.5rem',   // 8px
  md: '0.75rem',  // 12px
  lg: '1rem',     // 16px
  xl: '1.5rem',   // 24px
  full: '9999px',
} as const

// ============================================
// SHADOW TOKENS (5-level Elevation System)
// ============================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 24px -2px rgba(139, 0, 0, 0.12), 0 0 0 1px rgba(212, 175, 55, 0.08)',
  lg: '0 12px 40px -12px rgba(139, 0, 0, 0.2), 0 0 0 1px rgba(212, 175, 55, 0.12)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

  // Semantic shadows
  glow: {
    primary: '0 0 28px rgba(139, 0, 0, 0.35)',
    secondary: '0 0 24px rgba(212, 175, 55, 0.35)',
  },
} as const

// ============================================
// ANIMATION TOKENS
// ============================================
// P3 任務 43：全站過渡與微交互時長由此匯出，避免 magic number；PageTransition/Toast/FAQ 等引用

export const animations = {
  // Durations：fast 微交互、base 一般過渡、slow 較長反饋
  duration: {
    fast: '0.15s',
    base: '0.3s',
    slow: '0.5s',
  },

  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    brand: 'cubic-bezier(0.32, 0.72, 0, 1)', // Custom brand easing
  },

  // P3 完美像素：微交互時長（NNG 黃金法則、審查採用值）
  microInteractions: {
    primaryHoverMs: 200,
    focusRingMs: 200,
    linkTransitionMs: 200,
    btnPulseDuration: '2.8s',
    gradientDuration: '7s',
    skeletonShimmerDuration: '1.5s',
    loadingSpinDuration: '0.8s',
  },
} as const

// ============================================
// BREAKPOINTS
// ============================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ============================================
// Z-INDEX SCALE
// ============================================

export const zIndex = {
  background: -1,
  base: 0,
  dropdown: 50,
  nav: 100,
  modal: 200,
  toast: 300,
} as const

// ============================================
// ACCESSIBILITY
// ============================================

export const a11y = {
  // Minimum touch target size (WCAG 2.5.5)
  minTouchTarget: '44px',

  // Focus ring
  focusRing: {
    width: '2px',
    offset: '2px',
    color: 'rgba(139, 0, 0, 0.6)',
  },
} as const

// ============================================
// EXPORT ALL TOKENS
// ============================================
// 任務 68：RTL 預留 — 關鍵區塊可改用 margin-inline-start、padding-inline、inset-inline 等邏輯屬性，未來 dir="rtl" 時版面不亂

export const designTokens = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animations,
  breakpoints,
  zIndex,
  a11y,
} as const

export type DesignTokens = typeof designTokens

// ============================================
// CLEAN-026: Re-export Tailwind theme tokens for convenience
// ============================================
export { themeExtend } from '@/lib/design-tokens'

// Re-export unified animation variants
export {
  fadeIn,
  fadeInUp,
  fadeInDown,
  slideUp,
  scaleIn,
  staggerContainer,
  staggerItem,
  modalOverlay,
  modalContent,
  buttonHover,
  buttonTap,
  cardHover,
} from '@/lib/animation-variants'
