/**
 * P2-297 / P3-470：Sentry 客戶端初始化（錯誤與效能監控）
 * DSN 由 NEXT_PUBLIC_SENTRY_DSN 或 SENTRY_DSN 提供，未設定則不送事件。
 */
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
    enableLogs: true,
    integrations: [
      Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
    ],
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
