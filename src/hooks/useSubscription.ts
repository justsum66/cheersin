'use client'

import { useEffect } from 'react'
import type { SubscriptionTier } from '@/lib/subscription'
import { useSubscriptionStore } from '@/stores/subscriptionStore'

/**
 * 134 訂閱狀態檢查 hook：返回當前方案與到期日
 * R2-003：狀態來自 useSubscriptionStore，與 localStorage 同步
 */
export function useSubscription(): {
  tier: SubscriptionTier
  expiresAt: string | null
  isLoading: boolean
  refetch: () => void
  setTier: (tier: SubscriptionTier, expiresAt?: string) => void
} {
  const tier = useSubscriptionStore((s) => s.tier)
  const expiresAt = useSubscriptionStore((s) => s.expiresAt)
  const isLoading = useSubscriptionStore((s) => s.isLoading)
  const refetch = useSubscriptionStore((s) => s.refetch)
  const setTier = useSubscriptionStore((s) => s.setTier)

  useEffect(() => {
    refetch()
    useSubscriptionStore.getState().setLoading(false)
  }, [refetch])

  return { tier, expiresAt, isLoading, refetch, setTier }
}
