/**
 * TD-28：useSubscriptionStore 單元測試
 * mock @/lib/subscription 的 localStorage 存取函式
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the subscription localStorage helpers
vi.mock('@/lib/subscription', () => ({
    getStoredTier: vi.fn(() => 'free'),
    setStoredTier: vi.fn(),
    getStoredExpires: vi.fn(() => null),
}))

import { useSubscriptionStore } from '@/store/useSubscriptionStore'
import { getStoredTier, setStoredTier, getStoredExpires } from '@/lib/subscription'

describe('useSubscriptionStore', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useSubscriptionStore.setState({
            tier: 'free',
            expiresAt: null,
            isLoading: true,
        })
    })

    describe('initial state', () => {
        it('starts with free tier and loading true', () => {
            const state = useSubscriptionStore.getState()
            expect(state.tier).toBe('free')
            expect(state.expiresAt).toBeNull()
            expect(state.isLoading).toBe(true)
        })
    })

    describe('setTier', () => {
        it('updates tier and calls setStoredTier', () => {
            useSubscriptionStore.getState().setTier('premium', '2026-12-31')
            const state = useSubscriptionStore.getState()
            expect(state.tier).toBe('premium')
            expect(state.expiresAt).toBe('2026-12-31')
            expect(setStoredTier).toHaveBeenCalledWith('premium', '2026-12-31')
        })

        it('uses getStoredExpires when no expiresAt provided', () => {
            vi.mocked(getStoredExpires).mockReturnValue('2025-06-30')
            useSubscriptionStore.getState().setTier('basic')
            expect(useSubscriptionStore.getState().expiresAt).toBe('2025-06-30')
        })
    })

    describe('setLoading', () => {
        it('sets loading state', () => {
            useSubscriptionStore.getState().setLoading(false)
            expect(useSubscriptionStore.getState().isLoading).toBe(false)
        })
    })

    describe('refetch', () => {
        it('reads tier and expiry from storage', () => {
            vi.mocked(getStoredTier).mockReturnValue('premium')
            vi.mocked(getStoredExpires).mockReturnValue('2026-01-01')
            useSubscriptionStore.getState().refetch()
            const state = useSubscriptionStore.getState()
            expect(state.tier).toBe('premium')
            expect(state.expiresAt).toBe('2026-01-01')
            expect(getStoredTier).toHaveBeenCalled()
            expect(getStoredExpires).toHaveBeenCalled()
        })
    })
})
