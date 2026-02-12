/**
 * G197 / P2-24：日誌工具封裝，結構化 context 供生產環境篩選與告警
 * P3-58：context 傳入前經 maskSensitiveContext，不記錄 password、token 等敏感欄位
 * P3-57：context 可含 requestId，由 route 從 request.headers.get('x-request-id') 傳入
 */

import { maskSensitiveContext } from './mask-context'

const isDev = process.env.NODE_ENV === 'development'

export type LogContext = Record<string, unknown>

function formatStructured(level: string, message: string, context?: LogContext): string {
  const safe = context && Object.keys(context).length > 0 ? maskSensitiveContext(context) : undefined
  if (!safe || Object.keys(safe).length === 0) return JSON.stringify({ level, message, ts: new Date().toISOString() })
  return JSON.stringify({ level, message, ...safe, ts: new Date().toISOString() })
}

/** P0-020：關鍵路徑（創建房間、支付等）在生產環境也輸出 info，供日誌聚合與追蹤 */
export const logger = {
  debug: (message: string, context?: LogContext) => {
    if (isDev) console.debug(formatStructured('debug', message, context))
  },
  info: (message: string, context?: LogContext) => {
    console.info(formatStructured('info', message, context))
  },
  warn: (message: string, context?: LogContext) => {
    console.warn(formatStructured('warn', message, context))
  },
  error: (message: string, context?: LogContext) => {
    console.error(formatStructured('error', message, context))
  },
}
