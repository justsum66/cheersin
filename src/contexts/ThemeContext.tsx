'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

export type ThemeMode = 'dark' | 'light' | 'system'
export type ZodiacSign = string | null

export type FontScale = 'sm' | 'md' | 'lg'

interface ThemeContextValue {
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void
  resolved: 'dark' | 'light'
  zodiac: ZodiacSign
  setZodiac: (z: ZodiacSign) => void
  primaryHue: number
  secondaryHue: number
  /** 124 高對比模式 */
  highContrast: boolean
  setHighContrast: (v: boolean) => void
  /** 125 字體大小調節全站 */
  fontScale: FontScale
  setFontScale: (s: FontScale) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const ZODIAC_HUES: Record<string, { primary: number; secondary: number }> = {
  Aries: { primary: 0, secondary: 200 },
  Taurus: { primary: 30, secondary: 180 },
  Gemini: { primary: 60, secondary: 260 },
  Cancer: { primary: 120, secondary: 280 },
  Leo: { primary: 45, secondary: 320 },
  Virgo: { primary: 90, secondary: 200 },
  Libra: { primary: 330, secondary: 180 },
  Scorpio: { primary: 270, secondary: 30 },
  Sagittarius: { primary: 40, secondary: 200 },
  Capricorn: { primary: 210, secondary: 30 },
  Aquarius: { primary: 200, secondary: 280 },
  Pisces: { primary: 260, secondary: 180 },
}

const DEFAULT_PRIMARY = 330
const DEFAULT_SECONDARY = 190

const FONT_SCALE_MAP = { sm: 0.875, md: 1, lg: 1.125 } as const

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system')
  const [resolved, setResolved] = useState<'dark' | 'light'>('dark')
  const [zodiac, setZodiac] = useState<ZodiacSign>(null)
  const [highContrast, setHighContrastState] = useState(false)
  const [fontScale, setFontScaleState] = useState<FontScale>('md')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('cheersin-theme') as ThemeMode | null
    if (stored && ['dark', 'light', 'system'].includes(stored)) setThemeState(stored)
    const z = localStorage.getItem('cheersin-zodiac')
    if (z) setZodiac(z)
    const hc = localStorage.getItem('cheersin-high-contrast')
    if (hc === 'true') setHighContrastState(true)
    const fs = localStorage.getItem('cheersin-font-scale') as FontScale | null
    if (fs && ['sm', 'md', 'lg'].includes(fs)) setFontScaleState(fs)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const compute = () => {
      const r = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
      setResolved(r)
      document.documentElement.classList.toggle('dark', r === 'dark')
      document.documentElement.classList.toggle('light', r === 'light')
    }
    compute()
    media.addEventListener('change', compute)
    return () => media.removeEventListener('change', compute)
  }, [theme])

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t)
    if (typeof window !== 'undefined') localStorage.setItem('cheersin-theme', t)
  }, [])

  const hues = zodiac && ZODIAC_HUES[zodiac] ? ZODIAC_HUES[zodiac] : { primary: DEFAULT_PRIMARY, secondary: DEFAULT_SECONDARY }

  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.style.setProperty('--primary-hue', String(hues.primary))
    root.style.setProperty('--secondary-hue', String(hues.secondary))
  }, [hues.primary, hues.secondary])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('high-contrast', highContrast)
    document.documentElement.setAttribute('data-high-contrast', highContrast ? 'true' : 'false')
  }, [highContrast])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const scale = FONT_SCALE_MAP[fontScale]
    document.documentElement.style.setProperty('--text-scale', String(scale))
    document.documentElement.setAttribute('data-font-scale', fontScale)
  }, [fontScale])

  const setHighContrast = useCallback((v: boolean) => {
    setHighContrastState(v)
    if (typeof window !== 'undefined') localStorage.setItem('cheersin-high-contrast', String(v))
  }, [])

  const setFontScale = useCallback((s: FontScale) => {
    setFontScaleState(s)
    if (typeof window !== 'undefined') localStorage.setItem('cheersin-font-scale', s)
  }, [])

  const setZodiacCb = useCallback((z: ZodiacSign) => {
    setZodiac(z)
    if (typeof window !== 'undefined') {
      if (z) localStorage.setItem('cheersin-zodiac', z)
      else localStorage.removeItem('cheersin-zodiac')
    }
  }, [])

  // OPT: Memoize context value to prevent unnecessary consumer re-renders
  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme,
    resolved,
    zodiac,
    setZodiac: setZodiacCb,
    primaryHue: hues.primary,
    secondaryHue: hues.secondary,
    highContrast,
    setHighContrast,
    fontScale,
    setFontScale,
  }), [theme, setTheme, resolved, zodiac, setZodiacCb, hues.primary, hues.secondary, highContrast, setHighContrast, fontScale, setFontScale])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
