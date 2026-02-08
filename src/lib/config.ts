/**
 * P2-319：後端配置中心化 — 限流、緩存、功能開關等可由此讀取
 * 目前以環境變數為主；可擴充為遠端 config 或 feature flags
 */

const env: Record<string, string | undefined> =
  typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>) : {}

/** API 限流：每分鐘每 IP 允許的請求數（依類型） */
export const rateLimitConfig = {
  createRoom: Number(env['RATE_LIMIT_CREATE_ROOM']) || 10,
  apiGeneral: Number(env['RATE_LIMIT_API_GENERAL']) || 60,
}

/** 緩存 TTL（秒） */
export const cacheTtl = {
  gamesList: Number(env['CACHE_TTL_GAMES_LIST']) || 60,
  coursesList: Number(env['CACHE_TTL_COURSES_LIST']) || 300,
}

/** 是否啟用結構化 API 請求日誌（開發/預覽） */
export const isApiRequestLogEnabled =
  env['NODE_ENV'] === 'development' || env['VERCEL_ENV'] === 'preview'
