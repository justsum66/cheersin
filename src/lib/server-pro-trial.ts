/**
 * P1-44: Server-side Pro trial validation
 * Prevents client-side manipulation of Pro trial counts.
 * Uses in-memory tracking (upgradeable to Redis/Supabase).
 */

/** Pro trial limit per month for free users */
const PRO_TRIAL_LIMIT_PER_MONTH = 3

interface TrialEntry {
  count: number
  monthKey: string
}

const trialMap = new Map<string, TrialEntry>()

function getCurrentMonthKey(): string {
  return new Date().toISOString().slice(0, 7) // "2026-02"
}

/**
 * Get server-side Pro trial usage for a user this month
 */
export function getServerProTrialCount(userId: string): number {
  const monthKey = getCurrentMonthKey()
  const entry = trialMap.get(userId)
  if (!entry || entry.monthKey !== monthKey) return 0
  return entry.count
}

/**
 * Increment Pro trial usage (server-side)
 * Returns updated count
 */
export function incrementServerProTrialCount(userId: string): number {
  const monthKey = getCurrentMonthKey()
  const entry = trialMap.get(userId)

  if (!entry || entry.monthKey !== monthKey) {
    trialMap.set(userId, { count: 1, monthKey })
    return 1
  }

  entry.count += 1
  return entry.count
}

/**
 * Check if a free user can still use Pro trial this month (server-side)
 */
export function canUseServerProTrial(userId: string): {
  allowed: boolean
  used: number
  remaining: number
  limit: number
} {
  const used = getServerProTrialCount(userId)
  const remaining = Math.max(0, PRO_TRIAL_LIMIT_PER_MONTH - used)
  return {
    allowed: used < PRO_TRIAL_LIMIT_PER_MONTH,
    used,
    remaining,
    limit: PRO_TRIAL_LIMIT_PER_MONTH,
  }
}

/**
 * Cleanup old month entries to prevent memory leak
 */
export function cleanupExpiredTrialEntries(): number {
  const monthKey = getCurrentMonthKey()
  let cleaned = 0
  for (const [key, entry] of trialMap.entries()) {
    if (entry.monthKey !== monthKey) {
      trialMap.delete(key)
      cleaned++
    }
  }
  return cleaned
}
