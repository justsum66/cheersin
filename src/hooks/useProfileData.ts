import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useSupabase } from '@/hooks/useSupabase'
import { DEFAULT_PROFILE, type ProfileData, GAMES_STATS_KEY, WISHLIST_KEY } from '@/config/profile.config'
import { LEARN_PROGRESS_KEY } from '@/config/learn.config'
import { STORAGE_KEY as LAST_KNOWN_LEVEL_KEY } from '@/components/profile/LevelUpCelebration'
import { useTranslation } from '@/contexts/I18nContext'

export interface WishlistItem {
    id: string
    name: string
    type: string
}

export function useProfileData() {
    const { t } = useTranslation()
    const { user } = useUser()
    const supabase = useSupabase()

    const [profileLoading, setProfileLoading] = useState(true)
    const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE)
    const [soulWine, setSoulWine] = useState<{ name?: string; type?: string; traits?: Record<string, number> } | null>(null)
    const [learnProgress, setLearnProgress] = useState<Record<string, { completed: number; total: number }>>({})
    const [gamesPlayed, setGamesPlayed] = useState(0)
    const [wishlist, setWishlist] = useState<WishlistItem[]>([])
    const [showLevelUpCelebration, setShowLevelUpCelebration] = useState<number | null>(null)

    useEffect(() => {
        if (!user?.id || !supabase) {
            setProfileLoading(false)
            setProfileData(DEFAULT_PROFILE)
            return
        }
        setProfileLoading(true)
        void supabase
            .from('profiles')
            .select('xp, level, display_name')
            .eq('id', user.id)
            .maybeSingle()
            .then(({ data, error }) => {
                if (error) {
                    setProfileData(DEFAULT_PROFILE)
                    return
                }
                const level = typeof data?.level === 'number' ? data.level : 1
                const xp = typeof data?.xp === 'number' ? data.xp : 0
                const nextLevel = (level + 1) * 1000
                setProfileData({
                    xp,
                    level,
                    nextLevel,
                    displayName: data?.display_name ?? null,
                    reviewsGiven: 0,
                    winesTasted: 0,
                })
            })
            .then(() => setProfileLoading(false), () => setProfileLoading(false))
    }, [user?.id, supabase])

    useEffect(() => {
        if (profileLoading || typeof window === 'undefined') return
        const currentLevel = profileData.level
        try {
            const stored = localStorage.getItem(LAST_KNOWN_LEVEL_KEY)
            if (stored === null) {
                localStorage.setItem(LAST_KNOWN_LEVEL_KEY, String(currentLevel))
                return
            }
            const lastKnown = parseInt(stored, 10)
            if (Number.isFinite(lastKnown) && currentLevel > lastKnown) {
                setShowLevelUpCelebration(currentLevel)
            }
        } catch { /* ignore */ }
    }, [profileLoading, profileData.level])

    useEffect(() => {
        if (typeof window === 'undefined') return
        try {
            const soulRaw = localStorage.getItem('quiz-last-result')
            if (soulRaw) {
                setSoulWine(JSON.parse(soulRaw))
            }
            const learnRaw = localStorage.getItem(LEARN_PROGRESS_KEY)
            if (learnRaw) {
                const parsed = JSON.parse(learnRaw)
                if (typeof parsed === 'object' && parsed !== null) setLearnProgress(parsed)
            }
            const gamesRaw = localStorage.getItem(GAMES_STATS_KEY)
            if (gamesRaw) {
                const n = parseInt(gamesRaw, 10)
                if (Number.isFinite(n)) setGamesPlayed(n)
            }
            const wishlistRaw = localStorage.getItem(WISHLIST_KEY)
            if (wishlistRaw) {
                const parsed = JSON.parse(wishlistRaw) as { id: string; name?: string; type?: string; content?: string }[]
                const normalized = (Array.isArray(parsed) ? parsed : []).map((item) => ({
                    id: item.id,
                    name: item.name ?? item.content?.slice(0, 80) ?? t('profile.recommendFallback'),
                    type: item.type ?? t('profile.recommendFallback'),
                }))
                setWishlist(normalized)
            }
        } catch { /* ignore */ }
    }, [t])

    const removeFromWishlist = (id: string) => {
        setWishlist((prev) => prev.filter((w) => w.id !== id))
        try {
            const raw = localStorage.getItem(WISHLIST_KEY)
            const list: { id: string }[] = raw ? JSON.parse(raw) : []
            const next = list.filter((item) => item.id !== id)
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(next))
        } catch { /* ignore */ }
    }

    const handleWishlistReorder = (newOrder: WishlistItem[]) => {
        setWishlist(newOrder)
        try {
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(newOrder))
        } catch { /* ignore */ }
    }

    return {
        profileLoading,
        profileData,
        soulWine,
        learnProgress,
        gamesPlayed,
        wishlist,
        showLevelUpCelebration,
        setShowLevelUpCelebration,
        removeFromWishlist,
        handleWishlistReorder,
    }
}
