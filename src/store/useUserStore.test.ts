/**
 * TD-28：useUserStore 單元測試
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useUserStore } from '@/store/useUserStore'
import type { UserProfile, UserProfileDetail } from '@/store/useUserStore'

describe('useUserStore', () => {
    beforeEach(() => {
        useUserStore.setState({
            user: null,
            profile: null,
            subscription: null,
            isLoading: true,
        })
    })

    describe('initial state', () => {
        it('starts with null user and loading true', () => {
            const state = useUserStore.getState()
            expect(state.user).toBeNull()
            expect(state.profile).toBeNull()
            expect(state.subscription).toBeNull()
            expect(state.isLoading).toBe(true)
        })
    })

    describe('setUser', () => {
        const mockUser: UserProfile = {
            id: 'u1',
            email: 'test@example.com',
            name: 'Test User',
            avatarUrl: 'https://example.com/avatar.png',
        }

        it('sets user', () => {
            useUserStore.getState().setUser(mockUser)
            expect(useUserStore.getState().user).toEqual(mockUser)
        })

        it('clears user with null', () => {
            useUserStore.getState().setUser(mockUser)
            useUserStore.getState().setUser(null)
            expect(useUserStore.getState().user).toBeNull()
        })
    })

    describe('setProfile', () => {
        const mockProfile: UserProfileDetail = {
            id: 'u1',
            email: 'test@example.com',
            display_name: 'Test User',
            subscription_tier: 'premium',
            created_at: '2025-01-01',
            updated_at: '2025-06-01',
        }

        it('sets profile', () => {
            useUserStore.getState().setProfile(mockProfile)
            expect(useUserStore.getState().profile).toEqual(mockProfile)
        })

        it('clears profile with null', () => {
            useUserStore.getState().setProfile(mockProfile)
            useUserStore.getState().setProfile(null)
            expect(useUserStore.getState().profile).toBeNull()
        })
    })

    describe('setSubscription', () => {
        it('sets subscription', () => {
            const sub = {
                planId: 'premium',
                status: 'active' as const,
                currentPeriodEnd: 1700000000,
                cancelAtPeriodEnd: false,
            }
            useUserStore.getState().setSubscription(sub)
            expect(useUserStore.getState().subscription).toEqual(sub)
        })
    })

    describe('setLoading', () => {
        it('sets loading state', () => {
            useUserStore.getState().setLoading(false)
            expect(useUserStore.getState().isLoading).toBe(false)
        })
    })

    describe('logout', () => {
        it('clears user, profile, and subscription', () => {
            useUserStore.getState().setUser({ id: 'u1', email: 'a@b.com' })
            useUserStore.getState().setProfile({
                id: 'u1',
                email: 'a@b.com',
                display_name: 'A',
                subscription_tier: 'free',
                created_at: null,
                updated_at: null,
            })
            useUserStore.getState().setSubscription({
                planId: 'basic',
                status: 'active',
                currentPeriodEnd: null,
                cancelAtPeriodEnd: false,
            })
            useUserStore.getState().logout()
            const state = useUserStore.getState()
            expect(state.user).toBeNull()
            expect(state.profile).toBeNull()
            expect(state.subscription).toBeNull()
        })
    })
})
