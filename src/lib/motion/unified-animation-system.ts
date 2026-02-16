/**
 * Task 2.05: 動畫系統統一
 * 流暢度和一致性動畫系統
 * 
 * 建立統一的動畫語言，確保所有交互都有一致的流暢體驗
 */

// ============================================
// 持續時間系統
// ============================================

export const DURATIONS = {
  // 微交互 - 按鈕懸停、開關切換
  micro: '0.15s',
  
  // 短動畫 - 頁面切換、元件顯示
  short: '0.3s',
  
  // 標準動畫 - 區塊過渡、表單互動
  base: '0.5s',
  
  // 長動畫 - 複雜過渡、引導流程
  long: '0.8s',
  
  // 超長動畫 - 載入序列、品牌展示
  extraLong: '1.2s',
} as const

// ============================================
// 緩動函數系統
// ============================================

export const EASING_FUNCTIONS = {
  // 線性 - 均速運動
  linear: 'linear',
  
  // 標準緩入 - 開始慢，結束快
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  
  // 標準緩出 - 開始快，結束慢
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  
  // 標準緩入緩出 - 開始和結束都慢
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // 品牌專屬 - Cheersin 奢華感動畫
  brand: 'cubic-bezier(0.32, 0.72, 0, 1)',
  
  // 彈跳效果 - 生動有趣的反饋
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // 彈性效果 - 柔和的彈性運動
  elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // 快速反應 - 立即響應
  swift: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const

// ============================================
// 動畫預設組合
// ============================================

export const ANIMATION_PRESETS = {
  // 按鈕交互
  button: {
    hover: {
      duration: DURATIONS.micro,
      easing: EASING_FUNCTIONS.easeOut,
    },
    press: {
      duration: DURATIONS.micro,
      easing: EASING_FUNCTIONS.easeIn,
    },
    focus: {
      duration: DURATIONS.short,
      easing: EASING_FUNCTIONS.easeInOut,
    },
  },
  
  // 頁面過渡
  page: {
    enter: {
      duration: DURATIONS.base,
      easing: EASING_FUNCTIONS.easeOut,
    },
    exit: {
      duration: DURATIONS.short,
      easing: EASING_FUNCTIONS.easeIn,
    },
  },
  
  // 卡片交互
  card: {
    hover: {
      duration: DURATIONS.short,
      easing: EASING_FUNCTIONS.easeOut,
    },
    flip: {
      duration: DURATIONS.base,
      easing: EASING_FUNCTIONS.easeInOut,
    },
  },
  
  // 表單交互
  form: {
    input: {
      duration: DURATIONS.micro,
      easing: EASING_FUNCTIONS.easeOut,
    },
    validation: {
      duration: DURATIONS.short,
      easing: EASING_FUNCTIONS.bounce,
    },
  },
  
  // 載入動畫
  loading: {
    spinner: {
      duration: DURATIONS.long,
      easing: EASING_FUNCTIONS.linear,
    },
    skeleton: {
      duration: DURATIONS.base,
      easing: EASING_FUNCTIONS.easeInOut,
    },
    progress: {
      duration: DURATIONS.extraLong,
      easing: EASING_FUNCTIONS.easeOut,
    },
  },
} as const

// ============================================
// 關鍵幀動畫
// ============================================

export const KEYFRAME_ANIMATIONS = {
  // 漂浮效果
  float: {
    name: 'float',
    keyframes: `
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(2deg); }
    `,
    duration: DURATIONS.long,
    easing: EASING_FUNCTIONS.easeInOut,
    iteration: 'infinite',
  },
  
  // 發光效果
  glow: {
    name: 'glow',
    keyframes: `
      0% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.4), 0 0 40px rgba(139, 0, 0, 0.2); }
      100% { box-shadow: 0 0 30px rgba(212, 175, 55, 0.6), 0 0 60px rgba(139, 0, 0, 0.3); }
    `,
    duration: DURATIONS.base,
    easing: EASING_FUNCTIONS.easeInOut,
    iteration: 'infinite',
    direction: 'alternate',
  },
  
  // 閃爍效果
  pulse: {
    name: 'pulse',
    keyframes: `
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    `,
    duration: DURATIONS.short,
    easing: EASING_FUNCTIONS.easeInOut,
    iteration: 'infinite',
  },
  
  // 震動效果
  shake: {
    name: 'shake',
    keyframes: `
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    `,
    duration: DURATIONS.short,
    easing: EASING_FUNCTIONS.easeInOut,
    iteration: '1',
  },
  
  // 旋轉效果
  spin: {
    name: 'spin',
    keyframes: `
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    `,
    duration: DURATIONS.long,
    easing: EASING_FUNCTIONS.linear,
    iteration: 'infinite',
  },
} as const

// ============================================
// 動畫工具函數
// ============================================

/**
 * 生成 CSS 動畫屬性
 */
export const generateAnimationCSS = (
  keyframes: string,
  duration: string,
  easing: string,
  iteration: string = '1',
  delay: string = '0s'
) => {
  return `${keyframes} ${duration} ${easing} ${delay} ${iteration}`
}

/**
 * 創建自定義動畫
 */
export const createCustomAnimation = (
  name: string,
  keyframes: string,
  options: {
    duration?: keyof typeof DURATIONS
    easing?: keyof typeof EASING_FUNCTIONS
    iteration?: string
    delay?: string
  } = {}
) => {
  const duration = DURATIONS[options.duration || 'base']
  const easing = EASING_FUNCTIONS[options.easing || 'easeInOut']
  const iteration = options.iteration || '1'
  const delay = options.delay || '0s'
  
  return {
    animation: `${name} ${duration} ${easing} ${delay} ${iteration}`,
    keyframes: `@keyframes ${name} { ${keyframes} }`,
  }
}

/**
 * 動畫性能優化
 */
export const ANIMATION_PERFORMANCE = {
  // 啟用硬體加速的屬性
  hardwareAcceleratedProperties: [
    'transform',
    'opacity',
    'filter',
  ],
  
  // 避免觸發重排的屬性
  layoutSafeProperties: [
    'opacity',
    'transform',
    'filter',
  ],
  
  // 減少動畫的條件
  shouldReduceMotion: () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  },
  
  // 獲取最佳的動畫設置
  getOptimizedSettings: (motionPreference: 'full' | 'reduced' = 'full') => {
    if (motionPreference === 'reduced' || ANIMATION_PERFORMANCE.shouldReduceMotion()) {
      return {
        duration: '0.01ms',
        easing: EASING_FUNCTIONS.linear,
        iteration: '1',
      }
    }
    
    return {
      duration: DURATIONS.base,
      easing: EASING_FUNCTIONS.easeInOut,
      iteration: '1',
    }
  },
} as const

// ============================================
// 動畫系統整合
// ============================================

export const UNIFIED_ANIMATION_SYSTEM = {
  durations: DURATIONS,
  easing: EASING_FUNCTIONS,
  presets: ANIMATION_PRESETS,
  keyframes: KEYFRAME_ANIMATIONS,
  performance: ANIMATION_PERFORMANCE,
  utils: {
    generateAnimationCSS,
    createCustomAnimation,
  },
} as const

// ============================================
// 型別定義
// ============================================

export type Duration = keyof typeof DURATIONS
export type Easing = keyof typeof EASING_FUNCTIONS
export type AnimationPreset = keyof typeof ANIMATION_PRESETS
export type KeyframeAnimation = keyof typeof KEYFRAME_ANIMATIONS
export type MotionPreference = 'full' | 'reduced'

export default UNIFIED_ANIMATION_SYSTEM