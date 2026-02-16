'use client'

import { useState } from 'react'
import Link from 'next/link'
import { m, AnimatePresence } from 'framer-motion'
import { User, ChevronRight, Pencil } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { useUser } from '@/contexts/UserContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useProfileData } from '@/hooks/useProfileData'
import { LevelUpCelebration } from '@/components/profile/LevelUpCelebration'
import { ProfileSidebar } from '@/components/profile/ProfileSidebar'
import { ProfileStats } from '@/components/profile/ProfileStats'
import { ProfileLevelPath } from '@/components/profile/ProfileLevelPath'
import { ProfileSoulWine } from '@/components/profile/ProfileSoulWine'
import { ProfileGamesStats } from '@/components/profile/ProfileGamesStats'
import { ProfileAchievements } from '@/components/profile/ProfileAchievements'
import { ProfileWishlist } from '@/components/profile/ProfileWishlist'
import { ReferralCard } from '@/components/profile/ReferralCard'
import { GlassCard } from '@/components/ui/GlassCard'

export default function ProfilePage() {
    const { t } = useTranslation()
    const { user, isLoading: authLoading } = useUser()
    const prefersReducedMotion = usePrefersReducedMotion()

    const {
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
    } = useProfileData()

    /** E70 編輯模式：頂部「編輯」切換 */
    const [editMode, setEditMode] = useState(false)

    /** P0-025：未登入時顯示 empty 狀態，不顯示 Mock */
    if (!authLoading && !user) {
        return (
            <main className="min-h-screen pt-0 pb-16 px-4 overflow-hidden relative safe-area-px safe-area-pb page-container-mobile flex flex-col items-center justify-center" role="main" aria-label={t('profile.mainAria')}>
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-900/10 to-transparent pointer-events-none" />
                <div className="relative z-10 text-center max-w-md px-4">
                    <User className="w-16 h-16 text-white/30 mx-auto mb-4" aria-hidden />
                    <h1 className="text-xl font-bold text-white mb-2">{t('profile.loginToView')}</h1>
                    <p className="text-white/60 text-sm mb-6">{t('profile.loginToViewDesc')}</p>
                    <Link href="/login" className="btn-primary inline-flex items-center gap-2 min-h-[48px] px-6 py-3 games-focus-ring rounded-xl">
                        {t('profile.goLogin')}
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </main>
        )
    }

    /** P0-025：載入 profile 時顯示 loading */
    if (profileLoading && user) {
        return (
            <main className="min-h-screen pt-0 pb-16 px-4 overflow-hidden relative safe-area-px safe-area-pb page-container-mobile flex flex-col items-center justify-center" role="main" aria-label={t('profile.mainAria')}>
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-900/10 to-transparent pointer-events-none" />
                <div className="relative z-10 text-center">
                    <div className="w-12 h-12 border-2 border-primary-500/50 border-t-primary-400 rounded-full animate-spin mx-auto mb-4" aria-hidden />
                    <p className="text-white/70 text-sm">{t('profile.loadingProfile')}</p>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen pt-0 pb-16 px-4 overflow-hidden relative safe-area-px safe-area-pb page-container-mobile" role="main" aria-label={t('profile.mainAria')}>
            <AnimatePresence>
                {showLevelUpCelebration != null && (
                    <LevelUpCelebration
                        key="level-up"
                        level={showLevelUpCelebration}
                        onComplete={() => setShowLevelUpCelebration(null)}
                        prefersReducedMotion={prefersReducedMotion}
                    />
                )}
            </AnimatePresence>
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-900/10 to-transparent pointer-events-none" />

            <div className="max-w-6xl xl:max-w-[1440px] mx-auto relative z-10">
                {/* E70 編輯模式：頂部「編輯」按鈕切換 */}
                <div className="flex justify-end mb-4">
                    <m.button
                        type="button"
                        onClick={() => setEditMode((v) => !v)}
                        className="flex items-center gap-2 min-h-[48px] px-4 rounded-xl text-sm font-medium border border-white/20 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors games-focus-ring"
                        aria-pressed={editMode}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Pencil className="w-4 h-4" />
                        <AnimatePresence mode="wait">
                            <m.span key={editMode ? 'done' : 'edit'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                                {editMode ? t('profile.done') : t('profile.edit')}
                            </m.span>
                        </AnimatePresence>
                    </m.button>
                </div>
                <AnimatePresence mode="wait">
                    <m.div
                        key={editMode ? 'edit' : 'view'}
                        initial={{ opacity: 0.92 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0.92 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Sidebar / Identity Card */}
                        <ProfileSidebar profileData={profileData} editMode={editMode} />

                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <ReferralCard />
                            <ProfileStats
                                winesTasted={profileData.winesTasted}
                                level={profileData.level}
                                xp={profileData.xp}
                                nextLevel={profileData.nextLevel}
                            />
                            <ProfileLevelPath level={profileData.level} />
                            <ProfileSoulWine soulWine={soulWine} />
                            <ProfileGamesStats gamesPlayed={gamesPlayed} learnProgress={learnProgress} />
                            <ProfileAchievements />
                            <ProfileWishlist
                                wishlist={wishlist}
                                onReorder={handleWishlistReorder}
                                onRemove={removeFromWishlist}
                            />

                            {/* Recent History — P0-025：無 Mock，空狀態 */}
                            <m.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="rounded-2xl"
                            >
                                <GlassCard className="p-8">
                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <User className="w-5 h-5 text-white/50" />
                                        {t('profile.recentActivity')}
                                    </h2>
                                    <div className="space-y-4">
                                        <p className="text-white/50 text-sm">{t('profile.recentActivityEmpty')}</p>
                                    </div>
                                </GlassCard>
                            </m.div>

                        </div>
                    </m.div>
                </AnimatePresence>
            </div>
        </main>
    )
}
