/**
 * G197 / P2-24 / R2-027：結構化日誌 — 使用 pino
 * P3-58：context 傳入前經 maskSensitiveContext，不記錄 password、token 等敏感欄位
 * P3-57：context 可含 requestId、userId、durationMs，供日誌聚合與追蹤
 * Dev 不使用 worker transport，避免 Next.js 重編後 "the worker has exited" 導致 uncaughtException
 */
import pino from 'pino'
import { maskSensitiveContext } from './mask-context'

const isDev = process.env.NODE_ENV === 'development'

/** Dev 僅用同步 destination，避免 pino-pretty worker 在 Next dev 中退出後拋錯 */
const pinoLogger = pino({
  level: isDev ? 'debug' : 'info',
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isDev
    ? { transport: undefined }
    : {}),
})

export type LogContext = Record<string, unknown>

function toBindings(context?: LogContext): Record<string, unknown> {
  if (!context || Object.keys(context).length === 0) return {}
  const safe = maskSensitiveContext(context)
  for (const v of Object.values(context)) {
    if (v instanceof Error && v.stack) {
      safe.stack = v.stack
      break
    }
  }
  return safe
}

/** 防止 pino worker 退出後呼叫拋出 uncaughtException（Next dev 重編等） */
function safeLog(
  fn: (bindings: Record<string, unknown>, msg: string) => void,
  message: string,
  context?: LogContext
): void {
  try {
    const bindings = toBindings(context)
    fn(bindings, message)
  } catch (_) {
    if (isDev && typeof console !== 'undefined') {
      console.debug('[logger]', message, context ?? '')
    }
  }
}

/** R2-027：結構化日誌，支援 requestId、userId、durationMs、錯誤堆疊 */
export const logger = {
  debug: (message: string, context?: LogContext) => {
    safeLog(pinoLogger.debug.bind(pinoLogger), message, context)
  },
  info: (message: string, context?: LogContext) => {
    safeLog(pinoLogger.info.bind(pinoLogger), message, context)
  },
  warn: (message: string, context?: LogContext) => {
    safeLog(pinoLogger.warn.bind(pinoLogger), message, context)
  },
  error: (message: string, context?: LogContext) => {
    try {
      const bindings = toBindings(context)
      if (context?.err instanceof Error && context.err.stack) {
        bindings.stack = context.err.stack
      }
      pinoLogger.error(bindings, message)
    } catch (_) {
      if (typeof console !== 'undefined') {
        console.error('[logger]', message, context ?? '')
      }
    }
  },
}
