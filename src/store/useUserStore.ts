import { create } from 'zustand'

export interface UserProfile {
    id: string
    email: string
    name?: string
    avatarUrl?: string
}

/** Supabase profiles 表對應的詳細使用者資料 */
export interface UserProfileDetail {
    id: string
    email: string | null
    display_name: string | null
    subscription_tier: string | null
    created_at: string | null
    updated_at: string | null
}

interface Subscription {
    planId: string
    status: 'active' | 'canceled' | 'past_due' | 'trialing'
    currentPeriodEnd: number | null
    cancelAtPeriodEnd: boolean
}

interface UserStore {
    user: UserProfile | null
    profile: UserProfileDetail | null
    subscription: Subscription | null
    isLoading: boolean

    setUser: (user: UserProfile | null) => void
    setProfile: (profile: UserProfileDetail | null) => void
    setSubscription: (sub: Subscription | null) => void
    setLoading: (loading: boolean) => void
    logout: () => void
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    profile: null,
    subscription: null,
    isLoading: true,

    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setSubscription: (subscription) => set({ subscription }),
    setLoading: (isLoading) => set({ isLoading }),

    logout: () => set({ user: null, profile: null, subscription: null })
}))
