'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SubscriptionTier } from '@/lib/subscription'
import { getStoredTier, setStoredTier, getStoredExpires } from '@/lib/subscription'

/**
 * 134 訂閱狀態檢查 hook：返回當前方案與到期日
 * 目前以 localStorage 為主（訪客/未串接 profile 時）；之後可改為從 API /auth/me 或 profile 讀取
 */
export function useSubscription(): {
  tier: SubscriptionTier
  expiresAt: string | null
  isLoading: boolean
  refetch: () => void
  setTier: (tier: SubscriptionTier, expiresAt?: string) => void
} {
  const [tier, setTierState] = useState<SubscriptionTier>('free')
  const [expiresAt, setExpiresAtState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(() => {
    setTierState(getStoredTier())
    setExpiresAtState(getStoredExpires())
  }, [])

  const setTier = useCallback((t: SubscriptionTier, exp?: string) => {
    setStoredTier(t, exp)
    setTierState(t)
    setExpiresAtState(exp ?? getStoredExpires())
  }, [])

  useEffect(() => {
    refetch()
    setIsLoading(false)
  }, [refetch])

  return { tier, expiresAt, isLoading, refetch, setTier }
}
