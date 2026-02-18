/**
 * API Rate Limiting 工具
 * 基於記憶體的簡易限流實作（適合單一 serverless 實例）
 * 生產環境建議使用 Redis (Upstash) 進行分散式限流
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()
/** T29: 防止 DDoS 攻擊導致 store 記憶體爆炸 — 超過此上限後強制清理 */
const MAX_STORE_SIZE = 50_000

export interface RateLimitConfig {
  /** 時間窗口內最大請求數 */
  maxRequests: number
  /** 時間窗口（毫秒） */
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  /** 此窗口的最大請求數（Upstash 回傳時帶有） */
  limit?: number
  remaining: number
  resetAt: number
  retryAfter?: number
}

/** T23: 凍結所有匯出的配置物件，防止被意外修改 */
/** 預設配置：10 秒內最多 10 次請求 */
export const DEFAULT_RATE_LIMIT: Readonly<RateLimitConfig> = Object.freeze({
  maxRequests: 10,
  windowMs: 10 * 1000,
})

/** AI API 配置：60 秒內最多 20 次請求 */
export const AI_RATE_LIMIT: Readonly<RateLimitConfig> = Object.freeze({
  maxRequests: 20,
  windowMs: 60 * 1000,
})

/** 認證 API 配置：60 秒內最多 5 次請求 */
export const AUTH_RATE_LIMIT: Readonly<RateLimitConfig> = Object.freeze({
  maxRequests: 5,
  windowMs: 60 * 1000,
})

/**
 * 檢查是否超過速率限制
 * @param key 限流鍵（通常是 IP 或 user ID）
 * @param config 限流配置
 * @returns 限流結果
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // 清理過期的 entry
  if (entry && now >= entry.resetAt) {
    rateLimitStore.delete(key)
  }

  const currentEntry = rateLimitStore.get(key)

  if (!currentEntry) {
    // T29: store 超過上限時強制清理過期記錄
    if (rateLimitStore.size >= MAX_STORE_SIZE) {
      cleanupExpiredEntries()
      // 仍然超過上限？丟棄最舊的 20% 記錄
      if (rateLimitStore.size >= MAX_STORE_SIZE) {
        const toDrop = Math.floor(MAX_STORE_SIZE * 0.2)
        let dropped = 0
        for (const k of rateLimitStore.keys()) {
          if (dropped >= toDrop) break
          rateLimitStore.delete(k)
          dropped++
        }
      }
    }
    // 首次請求，建立新 entry
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    }
  }

  if (currentEntry.count >= config.maxRequests) {
    // 超過限制
    return {
      success: false,
      remaining: 0,
      resetAt: currentEntry.resetAt,
      retryAfter: Math.ceil((currentEntry.resetAt - now) / 1000),
    }
  }

  // 在限制內，增加計數
  currentEntry.count += 1
  return {
    success: true,
    remaining: config.maxRequests - currentEntry.count,
    resetAt: currentEntry.resetAt,
  }
}

/**
 * T24: 取得用戶端 IP — 優先使用 Cloudflare/Vercel 設定的可信 header
 * cf-connecting-ip > x-real-ip > x-forwarded-for (first)
 * @param headers Request headers
 * @returns IP 地址
 */
export function getClientIP(headers: Headers): string {
  // cf-connecting-ip 由 Cloudflare 設定，客戶端無法偽造
  const cfIp = headers.get('cf-connecting-ip')
  if (cfIp) return cfIp.trim()
  // x-real-ip 由反向代理（Nginx/Vercel）設定
  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  // x-forwarded-for 可被偽造，但 Vercel 部署時第一個 IP 是可信的
  const xff = headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() || 'unknown'
  return 'unknown'
}

/**
 * T41: 建立限流回應 — 統一 { success, error: { code, message } } 格式
 * @param result 限流結果
 * @returns Response 物件
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: '請求過於頻繁，請稍後再試',
      },
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.resetAt),
        'Retry-After': String(result.retryAfter || 10),
      },
    }
  )
}

/**
 * 定期清理過期的限流記錄（防止記憶體洩漏）
 * 建議在 serverless 環境中使用 cron 或在請求時觸發
 */
export function cleanupExpiredEntries(): number {
  const now = Date.now()
  let cleaned = 0
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key)
      cleaned++
    }
  }
  return cleaned
}

/** 自動清理：每 60 秒清理過期記錄，防止記憶體無限成長 */
const CLEANUP_INTERVAL_MS = 60_000
let cleanupTimer: ReturnType<typeof setInterval> | null = null

function ensureCleanupTimer(): void {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    cleanupExpiredEntries()
    // 如果 store 已空，停止 timer 避免佔用資源
    if (rateLimitStore.size === 0 && cleanupTimer) {
      clearInterval(cleanupTimer)
      cleanupTimer = null
    }
  }, CLEANUP_INTERVAL_MS)
  // 允許 Node.js 在 timer 還在時正常退出
  if (typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref()
  }
}

/** 各路由專屬限流配置 */
const ROUTE_RATE_LIMITS: Record<string, RateLimitConfig> = Object.freeze({
  subscription: { maxRequests: 20, windowMs: 60_000 },
  upload: { maxRequests: 10, windowMs: 60_000 },
  create: { maxRequests: 10, windowMs: 60_000 },
  join: { maxRequests: 30, windowMs: 60_000 },
  game_state: { maxRequests: 60, windowMs: 60_000 },
  report: { maxRequests: 5, windowMs: 60_000 },
  recommend: { maxRequests: 20, windowMs: 60_000 },
  /** P0-16~25: 新增缺失的限流配置 */
  chat_feedback: { maxRequests: 30, windowMs: 60_000 },
  learn_notes: { maxRequests: 30, windowMs: 60_000 },
  learn_progress: { maxRequests: 30, windowMs: 60_000 },
  learn_certificate: { maxRequests: 10, windowMs: 60_000 },
  learn_discussions: { maxRequests: 20, windowMs: 60_000 },
  learn_tasting_notes: { maxRequests: 20, windowMs: 60_000 },
  analytics: { maxRequests: 60, windowMs: 60_000 },
  push_subscribe: { maxRequests: 10, windowMs: 60_000 },
  auto_tag: { maxRequests: 10, windowMs: 60_000 },
  generate_invitation: { maxRequests: 20, windowMs: 60_000 },
  admin: { maxRequests: 30, windowMs: 60_000 },
  onesignal: { maxRequests: 10, windowMs: 60_000 },
  /** PAY-004: PayPal Webhook — 60秒內最多100次請求 */
  paypal_webhook: { maxRequests: 100, windowMs: 60_000 },
})

/**
 * 非同步限流檢查（相容各路由既有呼叫方式）
 * @param key 限流鍵（通常是 IP）
 * @param context 路由用途（如 'subscription'、'upload'），對應 ROUTE_RATE_LIMITS
 * @returns 是否已被限流（true = 超過限制）
 */
export async function isRateLimitedAsync(
  key: string,
  context: string
): Promise<boolean> {
  ensureCleanupTimer()
  const config = ROUTE_RATE_LIMITS[context] ?? DEFAULT_RATE_LIMIT
  const compositeKey = `${context}:${key}`
  const result = checkRateLimit(compositeKey, config)
  return !result.success
}

/**
 * getClientIp — 小寫別名，與多數路由 import 一致
 * 保留 getClientIP 以維持向後相容
 */
export const getClientIp = getClientIP
