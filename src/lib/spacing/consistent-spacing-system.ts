/**
 * Task 2.04: 間距系統標準化
 * 一致的設計尺度和響應式間距系統
 * 
 * 建立 8px 網格系統，確保所有組件的間距完全一致
 */

// ============================================
// 8px 網格系統 (空間比例)
// ============================================

export const SPACING_SCALE = {
  // 原子單位 - 8px 基礎網格
  '0': '0',        // 0px
  '0.5': '0.125rem', // 2px (0.25 個網格)
  '1': '0.25rem',  // 4px (0.5 個網格)
  '2': '0.5rem',   // 8px (1 個網格) - 基礎單位
  '3': '0.75rem',  // 12px (1.5 個網格)
  '4': '1rem',     // 16px (2 個網格)
  '5': '1.25rem',  // 20px (2.5 個網格)
  '6': '1.5rem',   // 24px (3 個網格)
  '7': '1.75rem',  // 28px (3.5 個網格)
  '8': '2rem',     // 32px (4 個網格)
  '9': '2.25rem',  // 36px (4.5 個網格)
  '10': '2.5rem',  // 40px (5 個網格)
  '12': '3rem',    // 48px (6 個網格)
  '14': '3.5rem',  // 56px (7 個網格)
  '16': '4rem',    // 64px (8 個網格)
  '20': '5rem',    // 80px (10 個網格)
  '24': '6rem',    // 96px (12 個網格)
  '28': '7rem',    // 112px (14 個網格)
  '32': '8rem',    // 128px (16 個網格)
  '36': '9rem',    // 144px (18 個網格)
  '40': '10rem',   // 160px (20 個網格)
  '48': '12rem',   // 192px (24 個網格)
  '56': '14rem',   // 224px (28 個網格)
  '64': '16rem',   // 256px (32 個網格)
} as const

// ============================================
// 響應式間距系統
// ============================================

export const RESPONSIVE_SPACING = {
  // 桌面斷點時的間距倍數
  desktopMultiplier: 1.25, // 桌面間距增加 25%
  
  // 平板斷點時的間距倍數
  tabletMultiplier: 1.1,   // 平板間距增加 10%
  
  // 手機斷點時使用基礎間距
  mobileMultiplier: 1,     // 手機使用 100%
  
  // 生成響應式間距值
  getResponsiveValue: (baseValue: keyof typeof SPACING_SCALE) => {
    const baseSpacing = SPACING_SCALE[baseValue]
    return {
      mobile: baseSpacing,
      tablet: `calc(${baseSpacing} * 1.1)`,
      desktop: `calc(${baseSpacing} * 1.25)`,
    }
  },
} as const

// ============================================
// 語意化間距類別
// ============================================

export const SEMANTIC_SPACING = {
  // 容器內距
  container: {
    xs: SPACING_SCALE[2],    // 8px - 緊湊容器
    sm: SPACING_SCALE[4],    // 16px - 小容器
    md: SPACING_SCALE[6],    // 24px - 標準容器
    lg: SPACING_SCALE[8],    // 32px - 大容器
    xl: SPACING_SCALE[12],   // 48px - 超大容器
  },
  
  // 元件間距
  element: {
    xs: SPACING_SCALE[1],    // 4px - 微小間距
    sm: SPACING_SCALE[2],    // 8px - 小間距
    md: SPACING_SCALE[4],    // 16px - 標準間距
    lg: SPACING_SCALE[6],    // 24px - 大間距
    xl: SPACING_SCALE[8],    // 32px - 超大間距
  },
  
  // 區塊間距
  section: {
    sm: SPACING_SCALE[8],    // 32px - 小區塊
    md: SPACING_SCALE[12],   // 48px - 標準區塊
    lg: SPACING_SCALE[16],   // 64px - 大區塊
    xl: SPACING_SCALE[24],   // 96px - 超大區塊
  },
  
  // 按鈕內距
  button: {
    xs: `${SPACING_SCALE[1]} ${SPACING_SCALE[2]}`,  // 4px 8px
    sm: `${SPACING_SCALE[2]} ${SPACING_SCALE[4]}`,  // 8px 16px
    md: `${SPACING_SCALE[3]} ${SPACING_SCALE[6]}`,  // 12px 24px
    lg: `${SPACING_SCALE[4]} ${SPACING_SCALE[8]}`,  // 16px 32px
    xl: `${SPACING_SCALE[5]} ${SPACING_SCALE[10]}`, // 20px 40px
  },
  
  // 卡片內距
  card: {
    sm: SPACING_SCALE[4],    // 16px
    md: SPACING_SCALE[6],    // 24px
    lg: SPACING_SCALE[8],    // 32px
  },
} as const

// ============================================
// 間距工具函數
// ============================================

/**
 * 將像素值轉換為網格單位
 */
export const pxToGrid = (pixels: number): number => {
  return pixels / 8 // 8px 為一個網格單位
}

/**
 * 將網格單位轉換為像素值
 */
export const gridToPx = (gridUnits: number): number => {
  return gridUnits * 8
}

/**
 * 驗證間距值是否符合網格系統
 */
export const validateSpacing = (value: string): boolean => {
  // 檢查是否為有效的 rem 值
  const remValue = parseFloat(value)
  if (isNaN(remValue)) return false
  
  // 轉換為像素並檢查是否為 8 的倍數
  const pixels = remValue * 16 // 假設 1rem = 16px
  return pixels % 8 === 0
}

/**
 * 生成網格對齊的間距值
 */
export const createGridAlignedSpacing = (pixels: number): string => {
  const gridUnits = Math.round(pixels / 8)
  return `${gridUnits * 0.25}rem` // 1 網格單位 = 0.25rem
}

// ============================================
// 響應式間距工具
// ============================================

export const RESPONSIVE_SPACING_UTILS = {
  // 生成響應式 padding 類別
  padding: {
    all: (size: keyof typeof SPACING_SCALE) => ({
      padding: SPACING_SCALE[size],
      '@media (min-width: 768px)': {
        padding: `calc(${SPACING_SCALE[size]} * 1.1)`,
      },
      '@media (min-width: 1024px)': {
        padding: `calc(${SPACING_SCALE[size]} * 1.25)`,
      },
    }),
    
    x: (size: keyof typeof SPACING_SCALE) => ({
      paddingLeft: SPACING_SCALE[size],
      paddingRight: SPACING_SCALE[size],
      '@media (min-width: 768px)': {
        paddingLeft: `calc(${SPACING_SCALE[size]} * 1.1)`,
        paddingRight: `calc(${SPACING_SCALE[size]} * 1.1)`,
      },
      '@media (min-width: 1024px)': {
        paddingLeft: `calc(${SPACING_SCALE[size]} * 1.25)`,
        paddingRight: `calc(${SPACING_SCALE[size]} * 1.25)`,
      },
    }),
    
    y: (size: keyof typeof SPACING_SCALE) => ({
      paddingTop: SPACING_SCALE[size],
      paddingBottom: SPACING_SCALE[size],
      '@media (min-width: 768px)': {
        paddingTop: `calc(${SPACING_SCALE[size]} * 1.1)`,
        paddingBottom: `calc(${SPACING_SCALE[size]} * 1.1)`,
      },
      '@media (min-width: 1024px)': {
        paddingTop: `calc(${SPACING_SCALE[size]} * 1.25)`,
        paddingBottom: `calc(${SPACING_SCALE[size]} * 1.25)`,
      },
    }),
  },
  
  // 生成響應式 margin 類別
  margin: {
    all: (size: keyof typeof SPACING_SCALE) => ({
      margin: SPACING_SCALE[size],
      '@media (min-width: 768px)': {
        margin: `calc(${SPACING_SCALE[size]} * 1.1)`,
      },
      '@media (min-width: 1024px)': {
        margin: `calc(${SPACING_SCALE[size]} * 1.25)`,
      },
    }),
    
    x: (size: keyof typeof SPACING_SCALE) => ({
      marginLeft: SPACING_SCALE[size],
      marginRight: SPACING_SCALE[size],
      '@media (min-width: 768px)': {
        marginLeft: `calc(${SPACING_SCALE[size]} * 1.1)`,
        marginRight: `calc(${SPACING_SCALE[size]} * 1.1)`,
      },
      '@media (min-width: 1024px)': {
        marginLeft: `calc(${SPACING_SCALE[size]} * 1.25)`,
        marginRight: `calc(${SPACING_SCALE[size]} * 1.25)`,
      },
    }),
    
    y: (size: keyof typeof SPACING_SCALE) => ({
      marginTop: SPACING_SCALE[size],
      marginBottom: SPACING_SCALE[size],
      '@media (min-width: 768px)': {
        marginTop: `calc(${SPACING_SCALE[size]} * 1.1)`,
        marginBottom: `calc(${SPACING_SCALE[size]} * 1.1)`,
      },
      '@media (min-width: 1024px)': {
        marginTop: `calc(${SPACING_SCALE[size]} * 1.25)`,
        marginBottom: `calc(${SPACING_SCALE[size]} * 1.25)`,
      },
    }),
  },
  
  // 生成 gap 類別
  gap: (size: keyof typeof SPACING_SCALE) => ({
    gap: SPACING_SCALE[size],
    '@media (min-width: 768px)': {
      gap: `calc(${SPACING_SCALE[size]} * 1.1)`,
    },
    '@media (min-width: 1024px)': {
      gap: `calc(${SPACING_SCALE[size]} * 1.25)`,
    },
  }),
} as const

// ============================================
// 間距系統整合
// ============================================

export const CONSISTENT_SPACING_SYSTEM = {
  scale: SPACING_SCALE,
  responsive: RESPONSIVE_SPACING,
  semantic: SEMANTIC_SPACING,
  utils: {
    pxToGrid,
    gridToPx,
    validateSpacing,
    createGridAlignedSpacing,
  },
  responsiveUtils: RESPONSIVE_SPACING_UTILS,
} as const

// ============================================
// 型別定義
// ============================================

export type SpacingScale = keyof typeof SPACING_SCALE
export type SemanticSpacingType = keyof typeof SEMANTIC_SPACING
export type ResponsiveBreakpoint = 'mobile' | 'tablet' | 'desktop'

export default CONSISTENT_SPACING_SYSTEM