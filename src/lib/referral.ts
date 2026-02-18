/**
 * PAY-024: Referral reward system
 * Tracks referrals and applies rewards (free month for referrer, 50% off for referee).
 */

import { createServerClientOptional } from './supabase-server'
import { logger } from './logger'
import { REFERRAL_REWARD } from '@/config/pricing.config'

export interface ReferralInfo {
  referralCode: string
  referralCount: number
  maxReferrals: number
  rewardsEarned: number
}

/** Generate a unique referral code from user ID */
export function generateReferralCode(userId: string): string {
  return `CHR-${userId.slice(0, 8).toUpperCase()}`
}

/** Get referral stats for a user */
export async function getReferralInfo(userId: string): Promise<ReferralInfo | null> {
  const supabase = createServerClientOptional()
  if (!supabase) return null

  const code = generateReferralCode(userId)

  try {
    const { count } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .eq('status', 'completed')

    return {
      referralCode: code,
      referralCount: count ?? 0,
      maxReferrals: REFERRAL_REWARD.maxReferralsPerUser,
      rewardsEarned: (count ?? 0) * 1, // 1 free month per referral
    }
  } catch {
    return {
      referralCode: code,
      referralCount: 0,
      maxReferrals: REFERRAL_REWARD.maxReferralsPerUser,
      rewardsEarned: 0,
    }
  }
}

/** Record a referral when a new user signs up with a code */
export async function recordReferral(
  referralCode: string,
  refereeUserId: string
): Promise<{ success: boolean; referrerId?: string }> {
  const supabase = createServerClientOptional()
  if (!supabase) return { success: false }

  try {
    // Find referrer by code prefix (CHR-XXXXXXXX)
    const userIdPrefix = referralCode.replace('CHR-', '').toLowerCase()
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .ilike('id', `${userIdPrefix}%`)
      .limit(1)

    const referrerId = profiles?.[0]?.id
    if (!referrerId || referrerId === refereeUserId) return { success: false }

    // Check max referrals
    const { count } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', referrerId)

    if ((count ?? 0) >= REFERRAL_REWARD.maxReferralsPerUser) {
      return { success: false }
    }

    const { error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referee_id: refereeUserId,
        referral_code: referralCode,
        status: 'completed',
        created_at: new Date().toISOString(),
      })

    if (error) {
      logger.error('[referral] Failed to record', { error: error.message })
      return { success: false }
    }

    return { success: true, referrerId }
  } catch (e) {
    logger.error('[referral] recordReferral failed', { err: e instanceof Error ? e.message : String(e) })
    return { success: false }
  }
}
