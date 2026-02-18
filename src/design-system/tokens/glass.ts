/**
 * Design System Glassmorphism - 玻璃擬態系統
 * 任務 36: 建立 5 層玻璃擬態系統 (glass-subtle to glass-solid)
 * 任務 37: 統一 backdrop-blur 值 (4px, 8px, 16px, 24px, 32px)
 * 任務 38: 統一背景透明度值 (5%, 10%, 20%, 40%, 80%)
 * 任務 39: 統一邊框透明度值 (10%, 20%, 30%, 40%, 50%)
 * 任務 40: 建立玻璃擬態語意命名規則
 */

// ============================================
// 5 層玻璃擬態強度系統 (5-Level Glass Intensity)
// 從細微(subtle)到實心(solid)的完整梯度
// ============================================
export const GLASS_INTENSITY = {
  // 細微玻璃 - 最輕透明度
  subtle: {
    intensity: 'subtle',
    backgroundOpacity: 0.05,    // 5% 背景透明度
    borderOpacity: 0.1,         // 10% 邊框透明度
    backdropBlur: '4px',        // 輕模糊
    name: 'glass-subtle',
    description: '細微玻璃效果，輕透明度',
  },
  
  // 中等玻璃 - 標準透明度
  medium: {
    intensity: 'medium',
    backgroundOpacity: 0.1,     // 10% 背景透明度
    borderOpacity: 0.2,         // 20% 邊框透明度
    backdropBlur: '8px',        // 中模糊
    name: 'glass-medium',
    description: '中等玻璃效果，標準透明度',
  },
  
  // 強烈玻璃 - 高透明度
  strong: {
    intensity: 'strong',
    backgroundOpacity: 0.2,     // 20% 背景透明度
    borderOpacity: 0.3,         // 30% 邊框透明度
    backdropBlur: '16px',       // 強模糊
    name: 'glass-strong',
    description: '強烈玻璃效果，高透明度',
  },
  
  // 重玻璃 - 很高透明度
  heavy: {
    intensity: 'heavy',
    backgroundOpacity: 0.4,     // 40% 背景透明度
    borderOpacity: 0.4,         // 40% 邊框透明度
    backdropBlur: '24px',       // 很強模糊
    name: 'glass-heavy',
    description: '重玻璃效果，很高透明度',
  },
  
  // 實心玻璃 - 最高透明度
  solid: {
    intensity: 'solid',
    backgroundOpacity: 0.8,     // 80% 背景透明度
    borderOpacity: 0.5,         // 50% 邊框透明度
    backdropBlur: '32px',       // 最強模糊
    name: 'glass-solid',
    description: '實心玻璃效果，最高透明度',
  },
} as const

// ============================================
// 統一的 Backdrop-Blur 值系統
// ============================================
export const BACKDROP_BLUR_VALUES = {
  xs: '4px',    // 最輕模糊
  sm: '8px',    // 輕模糊
  md: '16px',   // 中模糊
  lg: '24px',   // 強模糊
  xl: '32px',   // 最強模糊
} as const

// ============================================
// 統一的透明度值系統
// ============================================
export const OPACITY_VALUES = {
  // 背景透明度
  background: {
    lightest: 0.03,   // 3%
    lighter: 0.05,    // 5%
    light: 0.1,       // 10%
    medium: 0.2,      // 20%
    heavy: 0.4,       // 40%
    heavier: 0.6,     // 60%
    heaviest: 0.8,    // 80%
  },
  
  // 邊框透明度
  border: {
    lightest: 0.08,   // 8%
    lighter: 0.1,     // 10%
    light: 0.15,      // 15%
    medium: 0.25,     // 25%
    heavy: 0.35,      // 35%
    heavier: 0.45,    // 45%
    heaviest: 0.6,    // 60%
  },
  
  // 文字透明度
  text: {
    lightest: 0.3,    // 30%
    lighter: 0.5,     // 50%
    light: 0.7,       // 70%
    medium: 0.85,     // 85%
    heavy: 1.0,       // 100%
  },
} as const

// ============================================
// 玻璃擬態語意化命名系統
// ============================================
export const SEMANTIC_GLASS = {
  // 卡片玻璃效果
  card: {
    DEFAULT: GLASS_INTENSITY.medium,    // 標準卡片
    elevated: GLASS_INTENSITY.strong,   // 抬升卡片
    floating: GLASS_INTENSITY.heavy,    // 懸浮卡片
    prominent: GLASS_INTENSITY.solid,   // 突出卡片
  },
  
  // 導航玻璃效果
  navigation: {
    DEFAULT: GLASS_INTENSITY.subtle,    // 基礎導航
    sticky: GLASS_INTENSITY.medium,     // 固定導航
    sidebar: GLASS_INTENSITY.strong,    // 側邊欄
    modal: GLASS_INTENSITY.heavy,       // 模態框
  },
  
  // 表單玻璃效果
  form: {
    DEFAULT: GLASS_INTENSITY.subtle,    // 基礎表單
    input: GLASS_INTENSITY.medium,      // 輸入框
    select: GLASS_INTENSITY.medium,     // 選擇器
    popover: GLASS_INTENSITY.strong,    // 彈出框
  },
  
  // 按鈕玻璃效果
  button: {
    DEFAULT: GLASS_INTENSITY.subtle,    // 基礎按鈕
    ghost: GLASS_INTENSITY.subtle,      // 幽靈按鈕
    outlined: GLASS_INTENSITY.medium,   // 輪廓按鈕
    filled: GLASS_INTENSITY.strong,     // 填充按鈕
  },
  
  // 特殊玻璃效果
  special: {
    notification: GLASS_INTENSITY.heavy,  // 通知
    tooltip: GLASS_INTENSITY.strong,      // 工具提示
    toast: GLASS_INTENSITY.heavy,         // 吐司
    dialog: GLASS_INTENSITY.solid,        // 對話框
  },
} as const

// ============================================
// 玻璃擬態狀態系統
// ============================================
export const GLASS_STATES = {
  // 懸停狀態
  hover: {
    subtle: {
      backgroundOpacity: 0.08,
      borderOpacity: 0.15,
      backdropBlur: '6px',
    },
    medium: {
      backgroundOpacity: 0.15,
      borderOpacity: 0.25,
      backdropBlur: '10px',
    },
    strong: {
      backgroundOpacity: 0.25,
      borderOpacity: 0.35,
      backdropBlur: '18px',
    },
    heavy: {
      backgroundOpacity: 0.45,
      borderOpacity: 0.45,
      backdropBlur: '28px',
    },
    solid: {
      backgroundOpacity: 0.85,
      borderOpacity: 0.55,
      backdropBlur: '36px',
    },
  },
  
  // 焦點狀態
  focus: {
    subtle: {
      backgroundOpacity: 0.1,
      borderOpacity: 0.3,
      backdropBlur: '8px',
      ring: 'rgba(212, 175, 55, 0.4)',
    },
    medium: {
      backgroundOpacity: 0.18,
      borderOpacity: 0.35,
      backdropBlur: '12px',
      ring: 'rgba(212, 175, 55, 0.5)',
    },
    strong: {
      backgroundOpacity: 0.28,
      borderOpacity: 0.4,
      backdropBlur: '20px',
      ring: 'rgba(212, 175, 55, 0.6)',
    },
    heavy: {
      backgroundOpacity: 0.5,
      borderOpacity: 0.5,
      backdropBlur: '30px',
      ring: 'rgba(212, 175, 55, 0.7)',
    },
    solid: {
      backgroundOpacity: 0.9,
      borderOpacity: 0.6,
      backdropBlur: '40px',
      ring: 'rgba(212, 175, 55, 0.8)',
    },
  },
  
  // 停用狀態
  disabled: {
    subtle: {
      backgroundOpacity: 0.02,
      borderOpacity: 0.05,
      backdropBlur: '2px',
    },
    medium: {
      backgroundOpacity: 0.05,
      borderOpacity: 0.1,
      backdropBlur: '4px',
    },
    strong: {
      backgroundOpacity: 0.1,
      borderOpacity: 0.15,
      backdropBlur: '8px',
    },
    heavy: {
      backgroundOpacity: 0.2,
      borderOpacity: 0.2,
      backdropBlur: '12px',
    },
    solid: {
      backgroundOpacity: 0.4,
      borderOpacity: 0.3,
      backdropBlur: '16px',
    },
  },
} as const

// ============================================
// 玻璃擬態 CSS 工具類
// ============================================
export const GLASS_CLASSES = {
  // 基礎玻璃類別
  'glass-subtle': `
    bg-white/[0.05] 
    border border-white/[0.1] 
    backdrop-blur-sm
  `,
  'glass-medium': `
    bg-white/[0.1] 
    border border-white/[0.2] 
    backdrop-blur-md
  `,
  'glass-strong': `
    bg-white/[0.2] 
    border border-white/[0.3] 
    backdrop-blur-lg
  `,
  'glass-heavy': `
    bg-white/[0.4] 
    border border-white/[0.4] 
    backdrop-blur-xl
  `,
  'glass-solid': `
    bg-white/[0.8] 
    border border-white/[0.5] 
    backdrop-blur-2xl
  `,
  
  // 狀態類別
  'glass-hover': 'transition-all duration-300 hover:brightness-110',
  'glass-focus': 'focus:ring-2 focus:ring-[rgba(212,175,55,0.6)] focus:ring-offset-2',
  'glass-disabled': 'opacity-50 cursor-not-allowed',
  
  // 語意類別
  'glass-card': 'glass-medium rounded-2xl',
  'glass-nav': 'glass-subtle backdrop-blur-md',
  'glass-modal': 'glass-heavy rounded-3xl shadow-2xl',
  'glass-button': 'glass-medium hover:glass-hover active:scale-95',
} as const

// ============================================
// 響應式玻璃擬態
// ============================================
export const RESPONSIVE_GLASS = {
  // 移動端 - 簡化效果以提升性能
  mobile: {
    backdropBlur: '8px',
    backgroundOpacity: 0.15,
    borderOpacity: 0.2,
  },
  
  // 平板 - 標準效果
  tablet: {
    backdropBlur: '16px',
    backgroundOpacity: 0.2,
    borderOpacity: 0.3,
  },
  
  // 桌面 - 完整效果
  desktop: {
    backdropBlur: '24px',
    backgroundOpacity: 0.25,
    borderOpacity: 0.35,
  },
  
  // 高性能模式 - 減少效果
  performance: {
    backdropBlur: '4px',
    backgroundOpacity: 0.1,
    borderOpacity: 0.15,
  },
} as const

// ============================================
// 玻璃擬態驗證工具
// ============================================
export const validateGlassIntensity = (intensity: keyof typeof GLASS_INTENSITY): boolean => {
  return intensity in GLASS_INTENSITY
}

export const getGlassStyle = (intensity: keyof typeof GLASS_INTENSITY) => {
  const glass = GLASS_INTENSITY[intensity]
  return {
    background: `rgba(255, 255, 255, ${glass.backgroundOpacity})`,
    border: `1px solid rgba(255, 255, 255, ${glass.borderOpacity})`,
    backdropFilter: `blur(${glass.backdropBlur})`,
    WebkitBackdropFilter: `blur(${glass.backdropBlur})`,
  }
}

export const getGlassClass = (intensity: keyof typeof GLASS_INTENSITY): string => {
  return GLASS_CLASSES[`glass-${intensity}` as keyof typeof GLASS_CLASSES] || ''
}

// ============================================
// 完整玻璃擬態系統匯出
// ============================================
export const DESIGN_GLASS = {
  intensity: GLASS_INTENSITY,
  blur: BACKDROP_BLUR_VALUES,
  opacity: OPACITY_VALUES,
  semantic: SEMANTIC_GLASS,
  states: GLASS_STATES,
  classes: GLASS_CLASSES,
  responsive: RESPONSIVE_GLASS,
  utils: {
    validate: validateGlassIntensity,
    getStyle: getGlassStyle,
    getClass: getGlassClass,
  },
} as const

export type DesignGlass = typeof DESIGN_GLASS