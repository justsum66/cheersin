import { useState, useEffect, useRef } from 'react'
import { logger } from '@/lib/logger'

/**
 * 通用遊戲持久化 Hook
 * @param key localStorage key prefix (will be prefixed with 'game_save_')
 * @param initialState Initial state if no saved state found
 * @param ttl Time to live in milliseconds (default 1 hour)
 */
export function useGamePersistence<T>(key: string, initialState: T, ttl: number = 3600000) {
    const [state, setState] = useState<T>(initialState)
    const [isLoaded, setIsLoaded] = useState(false)
    const isFirstMount = useRef(true)

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const storageKey = `game_save_${key}`
            const saved = localStorage.getItem(storageKey)
            if (saved) {
                const parsed = JSON.parse(saved)
                // Check TTL and data integrity
                if (parsed?.timestamp && parsed?.data !== undefined && Date.now() - parsed.timestamp < ttl) {
                    setState(parsed.data)
                } else {
                    localStorage.removeItem(storageKey)
                }
            }
        } catch (e) {
            // OPT-025: Graceful recovery from corrupted JSON
            try { localStorage.removeItem(`game_save_${key}`) } catch { /* ignore */ }
            logger.warn('[useGamePersistence] load error (corrupted data cleared)', { err: e instanceof Error ? e.message : String(e) })
        } finally {
            setIsLoaded(true)
            isFirstMount.current = false
        }
    }, [key, ttl])

    // Save to localStorage on change
    useEffect(() => {
        if (isFirstMount.current) return

        try {
            const storageKey = `game_save_${key}`
            const payload = {
                data: state,
                timestamp: Date.now()
            }
            localStorage.setItem(storageKey, JSON.stringify(payload))
        } catch (e) {
            // OPT-026: Handle QuotaExceededError gracefully
            logger.warn('[useGamePersistence] save error', { err: e instanceof Error ? e.message : String(e) })
        }
    }, [key, state])

    // Helper to clear save
    const clearSave = () => {
        localStorage.removeItem(`game_save_${key}`)
        setState(initialState)
    }

    return [state, setState, isLoaded, clearSave] as const
}
