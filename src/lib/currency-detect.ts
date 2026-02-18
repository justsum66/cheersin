/**
 * PAY-026: Currency auto-detection by locale
 * Detects user locale and returns appropriate currency display info.
 */

export interface CurrencyInfo {
  code: string
  symbol: string
  rate: number // conversion rate from TWD
  locale: string
}

/** Supported currencies with approximate rates from TWD */
const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  'zh-TW': { code: 'TWD', symbol: 'NT$', rate: 1, locale: 'zh-TW' },
  'zh-CN': { code: 'CNY', symbol: '¥', rate: 0.23, locale: 'zh-CN' },
  'en-US': { code: 'USD', symbol: '$', rate: 0.031, locale: 'en-US' },
  'en-GB': { code: 'GBP', symbol: '£', rate: 0.025, locale: 'en-GB' },
  'ja-JP': { code: 'JPY', symbol: '¥', rate: 4.7, locale: 'ja-JP' },
  'ko-KR': { code: 'KRW', symbol: '₩', rate: 42, locale: 'ko-KR' },
  'en-AU': { code: 'AUD', symbol: 'A$', rate: 0.048, locale: 'en-AU' },
}

const DEFAULT_CURRENCY: CurrencyInfo = CURRENCY_MAP['zh-TW']

/** Detect currency from browser locale */
export function detectCurrency(): CurrencyInfo {
  if (typeof navigator === 'undefined') return DEFAULT_CURRENCY

  const locale = navigator.language || 'zh-TW'

  // Exact match
  if (CURRENCY_MAP[locale]) return CURRENCY_MAP[locale]

  // Language-only match (e.g., "en" -> "en-US")
  const lang = locale.split('-')[0]
  const match = Object.entries(CURRENCY_MAP).find(([key]) => key.startsWith(lang))
  if (match) return match[1]

  return DEFAULT_CURRENCY
}

/** Convert TWD amount to detected currency */
export function convertFromTWD(amountTWD: number, currency: CurrencyInfo): number {
  const converted = amountTWD * currency.rate
  // Round nicely based on currency
  if (currency.code === 'JPY' || currency.code === 'KRW') {
    return Math.round(converted)
  }
  return Math.round(converted * 100) / 100
}

/** Format price with currency symbol */
export function formatPrice(amount: number, currency: CurrencyInfo): string {
  return `${currency.symbol}${amount.toLocaleString(currency.locale, {
    minimumFractionDigits: currency.code === 'JPY' || currency.code === 'KRW' || currency.code === 'TWD' ? 0 : 2,
    maximumFractionDigits: currency.code === 'JPY' || currency.code === 'KRW' || currency.code === 'TWD' ? 0 : 2,
  })}`
}
