/**
 * Design System Spacing - 完整間距系統
 * 任務 16: 建立完整的 8px 網格間距 scale (0-32 網格單位)
 * 任務 17: 建立語意化間距命名
 * 任務 18: 建立容器間距系統
 * 任務 19: 建立元件間距系統
 * 任務 20: 建立文字間距系統
 */

// ============================================
// 8px 網格系統基礎 (8px Grid System Foundation)
// ============================================
// 1 網格單位 = 8px = 0.5rem
export const GRID_UNITS = {
  0: '0rem',        // 0px
  0.5: '0.25rem',   // 4px
  1: '0.5rem',      // 8px - 基礎單位
  1.5: '0.75rem',   // 12px
  2: '1rem',        // 16px
  2.5: '1.25rem',   // 20px
  3: '1.5rem',      // 24px
  3.5: '1.75rem',   // 28px
  4: '2rem',        // 32px
  5: '2.5rem',      // 40px
  6: '3rem',        // 48px
  7: '3.5rem',      // 56px
  8: '4rem',        // 64px
  9: '4.5rem',      // 72px
  10: '5rem',       // 80px
  11: '5.5rem',     // 88px
  12: '6rem',       // 96px
  14: '7rem',       // 112px
  16: '8rem',       // 128px
  20: '10rem',      // 160px
  24: '12rem',      // 192px
  28: '14rem',      // 224px
  32: '16rem',      // 256px
} as const

// ============================================
// 語意化間距命名系統 (Semantic Spacing Names)
// ============================================
export const SEMANTIC_SPACING = {
  // 原子間距 - 最小單位
  'space-3xs': GRID_UNITS[0.5],  // 4px
  'space-2xs': GRID_UNITS[1],    // 8px
  'space-xs': GRID_UNITS[1.5],   // 12px
  'space-sm': GRID_UNITS[2],     // 16px
  'space-md': GRID_UNITS[3],     // 24px
  'space-lg': GRID_UNITS[4],     // 32px
  'space-xl': GRID_UNITS[5],     // 40px
  'space-2xl': GRID_UNITS[6],    // 48px
  'space-3xl': GRID_UNITS[8],    // 64px
  'space-4xl': GRID_UNITS[10],   // 80px
  'space-5xl': GRID_UNITS[12],   // 96px
  'space-6xl': GRID_UNITS[16],   // 128px
  'space-7xl': GRID_UNITS[20],   // 160px
  'space-8xl': GRID_UNITS[24],   // 192px
  'space-9xl': GRID_UNITS[32],   // 256px
  
  // 特殊值
  'space-0': GRID_UNITS[0],      // 0px
  'space-1': GRID_UNITS[0.5],    // 4px
  'space-2': GRID_UNITS[1],      // 8px
  'space-4': GRID_UNITS[2],      // 16px
  'space-6': GRID_UNITS[3],      // 24px
  'space-8': GRID_UNITS[4],      // 32px
  'space-10': GRID_UNITS[5],     // 40px
  'space-12': GRID_UNITS[6],     // 48px
  'space-16': GRID_UNITS[8],     // 64px
  'space-20': GRID_UNITS[10],    // 80px
  'space-24': GRID_UNITS[12],    // 96px
  'space-32': GRID_UNITS[16],    // 128px
  'space-40': GRID_UNITS[20],    // 160px
  'space-48': GRID_UNITS[24],    // 192px
  'space-64': GRID_UNITS[32],    // 256px
} as const

// ============================================
// 容器間距系統 (Container Spacing System)
// ============================================
export const CONTAINER_SPACING = {
  // 內距系統
  padding: {
    'container-xs': GRID_UNITS[2],     // 16px
    'container-sm': GRID_UNITS[3],     // 24px
    'container-md': GRID_UNITS[4],     // 32px
    'container-lg': GRID_UNITS[5],     // 40px
    'container-xl': GRID_UNITS[6],     // 48px
    'container-2xl': GRID_UNITS[8],    // 64px
    'container-3xl': GRID_UNITS[10],   // 80px
    'container-fluid': GRID_UNITS[3],  // 24px (流體容器)
  },
  
  // 外距系統
  margin: {
    'section-sm': GRID_UNITS[4],       // 32px
    'section-md': GRID_UNITS[6],       // 48px
    'section-lg': GRID_UNITS[8],       // 64px
    'section-xl': GRID_UNITS[10],      // 80px
    'section-2xl': GRID_UNITS[12],     // 96px
  },
  
  // 卡片間距
  card: {
    'card-padding-xs': GRID_UNITS[1.5],  // 12px
    'card-padding-sm': GRID_UNITS[2],    // 16px
    'card-padding-md': GRID_UNITS[3],    // 24px
    'card-padding-lg': GRID_UNITS[4],    // 32px
    'card-padding-xl': GRID_UNITS[5],    // 40px
    'card-gap-xs': GRID_UNITS[1],        // 8px
    'card-gap-sm': GRID_UNITS[1.5],      // 12px
    'card-gap-md': GRID_UNITS[2],        // 16px
    'card-gap-lg': GRID_UNITS[3],        // 24px
  },
} as const

// ============================================
// 元件間距系統 (Component Spacing System)
// ============================================
export const COMPONENT_SPACING = {
  // 元件內距
  element: {
    'element-padding-xs': GRID_UNITS[1],     // 8px
    'element-padding-sm': GRID_UNITS[1.5],   // 12px
    'element-padding-md': GRID_UNITS[2],     // 16px
    'element-padding-lg': GRID_UNITS[3],     // 24px
    'element-padding-xl': GRID_UNITS[4],     // 32px
  },
  
  // 元件間距
  gap: {
    'gap-3xs': GRID_UNITS[0.5],  // 4px
    'gap-2xs': GRID_UNITS[1],    // 8px
    'gap-xs': GRID_UNITS[1.5],   // 12px
    'gap-sm': GRID_UNITS[2],     // 16px
    'gap-md': GRID_UNITS[3],     // 24px
    'gap-lg': GRID_UNITS[4],     // 32px
    'gap-xl': GRID_UNITS[5],     // 40px
    'gap-2xl': GRID_UNITS[6],    // 48px
    'gap-3xl': GRID_UNITS[8],    // 64px
  },
  
  // 群組間距
  group: {
    'group-padding-xs': GRID_UNITS[1],     // 8px
    'group-padding-sm': GRID_UNITS[2],     // 16px
    'group-padding-md': GRID_UNITS[3],     // 24px
    'group-padding-lg': GRID_UNITS[4],     // 32px
    'group-padding-xl': GRID_UNITS[5],     // 40px
    'group-gap-xs': GRID_UNITS[1],         // 8px
    'group-gap-sm': GRID_UNITS[1.5],       // 12px
    'group-gap-md': GRID_UNITS[2],         // 16px
    'group-gap-lg': GRID_UNITS[3],         // 24px
    'group-gap-xl': GRID_UNITS[4],         // 32px
  },
  
  // 導航間距
  navigation: {
    'nav-item-padding': GRID_UNITS[2],     // 16px
    'nav-item-gap': GRID_UNITS[1],         // 8px
    'nav-section-gap': GRID_UNITS[3],      // 24px
    'nav-container-padding': GRID_UNITS[3], // 24px
  },
} as const

// ============================================
// 文字間距系統 (Typography Spacing System)
// ============================================
export const TYPOGRAPHY_SPACING = {
  // 字距 (Letter Spacing)
  tracking: {
    'tracking-tighter': '-0.05em',
    'tracking-tight': '-0.025em',
    'tracking-normal': '0em',
    'tracking-wide': '0.025em',
    'tracking-wider': '0.05em',
    'tracking-widest': '0.1em',
    
    // 語意化字距
    'tracking-heading': '-0.02em',    // 標題字距
    'tracking-body': '0.01em',        // 正文字距
    'tracking-caption': '0.02em',     // 說明字距
    'tracking-uppercase': '0.05em',   // 大寫字距
  },
  
  // 行高 (Line Height)
  lineHeight: {
    'leading-none': '1',
    'leading-tight': '1.25',
    'leading-snug': '1.375',
    'leading-normal': '1.5',
    'leading-relaxed': '1.625',
    'leading-loose': '2',
    
    // 語意化行高
    'leading-body': '1.65',      // 正文行高
    'leading-heading': '1.2',    // 標題行高
    'leading-caption': '1.4',    // 說明行高
    'leading-code': '1.5',       // 程式碼行高
  },
  
  // 段落間距
  paragraph: {
    'paragraph-spacing-tight': '0.8em',
    'paragraph-spacing-normal': '1em',
    'paragraph-spacing-comfortable': '1.2em',
    'paragraph-spacing-spacious': '1.5em',
  },
  
  // 文字對齊間距
  alignment: {
    'text-indent': GRID_UNITS[3],      // 24px 首行縮排
    'list-padding': GRID_UNITS[2],     // 16px 列表內距
    'blockquote-padding': GRID_UNITS[4], // 32px 引用內距
  },
} as const

// ============================================
// 響應式間距系統 (Responsive Spacing System)
// ============================================
export const RESPONSIVE_SPACING = {
  // 移動端間距
  mobile: {
    'mobile-padding': GRID_UNITS[2],      // 16px
    'mobile-margin': GRID_UNITS[3],       // 24px
    'mobile-gap': GRID_UNITS[1.5],        // 12px
    'mobile-container': GRID_UNITS[2],    // 16px
  },
  
  // 平板間距
  tablet: {
    'tablet-padding': GRID_UNITS[3],      // 24px
    'tablet-margin': GRID_UNITS[4],       // 32px
    'tablet-gap': GRID_UNITS[2],          // 16px
    'tablet-container': GRID_UNITS[3],    // 24px
  },
  
  // 桌面端間距
  desktop: {
    'desktop-padding': GRID_UNITS[4],     // 32px
    'desktop-margin': GRID_UNITS[6],      // 48px
    'desktop-gap': GRID_UNITS[3],         // 24px
    'desktop-container': GRID_UNITS[4],   // 32px
  },
  
  // 大螢幕間距
  'desktop-xl': {
    'desktop-xl-padding': GRID_UNITS[5],  // 40px
    'desktop-xl-margin': GRID_UNITS[8],   // 64px
    'desktop-xl-gap': GRID_UNITS[4],      // 32px
    'desktop-xl-container': GRID_UNITS[5], // 40px
  },
} as const

// ============================================
// 特殊間距需求 (Special Spacing Requirements)
// ============================================
export const SPECIAL_SPACING = {
  // 安全區域間距 (Safe Area Insets)
  safeArea: {
    'safe-area-top': 'env(safe-area-inset-top)',
    'safe-area-right': 'env(safe-area-inset-right)',
    'safe-area-bottom': 'env(safe-area-inset-bottom)',
    'safe-area-left': 'env(safe-area-inset-left)',
  },
  
  // 觸控目標間距 (Touch Target)
  touch: {
    'touch-min': '44px',           // WCAG 2.5.5 最小觸控目標
    'touch-comfortable': '48px',   // 舒適觸控目標
    'touch-large': '56px',         // 大型觸控目標
  },
  
  // 可訪問性間距
  accessibility: {
    'a11y-focus-offset': GRID_UNITS[0.5],  // 4px 焦點偏移
    'a11y-min-height': '44px',             // 最小高度
    'a11y-min-width': '44px',              // 最小寬度
  },
  
  // 視覺間距
  visual: {
    'visual-balance': GRID_UNITS[2],       // 16px 視覺平衡
    'visual-hierarchy': GRID_UNITS[4],     // 32px 視覺層次
    'visual-separation': GRID_UNITS[6],    // 48px 視覺分隔
  },
} as const

// ============================================
// 間距比例系統 (Spacing Ratio System)
// 黃金比例: 1 : 1.5 : 2.25
// ============================================
export const SPACING_RATIOS = {
  scale: {
    base: GRID_UNITS[2],      // 16px (基礎單位)
    medium: GRID_UNITS[3],    // 24px (1.5x 基礎)
    large: '2.25rem',   // 36px (2.25x 基礎)
  },
  
  // 比例間距
  proportional: {
    'ratio-1': GRID_UNITS[2],     // 16px
    'ratio-1.5': GRID_UNITS[3],   // 24px
    'ratio-2': GRID_UNITS[4],     // 32px
    'ratio-2.5': GRID_UNITS[5],   // 40px
    'ratio-3': GRID_UNITS[6],     // 48px
    'ratio-4': GRID_UNITS[8],     // 64px
  },
} as const

// ============================================
// 間距驗證工具 (Spacing Validation)
// ============================================
export const validateSpacing = (value: string): boolean => {
  // 檢查是否為有效的 rem 值
  const remValue = parseFloat(value)
  if (isNaN(remValue)) return false
  
  // 轉換為像素並檢查是否為 8 的倍數
  const pixels = remValue * 16 // 假設 1rem = 16px
  return pixels % 8 === 0 || pixels === 0
}

export const pxToGrid = (pixels: number): number => {
  return pixels / 8 // 8px 為一個網格單位
}

export const gridToPx = (gridUnits: number): number => {
  return gridUnits * 8
}

// ============================================
// 完整間距系統匯出
// ============================================
export const DESIGN_SPACING = {
  grid: GRID_UNITS,
  semantic: SEMANTIC_SPACING,
  container: CONTAINER_SPACING,
  component: COMPONENT_SPACING,
  typography: TYPOGRAPHY_SPACING,
  responsive: RESPONSIVE_SPACING,
  special: SPECIAL_SPACING,
  ratios: SPACING_RATIOS,
  utils: {
    validate: validateSpacing,
    pxToGrid,
    gridToPx,
  },
} as const

export type DesignSpacing = typeof DESIGN_SPACING