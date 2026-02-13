/**
 * G197 / P2-24 / R2-027：結構化日誌 — 使用 pino
 * P3-58：context 傳入前經 maskSensitiveContext，不記錄 password、token 等敏感欄位
 * P3-57：context 可含 requestId、userId、durationMs，供日誌聚合與追蹤
 */
import pino from 'pino'
import { maskSensitiveContext } from './mask-context'

const isDev = process.env.NODE_ENV === 'development'

const pinoLogger = pino({
  level: isDev ? 'debug' : 'info',
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard' },
    },
  }),
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

/** R2-027：結構化日誌，支援 requestId、userId、durationMs、錯誤堆疊 */
export const logger = {
  debug: (message: string, context?: LogContext) => {
    pinoLogger.debug(toBindings(context), message)
  },
  info: (message: string, context?: LogContext) => {
    pinoLogger.info(toBindings(context), message)
  },
  warn: (message: string, context?: LogContext) => {
    pinoLogger.warn(toBindings(context), message)
  },
  error: (message: string, context?: LogContext) => {
    const bindings = toBindings(context)
    if (context?.err instanceof Error && context.err.stack) {
      bindings.stack = context.err.stack
    }
    pinoLogger.error(bindings, message)
  },
}
