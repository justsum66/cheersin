/**
 * i18n 語系設定 — 繁中、簡中、粵語、英、日、韓（亞洲 #1 AI 酒類 SaaS）
 */
export const locales = ['zh-TW', 'zh-CN', 'yue', 'en', 'ja', 'ko'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'zh-TW'

export const localeNames: Record<Locale, string> = {
  'zh-TW': '繁體中文',
  'zh-CN': '简体中文',
  'yue': '粵語',
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어',
}

export const COOKIE_KEY = 'cheersin_locale'
