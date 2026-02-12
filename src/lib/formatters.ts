/**
 * G193 / I18N-004 日期/數字/貨幣格式化
 * 統一 locale 與格式；可選 locale 參數（預設 zh-TW），客戶端從 useTranslation().locale 傳入
 */
import { messages } from '@/lib/i18n/messages'

const DEFAULT_LOCALE = 'zh-TW'

function getMessage(locale: string, key: string, params?: Record<string, string | number>): string {
  const msg = messages[locale as keyof typeof messages] as Record<string, unknown> | undefined
  const fallback = messages['zh-TW'] as Record<string, unknown>
  const raw = (msg && getByPath(msg, key)) ?? getByPath(fallback, key) ?? key
  const str = typeof raw === 'string' ? raw : String(raw)
  if (!params) return str
  return Object.entries(params).reduce((s, [k, v]) => s.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v)), str)
}

function getByPath(obj: Record<string, unknown>, path: string): string | undefined {
  let cur: unknown = obj
  for (const k of path.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[k]
  }
  return typeof cur === 'string' ? cur : undefined
}

/** 日期：YYYY/MM/DD */
export function formatDate(date: Date | string | number, locale: string = DEFAULT_LOCALE): string {
  const d = typeof date === 'object' && 'getTime' in date ? date : new Date(date)
  return d.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
}

/** 時間：HH:MM */
export function formatTime(date: Date | string | number, locale: string = DEFAULT_LOCALE): string {
  const d = typeof date === 'object' && 'getTime' in date ? date : new Date(date)
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
}

/** 日期時間：YYYY/MM/DD HH:MM */
export function formatDateTime(date: Date | string | number, locale: string = DEFAULT_LOCALE): string {
  const d = typeof date === 'object' && 'getTime' in date ? date : new Date(date)
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** I18N-004：相對時間依 locale 取 common.justNow / minutesAgo / hoursAgo / daysAgo */
export function formatRelative(date: Date | string | number, locale: string = DEFAULT_LOCALE): string {
  const d = typeof date === 'object' && 'getTime' in date ? date : new Date(date)
  const now = Date.now()
  const diffMs = now - d.getTime()
  const diffM = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)
  if (diffM < 1) return getMessage(locale, 'common.justNow')
  if (diffM < 60) return getMessage(locale, 'common.minutesAgo', { n: diffM })
  if (diffH < 24) return getMessage(locale, 'common.hoursAgo', { n: diffH })
  if (diffD < 7) return getMessage(locale, 'common.daysAgo', { n: diffD })
  return formatDate(d, locale)
}

/** 數字：千分位 */
export function formatNumber(n: number, locale: string = DEFAULT_LOCALE): string {
  return n.toLocaleString(locale)
}

/** 貨幣：NT$ 1,234 */
export function formatCurrency(amount: number, currency = 'TWD', locale: string = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** 百分比：小數一位（數字格式依 locale） */
export function formatPercent(value: number, decimals = 1, locale: string = DEFAULT_LOCALE): string {
  const formatted = Number(value.toFixed(decimals)).toLocaleString(locale)
  return `${formatted}%`
}
