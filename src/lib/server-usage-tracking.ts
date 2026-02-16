/**
 * P1-41: Server-side AI usage tracking
 * Complement to client-side localStorage counting in subscription.ts
 * Uses in-memory Map with daily key rotation (can be upgraded to Redis/Supabase)
 *
 * Prevents client-side manipulation of AI call limits by maintaining
 * a parallel server-side counter keyed by user ID + date.
 */

interface UsageEntry {
  count: number
  resetAt: number
}

const DAY_MS = 86_400_000
const usageMap = new Map<string, UsageEntry>()

/** Build composite key: userId + today's date */
function buildKey(userId: string): string {
  const today = new Date().toISOString().slice(0, 10)
  return `${userId}:${today}`
}

/**
 * Get current AI call count for a user today (server-side)
 */
export function getServerAiCallCount(userId: string): number {
  const key = buildKey(userId)
  const entry = usageMap.get(key)
  if (!entry || Date.now() >= entry.resetAt) return 0
  return entry.count
}

/**
 * Increment AI call count for a user (server-side)
 * Returns the new count after increment
 */
export function incrementServerAiCallCount(userId: string): number {
  const key = buildKey(userId)
  const now = Date.now()
  const entry = usageMap.get(key)

  if (!entry || now >= entry.resetAt) {
    // Start new day window
    const tomorrow = new Date()
    tomorrow.setUTCHours(0, 0, 0, 0)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    usageMap.set(key, { count: 1, resetAt: tomorrow.getTime() })
    return 1
  }

  entry.count += 1
  return entry.count
}

/**
 * Check if a user can make an AI call based on their tier
 * @param userId - Authenticated user ID
 * @param maxCalls - Maximum calls per day for the user's tier (-1 for unlimited)
 * @returns { allowed, remaining, used }
 */
export function checkServerAiUsage(
  userId: string,
  maxCalls: number
): { allowed: boolean; remaining: number; used: number } {
  if (maxCalls < 0) return { allowed: true, remaining: -1, used: getServerAiCallCount(userId) }
  const used = getServerAiCallCount(userId)
  const remaining = Math.max(0, maxCalls - used)
  return { allowed: used < maxCalls, remaining, used }
}

/**
 * Cleanup expired entries to prevent memory leak
 * Call periodically (e.g., every hour via setInterval or cron)
 */
export function cleanupExpiredUsageEntries(): number {
  const now = Date.now()
  let cleaned = 0
  for (const [key, entry] of usageMap.entries()) {
    if (now >= entry.resetAt) {
      usageMap.delete(key)
      cleaned++
    }
  }
  return cleaned
}
