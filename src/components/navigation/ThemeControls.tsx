'use client'

import { Sun, Moon, Contrast } from 'lucide-react'

interface ThemeControlsProps {
  resolved: 'light' | 'dark'
  theme: string
  setTheme: (theme: string) => void
  highContrast: boolean
  setHighContrast: (value: boolean) => void
  fontScale: 'sm' | 'md' | 'lg'
  setFontScale: (scale: 'sm' | 'md' | 'lg') => void
}

/** P002: Theme controls extracted from Navigation.tsx for better code splitting */
export function ThemeControls({
  resolved,
  theme,
  setTheme,
  highContrast,
  setHighContrast,
  fontScale,
  setFontScale,
}: ThemeControlsProps) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="顯示設定">
      <button
        onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center games-focus-ring"
        title={resolved === 'dark' ? '切換淺色' : '切換深色'}
        aria-label={resolved === 'dark' ? '切換淺色模式' : '切換深色模式'}
        aria-pressed={resolved === 'light'}
      >
        {resolved === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      
      <button
        onClick={() => setHighContrast(!highContrast)}
        className={`p-2 rounded-xl transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center games-focus-ring ${highContrast ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
        title={highContrast ? '關閉高對比' : '開啟高對比'}
        aria-label={highContrast ? '關閉高對比模式' : '開啟高對比模式'}
        aria-pressed={highContrast}
      >
        <Contrast className="w-5 h-5" />
      </button>
      
      <div className="hidden sm:flex items-center rounded-xl bg-white/5 border border-white/10 overflow-hidden" role="radiogroup" aria-label="字體大小">
        {(['sm', 'md', 'lg'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFontScale(s)}
            className={`px-2.5 py-1.5 text-xs font-medium transition-colors min-w-[2rem] min-h-[48px] flex items-center justify-center games-focus-ring ${fontScale === s ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'}`}
            title={s === 'sm' ? '小字' : s === 'md' ? '標準' : '大字'}
            aria-label={s === 'sm' ? '字體較小' : s === 'md' ? '字體標準' : '字體較大'}
            aria-pressed={fontScale === s}
          >
            {s === 'sm' ? '小' : s === 'md' ? '中' : '大'}
          </button>
        ))}
      </div>
    </div>
  )
}
