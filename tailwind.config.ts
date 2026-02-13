import type { Config } from 'tailwindcss'
import { themeExtend } from './src/lib/design-tokens'
import { safeAreaUtilities } from './src/lib/tailwind-plugins/safe-area-utilities'

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  /** P2-268：safelist 僅保留動態類名 via-secondary-*，其餘由 content 掃描，保持精簡 */
  safelist: [{ pattern: /^via-secondary-\d+$/ }],
  theme: {
    extend: {
      ...themeExtend,
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
    },
  },
  plugins: [safeAreaUtilities],
}

export default config
