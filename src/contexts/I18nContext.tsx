'use client'

/**
 * i18n Context — 六語系（繁中、簡中、粵、英、日、韓），cookie 持久化
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { locales, defaultLocale, COOKIE_KEY, localeNames, type Locale } from '@/lib/i18n/config'
import { messages } from '@/lib/i18n/messages'

function getByPath(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.')
  let cur: unknown = obj
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[k]
  }
  return typeof cur === 'string' ? cur : undefined
}

function readLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return defaultLocale
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`))
  const value = match ? decodeURIComponent(match[1]) : ''
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale
}

function setLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(locale)};path=/;max-age=31536000;SameSite=Lax`
}

/** I18N-007：參數化文案，支援 {{key}} 替換 */
export function interpolate(template: string, params: Record<string, string | number>): string {
  let out = template
  for (const [key, value] of Object.entries(params)) {
    out = out.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
  }
  return out
}

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  localeNames: Record<Locale, string>
  locales: readonly Locale[]
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setLocaleState(readLocaleFromCookie())
    setMounted(true)
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    setLocaleCookie(next)
  }, [])

  /** I18N-14 / I18N-003：缺 key 時依序 fallback → defaultLocale → en（ja/ko/yue 等）；I18N-007：可傳 params 做 {{key}} 替換 */
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const msg = messages[locale] as Record<string, unknown>
      const fallbackMsg = messages[defaultLocale] as Record<string, unknown>
      const enMsg = messages['en'] as Record<string, unknown>
      /** I18N-003：缺 key 時不顯示 key 名，回傳空字串 */
      const raw =
        getByPath(msg, key) ??
        getByPath(fallbackMsg, key) ??
        (locale !== 'en' ? getByPath(enMsg, key) : undefined) ??
        ''
      const resolved = typeof raw === 'string' ? raw : String(raw)
      return params && Object.keys(params).length > 0 ? interpolate(resolved, params) : resolved
    },
    [locale]
  )

  const value: I18nContextValue = {
    locale: mounted ? locale : defaultLocale,
    setLocale,
    t,
    localeNames,
    locales: locales as unknown as Locale[],
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    return {
      locale: defaultLocale,
      setLocale: () => {},
      t: (k: string) => k,
      localeNames,
      locales: locales as unknown as Locale[],
    }
  }
  return ctx
}

export function useTranslation() {
  const { t, locale, setLocale, localeNames: names, locales: locs } = useI18n()
  return { t, locale, setLocale, localeNames: names, locales: locs }
}
