'use client'

/** i18n 語系切換 — 六語系（繁中、簡中、粵、英、日、韓）；I18N-12：無障礙與當前語系標示 */
import { useTranslation } from '@/contexts/I18nContext'
import type { Locale } from '@/lib/i18n/config'

export function LocaleSwitcher() {
  const { locale, setLocale, localeNames, locales } = useTranslation()

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="touch-target bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[48px]"
      aria-label={typeof localeNames[locale] === 'string' ? `Language, current: ${localeNames[locale]}` : '選擇語言'}
    >
      {locales.map((loc) => (
        <option key={loc} value={loc} className="bg-dark-900 text-white">
          {localeNames[loc]}
        </option>
      ))}
    </select>
  )
}
