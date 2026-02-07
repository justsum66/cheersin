import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  /* Turbopack 有時在 @apply 解析時找不到 via-secondary-600，強制生成避免 CssSyntaxError */
  safelist: [{ pattern: /^via-secondary-\d+$/ }],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#8B0000', // 深酒紅 Deep Wine Red
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
          500: '#D4AF37', // 香檳金 Champagne Gold
          600: '#b8942e',
          700: '#967826',
          800: '#745c1e',
          900: '#524016',
          950: '#30240d',
        },
        accent: {
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
        },
        dark: {
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
        },
        wine: {
          red: '#8B0000',
          white: '#F5E6D3',
          rose: '#FFB6C1',
          champagne: '#D4AF37',
        },
        /* 語義色：符合品牌色調 */
        error: { DEFAULT: '#b91c1c', light: '#fecaca' },
        success: { DEFAULT: '#047857', light: '#a7f3d0' },
        warning: { DEFAULT: '#c2410c', light: '#fed7aa' },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'var(--font-noto)', 'Noto Sans TC', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Playfair Display', 'serif'],
        chinese: ['var(--font-noto)', 'Noto Sans TC', 'Microsoft JhengHei', 'PingFang TC', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        bold: '700',
      },
      letterSpacing: {
        'display-tight': '-0.02em',
        'body-wide': '0.01em',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'brand-bg': 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 100%)',
        'mesh-gradient': 'linear-gradient(135deg, #1a0a2e 0%, #0f0a1a 25%, #0a0a0a 50%, #0f0a14 75%, #0a0a0a 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'glow-gradient': 'radial-gradient(ellipse at center, rgba(139,0,0,0.12) 0%, transparent 70%)',
        'divider-gradient': 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.4) 50%, transparent 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'aurora': 'aurora 60s linear infinite',
      },
      /* P3 動畫盤點：animate-pulse-slow 用於 HomePageClient Hero 光暈；float/glow/slide-up 等供組件選用 */
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(139, 0, 0, 0.4), 0 0 40px rgba(212, 175, 55, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(212, 175, 55, 0.4), 0 0 60px rgba(139, 0, 0, 0.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%' },
        },
        aurora: {
          'from': { backgroundPosition: '50% 50%, 50% 50%' },
          'to': { backgroundPosition: '350% 50%, 350% 50%' },
        },
      },
      boxShadow: {
        /* P1-044：層級化陰影（卡片/彈窗用），不覆蓋 Tailwind 預設 */
        'card-sm': '0 1px 3px 0 rgb(0 0 0 / 0.08)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'card-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
        glow: '0 0 20px rgba(139, 0, 0, 0.25)',
        'glow-lg': '0 0 40px rgba(139, 0, 0, 0.35)',
        'glow-primary': '0 0 30px rgba(139, 0, 0, 0.4)',
        'glow-secondary': '0 0 24px rgba(212, 175, 55, 0.35)',
        'glass': '0 8px 32px 0 rgba(10, 10, 20, 0.5)',
        'card-brand': '0 4px 24px -2px rgba(139, 0, 0, 0.15), 0 0 0 1px rgba(212, 175, 55, 0.08)',
      },
      /* 圖標尺寸：sm 16, md 20, lg 24, xl 32 */
      width: { 'icon-sm': '16px', 'icon-md': '20px', 'icon-lg': '24px', 'icon-xl': '32px' },
      height: { 'icon-sm': '16px', 'icon-md': '20px', 'icon-lg': '24px', 'icon-xl': '32px' },
      backdropBlur: {
        xs: '2px',
      },
      /* P1-045：8px 網格系統 — 使用 p-2(8px), p-4(16px), gap-4(16px) 等，避免 p-[7px] 硬編碼 */
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
    },
  },
  plugins: [],
}

export default config
