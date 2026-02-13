import { create } from 'zustand'

export interface UserProfile {
    id: string
    email: string
    name?: string
    avatarUrl?: string
}

interface Subscription {
    planId: string
    status: 'active' | 'canceled' | 'past_due' | 'trialing'
    currentPeriodEnd: number | null
    cancelAtPeriodEnd: boolean
}

interface UserStore {
    user: UserProfile | null
    profile: any | null // Replace 'any' with your Profile type
    subscription: Subscription | null
    isLoading: boolean

    setUser: (user: UserProfile | null) => void
    setProfile: (profile: any) => void
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
