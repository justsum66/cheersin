/**
 * Design System Elevation - 層級系統
 * 任務 28: 建立 8 層 elevation 系統 (surface to floating)
 * 任務 29: 建立對應的 shadow 變數
 * 任務 30: 建立 elevation 語意命名
 * 任務 31: 建立 elevation 與 z-index 的對應關係
 * 任務 32: 建立 elevation 動畫過渡效果
 */

// ============================================
// 8 層 Elevation 系統 (8-Level Elevation System)
// 從地面(surface)到懸浮(floating)的完整層級
// ============================================
export const ELEVATION_LEVELS = {
  // 地面層級 - 與背景同層
  ground: {
    level: 0,
    shadow: 'none',
    name: 'elevation-ground',
    description: '與背景同層，無陰影效果',
  },
  
  // 表面層級 - 輕微抬升
  surface: {
    level: 1,
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    name: 'elevation-surface',
    description: '輕微抬升，基礎陰影效果',
  },
  
  // 抬升層級 - 明顯抬升
  raised: {
    level: 2,
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    name: 'elevation-raised',
    description: '明顯抬升，中等陰影效果',
  },
  
  // 懸浮層級 - 較高懸浮
  elevated: {
    level: 3,
    shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    name: 'elevation-elevated',
    description: '較高懸浮，明顯陰影效果',
  },
  
  // 高懸浮層級 - 高度懸浮
  floating: {
    level: 4,
    shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    name: 'elevation-floating',
    description: '高度懸浮，強烈陰影效果',
  },
  
  // 懸停層級 - 最高懸浮
  hover: {
    level: 5,
    shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    name: 'elevation-hover',
    description: '最高懸浮，極強陰影效果',
  },
  
  // 品牌層級 - 品牌色陰影
  brand: {
    level: 6,
    shadow: '0 4px 24px -2px rgba(255, 46, 99, 0.12), 0 0 0 1px rgba(212, 175, 55, 0.08)',
    name: 'elevation-brand',
    description: '品牌色陰影，突顯品牌元素',
  },
  
  // 特殊層級 - 自定義陰影
  custom: {
    level: 7,
    shadow: '0 0 30px rgba(255, 46, 99, 0.3), 0 0 60px rgba(212, 175, 55, 0.2)',
    name: 'elevation-custom',
    description: '自定義陰影，特殊視覺效果',
  },
} as const

// ============================================
// 語意化 Elevation 命名 (Semantic Elevation Names)
// ============================================
export const SEMANTIC_ELEVATION = {
  // 卡片層級
  card: {
    DEFAULT: ELEVATION_LEVELS.surface.shadow,      // 基礎卡片
    hover: ELEVATION_LEVELS.raised.shadow,         // 懸停卡片
    selected: ELEVATION_LEVELS.elevated.shadow,    // 選取卡片
    featured: ELEVATION_LEVELS.floating.shadow,    // 特色卡片
  },
  
  // 導航層級
  navigation: {
    DEFAULT: ELEVATION_LEVELS.ground.shadow,       // 基礎導航
    sticky: ELEVATION_LEVELS.surface.shadow,       // 固定導航
    dropdown: ELEVATION_LEVELS.elevated.shadow,    // 下拉菜單
    modal: ELEVATION_LEVELS.floating.shadow,       // 模態框
  },
  
  // 表單層級
  form: {
    DEFAULT: ELEVATION_LEVELS.ground.shadow,       // 基礎表單
    field: ELEVATION_LEVELS.surface.shadow,        // 輸入欄位
    select: ELEVATION_LEVELS.raised.shadow,        // 選擇器
    popover: ELEVATION_LEVELS.elevated.shadow,     // 彈出框
  },
  
  // 按鈕層級
  button: {
    DEFAULT: ELEVATION_LEVELS.ground.shadow,       // 基礎按鈕
    raised: ELEVATION_LEVELS.surface.shadow,       // 抬升按鈕
    floating: ELEVATION_LEVELS.raised.shadow,      // 懸浮按鈕
    action: ELEVATION_LEVELS.elevated.shadow,      // 動作按鈕
  },
  
  // 特殊層級
  special: {
    notification: ELEVATION_LEVELS.floating.shadow, // 通知
    tooltip: ELEVATION_LEVELS.hover.shadow,         // 工具提示
    toast: ELEVATION_LEVELS.floating.shadow,        // 吐司
    dialog: ELEVATION_LEVELS.hover.shadow,          // 對話框
  },
} as const

// ============================================
// Z-Index 層級系統 (10 層 Z-Index System)
// ============================================
export const Z_INDEX_LEVELS = {
  // 背景層
  background: -1,
  base: 0,
  
  // 內容層
  content: 10,
  contentAbove: 20,
  
  // 元件層
  component: 30,
  componentAbove: 40,
  
  // 導航層
  navigation: 50,
  navigationAbove: 60,
  
  // 疊加層
  overlay: 70,
  overlayAbove: 80,
  
  // 模態層
  modal: 90,
  modalAbove: 100,
  
  // 最高層
  toast: 110,
  tooltip: 120,
} as const

// ============================================
// Elevation 與 Z-Index 對應關係
// ============================================
export const ELEVATION_Z_INDEX_MAP = {
  ground: Z_INDEX_LEVELS.base,
  surface: Z_INDEX_LEVELS.content,
  raised: Z_INDEX_LEVELS.component,
  elevated: Z_INDEX_LEVELS.navigation,
  floating: Z_INDEX_LEVELS.overlay,
  hover: Z_INDEX_LEVELS.modal,
  brand: Z_INDEX_LEVELS.toast,
  custom: Z_INDEX_LEVELS.tooltip,
} as const

// ============================================
// Elevation 動畫過渡效果
// ============================================
export const ELEVATION_TRANSITIONS = {
  // 基礎過渡
  base: 'box-shadow 0.2s ease-in-out',
  
  // 快速過渡
  fast: 'box-shadow 0.1s ease-out',
  
  // 慢速過渡
  slow: 'box-shadow 0.3s ease-in-out',
  
  // 彈性過渡
  spring: 'box-shadow 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // 漸變過渡
  smooth: 'box-shadow 0.25s ease',
  
  // 特殊過渡
  hover: 'box-shadow 0.15s ease-out',
  focus: 'box-shadow 0.2s ease-in-out',
  active: 'box-shadow 0.1s ease-in',
} as const

// ============================================
// Elevation 工具類 (Utility Classes)
// ============================================
export const ELEVATION_CLASSES = {
  // 基礎類別
  'elevation-ground': `shadow-none z-${ELEVATION_Z_INDEX_MAP.ground}`,
  'elevation-surface': `shadow-[${ELEVATION_LEVELS.surface.shadow}] z-${ELEVATION_Z_INDEX_MAP.surface}`,
  'elevation-raised': `shadow-[${ELEVATION_LEVELS.raised.shadow}] z-${ELEVATION_Z_INDEX_MAP.raised}`,
  'elevation-elevated': `shadow-[${ELEVATION_LEVELS.elevated.shadow}] z-${ELEVATION_Z_INDEX_MAP.elevated}`,
  'elevation-floating': `shadow-[${ELEVATION_LEVELS.floating.shadow}] z-${ELEVATION_Z_INDEX_MAP.floating}`,
  'elevation-hover': `shadow-[${ELEVATION_LEVELS.hover.shadow}] z-${ELEVATION_Z_INDEX_MAP.hover}`,
  'elevation-brand': `shadow-[${ELEVATION_LEVELS.brand.shadow}] z-${ELEVATION_Z_INDEX_MAP.brand}`,
  'elevation-custom': `shadow-[${ELEVATION_LEVELS.custom.shadow}] z-${ELEVATION_Z_INDEX_MAP.custom}`,
  
  // 語意類別
  'elevation-card': `shadow-[${SEMANTIC_ELEVATION.card.DEFAULT}]`,
  'elevation-card-hover': `shadow-[${SEMANTIC_ELEVATION.card.hover}]`,
  'elevation-nav': `shadow-[${SEMANTIC_ELEVATION.navigation.sticky}]`,
  'elevation-modal': `shadow-[${SEMANTIC_ELEVATION.navigation.modal}]`,
  'elevation-button': `shadow-[${SEMANTIC_ELEVATION.button.raised}]`,
  'elevation-toast': `shadow-[${SEMANTIC_ELEVATION.special.toast}]`,
} as const

// ============================================
// 響應式 Elevation
// ============================================
export const RESPONSIVE_ELEVATION = {
  // 移動端
  mobile: {
    card: ELEVATION_LEVELS.surface.shadow,
    nav: ELEVATION_LEVELS.surface.shadow,
    modal: ELEVATION_LEVELS.elevated.shadow,
  },
  
  // 平板
  tablet: {
    card: ELEVATION_LEVELS.raised.shadow,
    nav: ELEVATION_LEVELS.raised.shadow,
    modal: ELEVATION_LEVELS.floating.shadow,
  },
  
  // 桌面
  desktop: {
    card: ELEVATION_LEVELS.elevated.shadow,
    nav: ELEVATION_LEVELS.elevated.shadow,
    modal: ELEVATION_LEVELS.hover.shadow,
  },
} as const

// ============================================
// Elevation 驗證工具
// ============================================
export const validateElevation = (level: keyof typeof ELEVATION_LEVELS): boolean => {
  return level in ELEVATION_LEVELS
}

export const getElevationShadow = (level: keyof typeof ELEVATION_LEVELS): string => {
  return ELEVATION_LEVELS[level]?.shadow || 'none'
}

export const getElevationZIndex = (level: keyof typeof ELEVATION_LEVELS): number => {
  return ELEVATION_Z_INDEX_MAP[level] || 0
}

// ============================================
// 完整 Elevation 系統匯出
// ============================================
export const DESIGN_ELEVATION = {
  levels: ELEVATION_LEVELS,
  semantic: SEMANTIC_ELEVATION,
  zIndex: Z_INDEX_LEVELS,
  zIndexMap: ELEVATION_Z_INDEX_MAP,
  transitions: ELEVATION_TRANSITIONS,
  classes: ELEVATION_CLASSES,
  responsive: RESPONSIVE_ELEVATION,
  utils: {
    validate: validateElevation,
    getShadow: getElevationShadow,
    getZIndex: getElevationZIndex,
  },
} as const

export type DesignElevation = typeof DESIGN_ELEVATION