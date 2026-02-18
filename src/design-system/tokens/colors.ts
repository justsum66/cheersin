/**
 * Design System Colors - 語意化顏色系統
 * 任務 1: 建立語意化背景色系統
 * 任務 2: 重構文字色階層
 * 任務 3: 建立狀態色語意命名
 * 任務 4: 建立互動色系統
 * 任務 5: 建立邊框色語意系統
 */

// ============================================
// 基礎品牌色 (Brand Foundation)
// ============================================
export const BRAND_COLORS = {
  // 主要品牌色 - 深紅酒色
  primary: {
    50: '#fff0f3',
    100: '#ffe3e8',
    200: '#ffc7d4',
    300: '#ff9bb0',
    400: '#ff6485',
    500: '#ff2e63', // 主要品牌色
    600: '#db0f46',
    700: '#b80031',
    800: '#99052d',
    900: '#82082b',
    950: '#470013',
  },
  
  // 次要品牌色 - 香檳金色
  secondary: {
    50: '#fbf8e6',
    100: '#f5edc6',
    200: '#ebda95',
    300: '#e0c25e',
    400: '#d4af37', // 主要香檳金
    500: '#b89128',
    600: '#936e1c',
    700: '#765318',
    800: '#61421a',
    900: '#523719',
    950: '#2d1c0a',
  },
  
  // 強調色 - 紫色 (VIP/特殊功能)
  accent: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6', // 主要強調色
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
} as const

// ============================================
// 語意化背景色系統 (Semantic Background Colors)
// ============================================
export const BACKGROUND_COLORS = {
  // 基礎層級
  surface: {
    primary: 'rgb(10, 10, 15)',    // 主要背景 - 深色
    secondary: 'rgb(15, 15, 20)',  // 次要背景 - 稍亮
    tertiary: 'rgb(20, 20, 25)',   // 第三層背景 - 更亮
    inverted: 'rgb(255, 255, 255)', // 反轉背景 - 純白
  },
  
  // 容器層級
  container: {
    card: 'rgba(255, 255, 255, 0.03)',     // 卡片背景
    panel: 'rgba(255, 255, 255, 0.05)',    // 面板背景
    modal: 'rgba(26, 10, 46, 0.95)',       // 模態框背景
    popover: 'rgba(10, 10, 15, 0.95)',     // 彈出框背景
  },
  
  // 疊加層級
  overlay: {
    light: 'rgba(0, 0, 0, 0.3)',   // 輕疊加
    medium: 'rgba(0, 0, 0, 0.5)',  // 中疊加
    heavy: 'rgba(0, 0, 0, 0.7)',   // 重疊加
    backdrop: 'rgba(0, 0, 0, 0.8)', // 背景疊加
  },
  
  // 特殊用途
  special: {
    highlight: 'rgba(212, 175, 55, 0.1)',  // 突顯背景
    selection: 'rgba(139, 0, 0, 0.2)',     // 選取背景
    disabled: 'rgba(255, 255, 255, 0.05)', // 停用背景
    skeleton: 'rgba(255, 255, 255, 0.08)', // 骨架屏背景
  },
} as const

// ============================================
// 語意化文字色階層 (Semantic Text Colors)
// ============================================
export const TEXT_COLORS = {
  // 基礎層級
  primary: 'rgb(255, 255, 255)',      // 主要文字 - 純白
  secondary: 'rgba(255, 255, 255, 0.8)', // 次要文字 - 80% 透明度
  tertiary: 'rgba(255, 255, 255, 0.6)',  // 第三層文字 - 60% 透明度
  quaternary: 'rgba(255, 255, 255, 0.4)', // 第四層文字 - 40% 透明度
  disabled: 'rgba(255, 255, 255, 0.3)',   // 停用文字 - 30% 透明度
  inverted: 'rgb(10, 10, 15)',           // 反轉文字 - 深色
  
  // 語意狀態
  success: '#00ff9d',     // 成功文字
  error: '#ff4d4d',       // 錯誤文字
  warning: '#ffb700',     // 警告文字
  info: '#08d9d6',        // 資訊文字
  brand: '#d4af37',       // 品牌文字
  
  // 特殊用途
  link: '#ff6485',        // 連結文字
  code: '#08d9d6',        // 程式碼文字
  placeholder: 'rgba(255, 255, 255, 0.38)', // 佔位文字
} as const

// ============================================
// 狀態色語意系統 (Semantic State Colors)
// ============================================
export const STATE_COLORS = {
  // 成功狀態
  success: {
    DEFAULT: '#00ff9d',
    light: '#ccffe6',
    dark: '#00cc7a',
    background: 'rgba(0, 255, 157, 0.1)',
    border: 'rgba(0, 255, 157, 0.3)',
  },
  
  // 錯誤狀態
  error: {
    DEFAULT: '#ff4d4d',
    light: '#ffcccc',
    dark: '#cc3d3d',
    background: 'rgba(255, 77, 77, 0.1)',
    border: 'rgba(255, 77, 77, 0.3)',
  },
  
  // 警告狀態
  warning: {
    DEFAULT: '#ffb700',
    light: '#ffeab3',
    dark: '#cc9200',
    background: 'rgba(255, 183, 0, 0.1)',
    border: 'rgba(255, 183, 0, 0.3)',
  },
  
  // 資訊狀態
  info: {
    DEFAULT: '#08d9d6',
    light: '#ccf7f6',
    dark: '#06b0ac',
    background: 'rgba(8, 217, 214, 0.1)',
    border: 'rgba(8, 217, 214, 0.3)',
  },
  
  // 中性狀態
  neutral: {
    DEFAULT: '#7e7b95',
    light: '#dcdbe6',
    dark: '#636079',
    background: 'rgba(126, 123, 149, 0.1)',
    border: 'rgba(126, 123, 149, 0.3)',
  },
} as const

// ============================================
// 互動色系統 (Interactive Colors)
// ============================================
export const INTERACTIVE_COLORS = {
  // 滑鼠懸停
  hover: {
    primary: 'rgba(255, 46, 99, 0.1)',     // 主要懸停
    secondary: 'rgba(212, 175, 55, 0.1)',  // 次要懸停
    accent: 'rgba(139, 92, 246, 0.1)',     // 強調懸停
    surface: 'rgba(255, 255, 255, 0.05)',  // 表面懸停
  },
  
  // 激活狀態
  active: {
    primary: 'rgba(255, 46, 99, 0.2)',     // 主要激活
    secondary: 'rgba(212, 175, 55, 0.2)',  // 次要激活
    accent: 'rgba(139, 92, 246, 0.2)',     // 強調激活
    surface: 'rgba(255, 255, 255, 0.1)',   // 表面激活
  },
  
  // 焦點狀態
  focus: {
    primary: 'rgba(255, 46, 99, 0.4)',     // 主要焦點
    secondary: 'rgba(212, 175, 55, 0.4)',  // 次要焦點
    accent: 'rgba(139, 92, 246, 0.4)',     // 強調焦點
    ring: 'rgba(212, 175, 55, 0.6)',       // 焦點環
  },
  
  // 選取狀態
  selected: {
    primary: 'rgba(255, 46, 99, 0.15)',    // 主要選取
    secondary: 'rgba(212, 175, 55, 0.15)', // 次要選取
    accent: 'rgba(139, 92, 246, 0.15)',    // 強調選取
  },
} as const

// ============================================
// 邊框色語意系統 (Semantic Border Colors)
// ============================================
export const BORDER_COLORS = {
  // 基礎邊框
  subtle: 'rgba(255, 255, 255, 0.08)',    // 細微邊框
  normal: 'rgba(255, 255, 255, 0.15)',    // 標準邊框
  strong: 'rgba(255, 255, 255, 0.25)',    // 強調邊框
  heavy: 'rgba(255, 255, 255, 0.4)',      // 重邊框
  
  // 語意邊框
  accent: 'rgba(212, 175, 55, 0.4)',      // 強調邊框
  success: 'rgba(0, 255, 157, 0.4)',      // 成功邊框
  error: 'rgba(255, 77, 77, 0.4)',        // 錯誤邊框
  warning: 'rgba(255, 183, 0, 0.4)',      // 警告邊框
  info: 'rgba(8, 217, 214, 0.4)',         // 資訊邊框
  
  // 特殊邊框
  divider: 'rgba(255, 255, 255, 0.1)',    // 分隔線
  input: 'rgba(255, 255, 255, 0.2)',      // 輸入框邊框
  focus: 'rgba(212, 175, 55, 0.8)',       // 焦點邊框
  disabled: 'rgba(255, 255, 255, 0.1)',   // 停用邊框
} as const

// ============================================
// 按鈕狀態色系統 (Button State Colors)
// ============================================
export const BUTTON_COLORS = {
  // 主要按鈕
  primary: {
    DEFAULT: '#ff2e63',
    hover: '#ff4d7a',
    active: '#e6154d',
    focus: '#ff2e63',
    disabled: 'rgba(255, 46, 99, 0.4)',
    text: '#ffffff',
  },
  
  // 次要按鈕
  secondary: {
    DEFAULT: 'rgba(255, 255, 255, 0.1)',
    hover: 'rgba(255, 255, 255, 0.15)',
    active: 'rgba(255, 255, 255, 0.2)',
    focus: 'rgba(212, 175, 55, 0.3)',
    disabled: 'rgba(255, 255, 255, 0.05)',
    text: '#ffffff',
  },
  
  // 幽靈按鈕
  ghost: {
    DEFAULT: 'transparent',
    hover: 'rgba(255, 255, 255, 0.05)',
    active: 'rgba(255, 255, 255, 0.1)',
    focus: 'rgba(212, 175, 55, 0.2)',
    disabled: 'transparent',
    text: '#ffffff',
  },
  
  // 強調按鈕
  accent: {
    DEFAULT: '#8b5cf6',
    hover: '#9f6df7',
    active: '#7c3aed',
    focus: '#8b5cf6',
    disabled: 'rgba(139, 92, 246, 0.4)',
    text: '#ffffff',
  },
} as const

// ============================================
// 表單元件色系統 (Form Element Colors)
// ============================================
export const FORM_COLORS = {
  // 輸入框背景
  input: {
    background: 'rgba(255, 255, 255, 0.05)',
    backgroundHover: 'rgba(255, 255, 255, 0.08)',
    backgroundFocus: 'rgba(255, 255, 255, 0.08)',
    backgroundDisabled: 'rgba(255, 255, 255, 0.03)',
  },
  
  // 輸入框邊框
  border: {
    DEFAULT: 'rgba(255, 255, 255, 0.15)',
    hover: 'rgba(255, 255, 255, 0.25)',
    focus: 'rgba(212, 175, 55, 0.6)',
    error: 'rgba(255, 77, 77, 0.6)',
    success: 'rgba(0, 255, 157, 0.6)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  },
  
  // 文字顏色
  text: {
    DEFAULT: 'rgb(255, 255, 255)',
    placeholder: 'rgba(255, 255, 255, 0.4)',
    disabled: 'rgba(255, 255, 255, 0.3)',
  },
} as const

// ============================================
// 卡片層級色系統 (Card Level Colors)
// ============================================
export const CARD_COLORS = {
  // 表面層級
  surface: 'rgba(255, 255, 255, 0.03)',   // 基礎卡片
  elevated: 'rgba(255, 255, 255, 0.05)',  // 抬升卡片
  floating: 'rgba(255, 255, 255, 0.08)',  // 懸浮卡片
  prominent: 'rgba(255, 255, 255, 0.12)',  // 突出卡片
  
  // 特殊卡片
  brand: 'rgba(212, 175, 55, 0.1)',       // 品牌卡片
  success: 'rgba(0, 255, 157, 0.1)',      // 成功卡片
  error: 'rgba(255, 77, 77, 0.1)',        // 錯誤卡片
  warning: 'rgba(255, 183, 0, 0.1)',      // 警告卡片
} as const

// ============================================
// 導航元件色系統 (Navigation Colors)
// ============================================
export const NAVIGATION_COLORS = {
  // 背景
  background: 'rgba(10, 10, 15, 0.95)',
  backgroundHover: 'rgba(255, 255, 255, 0.05)',
  backgroundActive: 'rgba(212, 175, 55, 0.15)',
  
  // 文字
  text: 'rgba(255, 255, 255, 0.8)',
  textHover: 'rgba(255, 255, 255, 0.95)',
  textActive: '#d4af37',
  textDisabled: 'rgba(255, 255, 255, 0.4)',
  
  // 邊框
  border: 'rgba(255, 255, 255, 0.1)',
  borderActive: 'rgba(212, 175, 55, 0.5)',
} as const

// ============================================
// 完整顏色系統匯出
// ============================================
export const DESIGN_COLORS = {
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
} as const

export type DesignColors = typeof DESIGN_COLORS