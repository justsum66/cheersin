/**
 * Task 2.02: 字型系統強化
 * 響應式排版系統和一致性 scale
 * 
 * 建立企業級的響應式字型系統，確保在所有裝置上都有完美的閱讀體驗
 */

// ============================================
// 字型家族配置
// ============================================

export const FONT_FAMILIES = {
  // 品牌標題字型
  display: [
    'var(--font-display)',
    'Playfair Display',
    'Georgia',
    'serif'
  ].join(', '),

  // 主要內文字型
  body: [
    'var(--font-sans)',
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif'
  ].join(', '),

  // 等寬字型
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace'
  ].join(', '),

  // 中文支援字型
  chinese: [
    'var(--font-noto)',
    'Noto Sans TC',
    'Microsoft JhengHei',
    'PingFang TC',
    'Heiti TC',
    'sans-serif'
  ].join(', '),
} as const

// ============================================
// 字型尺寸系統 (rem 單位)
// ============================================

export const FONT_SIZES = {
  // 標題尺寸
  h1: {
    mobile: '2rem',    // 32px
    tablet: '2.5rem',  // 40px
    desktop: '3rem',   // 48px
  },
  h2: {
    mobile: '1.75rem', // 28px
    tablet: '2rem',    // 32px
    desktop: '2.5rem', // 40px
  },
  h3: {
    mobile: '1.5rem',  // 24px
    tablet: '1.75rem', // 28px
    desktop: '2rem',   // 32px
  },
  h4: {
    mobile: '1.25rem', // 20px
    tablet: '1.5rem',  // 24px
    desktop: '1.75rem', // 28px
  },
  h5: {
    mobile: '1.125rem', // 18px
    tablet: '1.25rem',  // 20px
    desktop: '1.5rem',  // 24px
  },
  h6: {
    mobile: '1rem',    // 16px
    tablet: '1.125rem', // 18px
    desktop: '1.25rem', // 20px
  },

  // 內文尺寸
  bodyLarge: {
    mobile: '1.125rem', // 18px
    tablet: '1.25rem',  // 20px
    desktop: '1.375rem', // 22px
  },
  body: {
    mobile: '1rem',    // 16px
    tablet: '1.125rem', // 18px
    desktop: '1.25rem', // 20px
  },
  bodySmall: {
    mobile: '0.875rem', // 14px
    tablet: '1rem',     // 16px
    desktop: '1.125rem', // 18px
  },
  caption: {
    mobile: '0.75rem',  // 12px
    tablet: '0.875rem', // 14px
    desktop: '1rem',    // 16px
  },

  // 功能性文字
  buttonLarge: {
    mobile: '1rem',    // 16px
    tablet: '1.125rem', // 18px
    desktop: '1.25rem', // 20px
  },
  button: {
    mobile: '0.875rem', // 14px
    tablet: '1rem',     // 16px
    desktop: '1.125rem', // 18px
  },
  buttonSmall: {
    mobile: '0.75rem',  // 12px
    tablet: '0.875rem', // 14px
    desktop: '1rem',    // 16px
  },
  label: {
    mobile: '0.75rem',  // 12px
    tablet: '0.875rem', // 14px
    desktop: '1rem',    // 16px
  },
  overline: {
    mobile: '0.625rem', // 10px
    tablet: '0.75rem',  // 12px
    desktop: '0.875rem', // 14px
  },
} as const

// ============================================
// 字重系統
// ============================================

export const FONT_WEIGHTS = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const

// ============================================
// 行高系統
// ============================================

export const LINE_HEIGHTS = {
  tight: 1.2,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.6,
  loose: 1.75,
} as const

// ============================================
// 字距系統
// ============================================

export const LETTER_SPACINGS = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const

// ============================================
// 響應式工具函數
// ============================================

/**
 * 生成響應式字型 CSS 類別
 */
export const generateResponsiveTypography = () => {
  const cssRules: string[] = []
  
  // 生成標題類別
  Object.entries(FONT_SIZES).forEach(([key, sizes]) => {
    cssRules.push(`
      .text-${key} {
        font-size: ${sizes.mobile};
      }
      
      @media (min-width: 768px) {
        .text-${key} {
          font-size: ${sizes.tablet};
        }
      }
      
      @media (min-width: 1024px) {
        .text-${key} {
          font-size: ${sizes.desktop};
        }
      }
    `)
  })
  
  return cssRules.join('\n')
}

/**
 * 獲取響應式字型大小
 */
export const getResponsiveFontSize = (
  sizeKey: keyof typeof FONT_SIZES,
  breakpoint: 'mobile' | 'tablet' | 'desktop' = 'mobile'
) => {
  return FONT_SIZES[sizeKey][breakpoint]
}

/**
 * 獲取字型家族
 */
export const getFontFamily = (family: keyof typeof FONT_FAMILIES) => {
  return FONT_FAMILIES[family]
}

// ============================================
// 可訪問性配置
// ============================================

export const TYPOGRAPHY_ACCESSIBILITY = {
  // 最小可讀字級 (WCAG 2.1 建議)
  minimumReadableSize: '16px',
  
  // 文字對比度要求
  contrastRatios: {
    normalText: 4.5, // 4.5:1 for normal text (AA)
    largeText: 3,    // 3:1 for large text (AA)
    enhanced: 7,     // 7:1 for enhanced contrast (AAA)
  },
  
  // 文字縮放支援
  textResizeSupport: {
    minimumScale: 1,   // 100%
    maximumScale: 2.5, // 250%
  },
  
  // 行高要求
  lineHeightRequirements: {
    minimum: 1.5,  // 最小行高
    recommended: 1.6, // 推薦行高
  },
} as const

// ============================================
// 字型載入優化
// ============================================

export const FONT_LOADING = {
  // 字型顯示策略
  display: {
    swap: 'swap',      // 立即顯示備用字型，字型載入後替換
    block: 'block',    // 短暫阻塞顯示直到字型載入
    fallback: 'fallback', // 短暫阻塞後顯示備用字型
    optional: 'optional', // 如果載入時間過長則使用備用字型
  },
  
  // 預載入關鍵字型
  preload: {
    primary: FONT_FAMILIES.display,
    secondary: FONT_FAMILIES.body,
  },
} as const

// ============================================
// 實用工具類別
// ============================================

export const TYPOGRAPHY_CLASSES = {
  // 標題類別
  headings: {
    h1: 'text-h1 font-display font-bold tracking-tight',
    h2: 'text-h2 font-display font-bold tracking-tight',
    h3: 'text-h3 font-display font-semibold tracking-tight',
    h4: 'text-h4 font-display font-semibold tracking-tight',
    h5: 'text-h5 font-body font-medium',
    h6: 'text-h6 font-body font-medium',
  },
  
  // 內文類別
  body: {
    large: 'text-bodyLarge font-body font-normal leading-relaxed',
    base: 'text-body font-body font-normal leading-relaxed',
    small: 'text-bodySmall font-body font-normal leading-normal',
    caption: 'text-caption font-body font-normal leading-tight',
  },
  
  // 功能文字類別
  functional: {
    buttonLarge: 'text-buttonLarge font-body font-semibold tracking-wide',
    button: 'text-button font-body font-semibold tracking-wide',
    buttonSmall: 'text-buttonSmall font-body font-semibold tracking-wider',
    label: 'text-label font-body font-medium tracking-wide',
    overline: 'text-overline font-body font-bold tracking-widest uppercase',
  },
} as const

// ============================================
// 型別定義
// ============================================

export type FontFamily = keyof typeof FONT_FAMILIES
export type FontSize = keyof typeof FONT_SIZES
export type FontWeight = keyof typeof FONT_WEIGHTS
export type LineHeight = keyof typeof LINE_HEIGHTS
export type LetterSpacing = keyof typeof LETTER_SPACINGS
export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

export default {
  FONT_FAMILIES,
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  LETTER_SPACINGS,
  TYPOGRAPHY_ACCESSIBILITY,
  FONT_LOADING,
  TYPOGRAPHY_CLASSES,
  generateResponsiveTypography,
  getResponsiveFontSize,
  getFontFamily,
}