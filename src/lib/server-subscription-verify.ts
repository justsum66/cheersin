/**
 * P1-42: Server-side subscription tier verification
 * Validates that the subscription tier from the client matches the DB record.
 * Prevents users from spoofing their localStorage subscription tier.
 */
import type { SubscriptionTier } from './subscription'
import { SUBSCRIPTION_TIERS } from './subscription'

/**
 * Validate that a tier string is a legitimate SubscriptionTier
 */
export function isValidTier(tier: unknown): tier is SubscriptionTier {
  return typeof tier === 'string' && tier in SUBSCRIPTION_TIERS
}

/**
 * Resolve effective tier from DB profile, with fallback to 'free'
 * Checks expiration if expiresAt is provided
 */
export function resolveEffectiveTier(
  dbTier: string | null | undefined,
  expiresAt?: string | null
): SubscriptionTier {
  // Default to free
  if (!dbTier || !isValidTier(dbTier)) return 'free'

  // If paid tier, check if expired
  if (dbTier !== 'free' && expiresAt) {
    const expDate = new Date(expiresAt)
    if (!isNaN(expDate.getTime()) && expDate.getTime() < Date.now()) {
      // Subscription expired, downgrade to free
      return 'free'
    }
  }

  return dbTier
}

/**
 * Verify tier from client against DB and return the authoritative tier.
 * Use this in API routes that depend on subscription tier.
 *
 * @param claimedTier - Tier claimed by the client (from header or body)
 * @param dbTier - Tier from the database profile
 * @param expiresAt - Subscription expiration from DB
 * @returns { effectiveTier, mismatch } - The real tier + whether client was lying
 */
export function verifySubscriptionTier(
  claimedTier: string | undefined,
  dbTier: string | null | undefined,
  expiresAt?: string | null
): { effectiveTier: SubscriptionTier; mismatch: boolean } {
  const effectiveTier = resolveEffectiveTier(dbTier, expiresAt)
  const mismatch = !!claimedTier && claimedTier !== effectiveTier

  return { effectiveTier, mismatch }
}

/**
 * Check feature access for a given tier
 */
export function checkFeatureAccess(
  tier: SubscriptionTier,
  feature: 'proCourse' | 'noAds' | 'proBadge'
): boolean {
  const config = SUBSCRIPTION_TIERS[tier]
  if (!config) return false

  switch (feature) {
    case 'proCourse': return config.canAccessProCourse
    case 'noAds': return config.hasNoAds
    case 'proBadge': return config.hasProBadge
  }
}
