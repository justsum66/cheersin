/**
 * P0-013：設計規範單一來源
 * 顏色、字體、間距、圓角、陰影等由此匯出，Tailwind theme 與 globals.css :root 與此對齊。
 * 變更時請同步更新 tailwind.config.ts 的 theme.extend 與 globals.css 的 :root。
 */

/** 品牌主色：奢華金 (Luxury Gold) */
export const primary = {
  50: '#fbf8e6',
  100: '#f5edc6',
  200: '#ebda95',
  300: '#e0c25e',
  400: '#d4af37', // Gold Main
  500: '#b89128',
  600: '#936e1c',
  700: '#765318',
  800: '#61421a',
  900: '#523719',
  950: '#2d1c0a',
} as const

/** 品牌次要色：白金銀 (Platinum Silver) */
export const secondary = {
  50: '#f7f7f8',
  100: '#eeeff1',
  200: '#dadce0',
  300: '#bcc0c7',
  400: '#9aa0a9',
  500: '#7e848f',
  600: '#656a73',
  700: '#51545a',
  800: '#43454b',
  900: '#3a3b3f',
  950: '#242528',
} as const

/** 品牌強調色：保留微量霓虹紅作為「急救」按鈕 */
export const accent = {
  50: '#fff0f3',
  100: '#ffe3e8',
  200: '#ffc7d4',
  300: '#ff9bb0',
  400: '#ff6485',
  500: '#ff2e63', // Neon Red
  600: '#db0f46',
  700: '#b80031',
  800: '#99052d',
  900: '#82082b',
  950: '#470013',
} as const

export const dark = {
  50: '#f6f5f9',
  100: '#ecebf1',
  200: '#dcdbe6',
  300: '#bdbcce',
  400: '#9c9ab0',
  500: '#7e7b95',
  600: '#636079',
  700: '#504d60',
  800: '#42404e',
  900: '#383641',
  950: '#050505', // Pure Black for luxury feel
} as const

export const wine = {
  red: '#FF2E63', // Matched to new primary
  white: '#F5F5F5',
  rose: '#FF6485',
  champagne: '#08D9D6', // Matched to new secondary
} as const

export const semantic = {
  error: { DEFAULT: '#ff4d4d', light: '#ffcccc' as const },
  success: { DEFAULT: '#00ff9d', light: '#ccffe6' as const },
  warning: { DEFAULT: '#ffb700', light: '#ffeab3' as const },
  glass: {
    1: 'rgb(var(--glass-1))',
    2: 'rgb(var(--glass-2))',
    3: 'rgb(var(--glass-3))',
    border: {
      1: 'rgb(var(--glass-border-1))',
      2: 'rgb(var(--glass-border-2))',
    },
    shine: 'rgb(var(--glass-shine))',
  },
} as const

/** Tailwind theme.extend.colors 用 */
export const colors = {
  primary,
  secondary,
  accent,
  dark,
  wine,
  error: semantic.error,
  success: semantic.success,
  warning: semantic.warning,
  glass: semantic.glass,
} as const

/** 字體家族：與 layout next/font 對應（陣列為 mutable 以符合 Tailwind theme 型別） */
export const fontFamily = {
  sans: ['var(--font-sans)', 'var(--font-noto)', 'Noto Sans TC', 'system-ui', 'sans-serif'],
  display: ['var(--font-display)', 'Playfair Display', 'serif'],
  chinese: ['var(--font-noto)', 'Noto Sans TC', 'Microsoft JhengHei', 'PingFang TC', 'sans-serif'],
}

export const fontWeight = {
  light: '300',
  normal: '400',
  medium: '500',
  bold: '700',
} as const

export const letterSpacing = {
  'display-tight': '-0.02em',
  'body-wide': '0.01em',
} as const

/** 字級（rem）：與 globals.css --text-* 對齊 */
export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  hero: 'clamp(2.5rem, 5vw + 1rem, 3.5rem)',
  h1: '3.5rem',
  h2: '2.25rem',
  h3: '1.5rem',
  h4: '1.25rem',
  h5: '1.125rem',
  h6: '1rem',
} as const

/** 行高：Tailwind theme 僅接受 string，不可用 number */
export const lineHeight: Record<string, string> = {
  body: '1.65',
  tight: '1.25',
}

/** 圓角：與 globals.css --radius-* 對齊 */
export const borderRadius = {
  md: '0.75rem',
  lg: '1rem',
} as const

/** 8px 網格延伸間距 */
export const spacing = {
  18: '4.5rem',
  22: '5.5rem',
  30: '7.5rem',
} as const

/** 圖標尺寸（px），鍵名避開 Tailwind 預設 sm/md/lg 以僅擴展 */
export const iconSize = {
  'icon-sm': '16px',
  'icon-md': '20px',
  'icon-lg': '24px',
  'icon-xl': '32px',
} as const

/** A11Y-012 / UX-003：觸控目標至少 48px，符合 WCAG 2.5.5 */
export const touchTargetPx = 48

/** 陰影：使用 primary/secondary 數值 139,0,0 與 212,175,55 */
export const boxShadow = {
  'card-sm': '0 1px 3px 0 rgb(0 0 0 / 0.08)',
  'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
  'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
  'card-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
  glow: '0 0 20px rgba(255, 46, 99, 0.5)',
  'glow-lg': '0 0 40px rgba(255, 46, 99, 0.6)',
  'glow-primary': '0 0 30px rgba(255, 46, 99, 0.6)',
  'glow-secondary': '0 0 24px rgba(8, 217, 214, 0.6)',
  glass: '0 8px 32px 0 rgba(8, 217, 214, 0.2)',
  'card-brand': '0 4px 24px -2px rgba(255, 46, 99, 0.3), 0 0 0 1px rgba(8, 217, 214, 0.2)',
} as const

/** 背景漸層（色值與 primary/secondary 對齊） */
export const backgroundImage = {
  'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  'brand-bg': 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 100%)',
  'mesh-gradient': 'linear-gradient(135deg, #1a0a2e 0%, #0f0a1a 25%, #0a0a0a 50%, #0f0a14 75%, #0a0a0a 100%)',
  'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  'glow-gradient': 'radial-gradient(ellipse at center, rgba(139,0,0,0.12) 0%, transparent 70%)',
  'divider-gradient': 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.4) 50%, transparent 100%)',
} as const

/** RWD 斷點（與 Tailwind 預設對齊，便於文件與覆寫）：mobile-first */
export const screens = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

/** 供 Tailwind theme.extend 使用（可變型別以相容 Config） */
export const themeExtend = {
  colors,
  fontFamily,
  fontWeight,
  letterSpacing,
  fontSize,
  lineHeight,
  borderRadius,
  spacing,
  boxShadow,
  backgroundImage,
  width: iconSize,
  height: iconSize,
  backdropBlur: { xs: '2px' },
  screens,
}
