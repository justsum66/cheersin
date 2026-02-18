/**
 * R2-003：Zustand 訂閱狀態，與 useSubscription 並存；hook 可改為讀此 store + localStorage 持久化
 * Task #52: Added devtools middleware for dev debugging
 */
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { SubscriptionTier } from '@/lib/subscription'
import { getStoredTier, setStoredTier, getStoredExpires } from '@/lib/subscription'

interface SubscriptionState {
    tier: SubscriptionTier
    expiresAt: string | null
    isLoading: boolean
    setTier: (tier: SubscriptionTier, expiresAt?: string) => void
    setLoading: (v: boolean) => void
    refetch: () => void
}

export const useSubscriptionStore = create<SubscriptionState>()(devtools((set) => ({
    tier: 'free',
    expiresAt: null,
    isLoading: true,
    setTier: (tier, expiresAt) => {
        setStoredTier(tier, expiresAt)
        set({
            tier,
            expiresAt: expiresAt ?? getStoredExpires(),
        })
    },
    setLoading: (isLoading) => set({ isLoading }),
    refetch: () => {
        set({
            tier: getStoredTier(),
            expiresAt: getStoredExpires(),
        })
    },
}), { name: 'SubscriptionStore', enabled: process.env.NODE_ENV !== 'production' }))
