/**
 * R2-028：Upstash Redis 限流 — 多實例一致，Chat 等 API 可選用
 * 當 UPSTASH_REDIS_REST_URL 與 UPSTASH_REDIS_REST_TOKEN 已設定時啟用
 */
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { RateLimitResult } from './rate-limit'

let redis: Redis | null = null
let limiterFree: Ratelimit | null = null
let limiterPro: Ratelimit | null = null

function getRedis(): Redis | null {
  if (redis !== null) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) return null
  try {
    redis = new Redis({ url, token })
    return redis
  } catch {
    return null
  }
}

/** 取得 Chat 用限流器（Free 10/分、Pro 60/分），未設定 Redis 時回傳 null */
function getChatLimiters(): { free: Ratelimit; pro: Ratelimit } | null {
  const r = getRedis()
  if (!r) return null
  if (limiterFree === null) {
    limiterFree = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      prefix: 'rl:chat:free',
    })
  }
  if (limiterPro === null) {
    limiterPro = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(60, '60 s'),
      prefix: 'rl:chat:pro',
    })
  }
  return { free: limiterFree, pro: limiterPro }
}

export interface RateLimitUpstashConfig {
  windowMs?: number
  max?: number
  /** 若為 'pro' 使用 60/分，否則 10/分（與 chat 一致） */
  tier?: 'free' | 'pro'
}

/**
 * 使用 Upstash Redis 做限流，回傳與 rate-limit.ts 相同的 RateLimitResult
 * 僅支援 Chat 情境（tier free/pro）；Redis 未設定時回傳 null，呼叫端改走 in-memory
 */
export async function checkRateLimitUpstash(
  identifier: string,
  config: RateLimitUpstashConfig & { tier: 'free' | 'pro' }
): Promise<RateLimitResult | null> {
  const limiters = getChatLimiters()
  if (!limiters) return null
  const limiter = config.tier === 'pro' ? limiters.pro : limiters.free
  try {
    const res = await limiter.limit(identifier)
    return {
      success: res.success,
      limit: res.limit,
      remaining: res.remaining,
      resetAt: res.reset,
    }
  } catch {
    return null
  }
}

/** 是否已設定 Upstash Redis（可用於決定是否呼叫 checkRateLimitUpstash） */
export function hasUpstashRedis(): boolean {
  return getRedis() !== null
}
