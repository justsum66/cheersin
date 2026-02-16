import { useSubscription } from '@/hooks/useSubscription'
import { FREE_TIER_LIMITS, PRO_TIER_LIMITS, STORAGE_KEYS } from '@/config/limits.config'
import { useEffect, useState } from 'react'

export function useLimits() {
    const { tier } = useSubscription()
    const isPro = tier === 'premium'

    const limits = isPro ? PRO_TIER_LIMITS : FREE_TIER_LIMITS

    // Daily AI Usage
    const [dailyAiCount, setDailyAiCount] = useState(0)

    useEffect(() => {
        // Load daily count
        const today = new Date().toISOString().split('T')[0]
        const storedDate = localStorage.getItem(STORAGE_KEYS.DAILY_AI_DATE)
        const storedCount = parseInt(localStorage.getItem(STORAGE_KEYS.DAILY_AI_COUNT) || '0', 10)

        if (storedDate !== today) {
            // Reset if new day
            localStorage.setItem(STORAGE_KEYS.DAILY_AI_DATE, today)
            localStorage.setItem(STORAGE_KEYS.DAILY_AI_COUNT, '0')
            setDailyAiCount(0)
        } else {
            setDailyAiCount(storedCount)
        }
    }, [])

    const incrementAiUsage = () => {
        const newCount = dailyAiCount + 1
        localStorage.setItem(STORAGE_KEYS.DAILY_AI_COUNT, newCount.toString())
        setDailyAiCount(newCount)
    }

    const checkAiLimit = () => {
        if (dailyAiCount >= limits.DAILY_AI_MESSAGES) {
            return false
        }
        return true
    }

    return {
        limits,
        isPro,
        dailyAiCount,
        incrementAiUsage,
        checkAiLimit,
        remainingAi: Math.max(0, limits.DAILY_AI_MESSAGES - dailyAiCount),
    }
}
