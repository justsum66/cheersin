/**
 * P0-013：設計規範單一來源
 * 顏色、字體、間距、圓角、陰影等由此匯出，Tailwind theme 與 globals.css :root 與此對齊。
 * 變更時請同步更新 tailwind.config.ts 的 theme.extend 與 globals.css 的 :root。
 */

/** 品牌主色：深酒紅 #8B0000 */
export const primary = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#8B0000',
  600: '#7a0000',
  700: '#6b0000',
  800: '#5c0000',
  900: '#4d0000',
  950: '#2a0000',
} as const

/** 品牌次要色：香檳金 #D4AF37 */
export const secondary = {
  50: '#fdf8ed',
  100: '#f9eecd',
  200: '#f3dc9e',
  300: '#ecc96d',
  400: '#e5b83d',
  500: '#D4AF37',
  600: '#b8942e',
  700: '#967826',
  800: '#745c1e',
  900: '#524016',
  950: '#30240d',
} as const

export const accent = {
  50: '#f5f3ff',
  100: '#ede9fe',
  200: '#ddd6fe',
  300: '#c4b5fd',
  400: '#a78bfa',
  500: '#8A2BE2',
  600: '#7c3aed',
  700: '#6d28d9',
  800: '#5b21b6',
  900: '#4c1d95',
} as const

export const dark = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#030014',
} as const

export const wine = {
  red: '#8B0000',
  white: '#F5E6D3',
  rose: '#FFB6C1',
  champagne: '#D4AF37',
} as const

export const semantic = {
  error: { DEFAULT: '#b91c1c', light: '#fecaca' as const },
  success: { DEFAULT: '#047857', light: '#a7f3d0' as const },
  warning: { DEFAULT: '#c2410c', light: '#fed7aa' as const },
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

/** 陰影：使用 primary/secondary 數值 139,0,0 與 212,175,55 */
export const boxShadow = {
  'card-sm': '0 1px 3px 0 rgb(0 0 0 / 0.08)',
  'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
  'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
  'card-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
  glow: '0 0 20px rgba(139, 0, 0, 0.25)',
  'glow-lg': '0 0 40px rgba(139, 0, 0, 0.35)',
  'glow-primary': '0 0 30px rgba(139, 0, 0, 0.4)',
  'glow-secondary': '0 0 24px rgba(212, 175, 55, 0.35)',
  glass: '0 8px 32px 0 rgba(10, 10, 20, 0.5)',
  'card-brand': '0 4px 24px -2px rgba(139, 0, 0, 0.15), 0 0 0 1px rgba(212, 175, 55, 0.08)',
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
