/**
 * G193 日期/數字/貨幣格式化
 * 統一 locale 與格式
 */

const LOCALE = 'zh-TW'

/** 日期：YYYY/MM/DD */
export function formatDate(date: Date | string | number): string {
  const d = typeof date === 'object' && 'getTime' in date ? date : new Date(date)
  return d.toLocaleDateString(LOCALE, { year: 'numeric', month: '2-digit', day: '2-digit' })
}

/** 時間：HH:MM */
export function formatTime(date: Date | string | number): string {
  const d = typeof date === 'object' && 'getTime' in date ? date : new Date(date)
  return d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })
}

/** 日期時間：YYYY/MM/DD HH:MM */
export function formatDateTime(date: Date | string | number): string {
  const d = typeof date === 'object' && 'getTime' in date ? date : new Date(date)
  return d.toLocaleString(LOCALE, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** 相對時間：剛剛、N 分鐘前、N 天前 */
export function formatRelative(date: Date | string | number): string {
  const d = typeof date === 'object' && 'getTime' in date ? date : new Date(date)
  const now = Date.now()
  const diffMs = now - d.getTime()
  const diffM = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)
  if (diffM < 1) return '剛剛'
  if (diffM < 60) return `${diffM} 分鐘前`
  if (diffH < 24) return `${diffH} 小時前`
  if (diffD < 7) return `${diffD} 天前`
  return formatDate(d)
}

/** 數字：千分位 */
export function formatNumber(n: number): string {
  return n.toLocaleString(LOCALE)
}

/** 貨幣：NT$ 1,234 */
export function formatCurrency(amount: number, currency = 'TWD'): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** 百分比：小數一位 */
export function formatPercent(value: number, decimals = 1): string {
  return `${Number(value.toFixed(decimals))}%`
}
