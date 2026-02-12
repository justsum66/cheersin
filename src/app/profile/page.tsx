'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
    User,
    Settings,
    Award,
    Flame,
    Clock,
    ChevronRight,
    LogOut,
    Wine,
    Pencil,
    Trash2,
    TrendingUp,
    Star,
    Zap,
    Droplets,
    Wind,
    Target,
    Crown,
    MessageCircle,
    Mail,
    Gamepad2,
    BookOpen,
    Heart,
    Trophy,
    Share2,
    UserPlus,
    Users,
    MessageSquare,
    GripVertical
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import FeatureIcon from '@/components/ui/FeatureIcon'
import { InViewAnimate } from '@/components/ui/InViewAnimate'
import PushSubscribe from '@/components/pwa/PushSubscribe'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useSubscription } from '@/hooks/useSubscription'
import { useUser } from '@/contexts/UserContext'
import { useSupabase } from '@/hooks/useSupabase'
import { SUBSCRIPTION_TIERS, hasProBadge } from '@/lib/subscription'
import { LEARN_COURSE_COUNT } from '@/lib/learn-constants'
import { getStreak } from '@/lib/gamification'
import { useTranslation } from '@/contexts/I18nContext'

/** 211–215：學習進度 key */
const LEARN_PROGRESS_KEY = 'cheersin_learn_progress'
/** 211–215：遊戲統計 key（可擴充） */
const GAMES_STATS_KEY = 'cheersin_games_played'

/** P0-025：從 Supabase profiles 取得的資料或預設值（單一來源，無 Mock）；levelLabel 由 t(LEVEL_LABEL_KEYS[level]) 取得 */
interface ProfileData {
    xp: number
    level: number
    nextLevel: number
    displayName: string | null
    reviewsGiven: number
    winesTasted: number
}

/** P0-008：等級對應 i18n key（levelToLabel 由 t 提供） */
const LEVEL_LABEL_KEYS: Record<number, string> = {
    1: 'profile.levelTrainee',
    2: 'profile.levelTrainee2',
    3: 'profile.levelConnoisseur',
    4: 'profile.levelConnoisseur2',
    5: 'profile.levelSommelier',
    6: 'profile.levelSommelier2',
    7: 'profile.levelSommelier3',
    8: 'profile.levelSommelier4',
    9: 'profile.levelMasterTrainee',
    10: 'profile.levelMaster',
}

/** P0-008：升級路徑 — 累積 XP 達此值即為該等級（與 profile nextLevel = (level+1)*1000 對齊） */
const LEVEL_PATH_KEYS: { level: number; xpRequired: number; labelKey: string; rewardKey: string }[] = [
    { level: 1, xpRequired: 0, labelKey: 'profile.levelTrainee', rewardKey: 'profile.rewardAvatarBasic' },
    { level: 2, xpRequired: 2000, labelKey: 'profile.levelTrainee2', rewardKey: 'profile.rewardAvatarSilver' },
    { level: 3, xpRequired: 3000, labelKey: 'profile.levelConnoisseur', rewardKey: 'profile.rewardAvatarConnoisseur' },
    { level: 4, xpRequired: 4000, labelKey: 'profile.levelConnoisseur2', rewardKey: 'profile.rewardRouletteClassic' },
    { level: 5, xpRequired: 5000, labelKey: 'profile.levelSommelier', rewardKey: 'profile.rewardAvatarPro' },
    { level: 6, xpRequired: 6000, labelKey: 'profile.levelSommelier2', rewardKey: 'profile.rewardRouletteParty' },
    { level: 7, xpRequired: 7000, labelKey: 'profile.levelSommelier3', rewardKey: 'profile.rewardAvatarGold' },
    { level: 8, xpRequired: 8000, labelKey: 'profile.levelSommelier4', rewardKey: 'profile.rewardRouletteLimited' },
    { level: 9, xpRequired: 9000, labelKey: 'profile.levelMasterTrainee', rewardKey: 'profile.rewardAvatarMasterPreview' },
    { level: 10, xpRequired: 10000, labelKey: 'profile.levelMaster', rewardKey: 'profile.rewardAvatarMaster' },
]

/** 211–215：成就徽章（可後端擴充）；label 由 t(profile.achievementX) 提供 */
const ACHIEVEMENT_KEYS = [
    { id: 'first-quiz', labelKey: 'profile.achievementFirstQuiz', icon: Wine, unlocked: true },
    { id: 'streak-7', labelKey: 'profile.achievementStreak7', icon: Flame, unlocked: true },
    { id: 'games-10', labelKey: 'profile.achievementGames10', icon: Gamepad2, unlocked: false },
    { id: 'learn-1', labelKey: 'profile.achievementLearn1', icon: BookOpen, unlocked: false },
]

const DEFAULT_PROFILE: ProfileData = {
    xp: 0,
    level: 1,
    nextLevel: 1000,
    displayName: null,
    reviewsGiven: 0,
    winesTasted: 0,
}

export default function ProfilePage() {
    const { t, locale } = useTranslation()
    const router = useRouter()
    const { tier, expiresAt } = useSubscription()
    /** I18N-10：到期日依 locale 格式化；7 天內顯示相對時間（今天/明天/N 天後） */
    const expiryLabel = (() => {
      if (tier === 'free' || !expiresAt) return null
      const endMs = new Date(expiresAt).getTime()
      const nowMs = Date.now()
      const days = Math.floor((endMs - nowMs) / (24 * 60 * 60 * 1000))
      if (days < 0) return t('profile.expiresOn').replace('{{date}}', new Date(expiresAt).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }))
      if (days === 0) return t('common.expiresToday')
      if (days === 1) return t('common.expiresTomorrow')
      if (days <= 31) return t('common.expiresInDays').replace('{{count}}', String(days))
      return t('common.expiresOnDate').replace('{{date}}', new Date(expiresAt).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }))
    })()
    const { user, setUser, isLoading: authLoading } = useUser()
    const supabase = useSupabase()
    const showBadge = hasProBadge(tier)
    const tierLabel = SUBSCRIPTION_TIERS[tier]?.label ?? t('pricing.free')
    /** P0-025：從 Supabase profiles 取得；無 Mock */
    const [profileLoading, setProfileLoading] = useState(true)
    const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE)
    const levelLabel = t(LEVEL_LABEL_KEYS[profileData.level] ?? 'profile.levelTrainee')
    const displayName = (profileData.displayName || user?.name || user?.email) ?? '—'
    const displayEmail = user?.email ?? '—'
    const avatarSeed = user?.id ?? 'guest'
    const avatarUrl = user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`

    /** 211–215：靈魂酒測結果（localStorage quiz-last-result，與 quiz 頁面儲存格式一致：name, type） */
    const [soulWine, setSoulWine] = useState<{ name?: string; type?: string; traits?: Record<string, number> } | null>(null)
    /** 211–215：學習進度 */
    const [learnProgress, setLearnProgress] = useState<Record<string, { completed: number; total: number }>>({})
    /** 211–215：遊戲統計（玩過場次） */
    const [gamesPlayed, setGamesPlayed] = useState(0)
    /** 211–215：願望酒單（localStorage 單一來源，無 Mock） */
    const [wishlist, setWishlist] = useState<{ id: string; name: string; type: string }[]>([])
    /** E70 編輯模式：頂部「編輯」切換 */
    const [editMode, setEditMode] = useState(false)
    /** 任務 90：登出前確認 Dialog，避免誤觸；SM-65 focus 回觸發按鈕 */
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const logoutTriggerRef = useRef<HTMLButtonElement>(null)

    /** P0-025：已登入時從 Supabase profiles 取得 xp、level、display_name */
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
        if (typeof window === 'undefined') return
        try {
            const raw = localStorage.getItem('quiz-last-result')
            if (raw) {
                const parsed = JSON.parse(raw) as { name?: string; type?: string; traits?: Record<string, number> }
                setSoulWine(parsed)
            }
        } catch {
            /* ignore */
        }
    }, [])
    useEffect(() => {
        if (typeof window === 'undefined') return
        try {
            const raw = localStorage.getItem(LEARN_PROGRESS_KEY)
            if (raw) {
                const parsed = JSON.parse(raw) as Record<string, { completed: number; total: number }>
                setLearnProgress(typeof parsed === 'object' && parsed !== null ? parsed : {})
            }
        } catch {
            /* ignore */
        }
    }, [])
    useEffect(() => {
        if (typeof window === 'undefined') return
        try {
            const raw = localStorage.getItem(GAMES_STATS_KEY)
            if (raw) {
                const n = parseInt(raw, 10)
                setGamesPlayed(Number.isFinite(n) ? n : 0)
            }
        } catch {
            /* ignore */
        }
    }, [])
    useEffect(() => {
        if (typeof window === 'undefined') return
        try {
            const raw = localStorage.getItem('cheersin_wishlist')
            if (raw) {
                const parsed = JSON.parse(raw) as { id: string; name?: string; type?: string; content?: string }[]
                const normalized = (Array.isArray(parsed) ? parsed : []).map((item) => ({
                    id: item.id,
                    name: item.name ?? item.content?.slice(0, 80) ?? t('profile.recommendFallback'),
                    type: item.type ?? t('profile.recommendFallback'),
                }))
                setWishlist(normalized)
            }
        } catch {
            /* ignore */
        }
    }, [t])

    /** 216–225 分享：Web Share API 或複製連結 */
    const handleShare = () => {
        const url = typeof window !== 'undefined' ? window.location.origin : 'https://cheersin.app'
        const text = t('profile.shareText')
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({ title: 'Cheersin', text, url }).catch(() => {
                navigator.clipboard?.writeText(url).then(() => alert(t('profile.linkCopied')))
            })
        } else {
            navigator.clipboard?.writeText(url).then(() => alert(t('profile.linkCopied')))
        }
    }

    /** 216–225 邀請連結：複製帶 ref 的連結；獎勵為佔位 */
    const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/?ref=invite` : ''
    const handleInvite = () => {
        navigator.clipboard?.writeText(inviteUrl).then(() => alert(t('profile.inviteLinkCopied')))
    }

    /** E66 願望清單：滑動刪除（移除單項） */
    const removeFromWishlist = (id: string) => {
        setWishlist((prev) => prev.filter((w) => w.id !== id))
        try {
            const raw = localStorage.getItem('cheersin_wishlist')
            const list: { id: string; name?: string; type?: string }[] = raw ? JSON.parse(raw) : []
            const next = list.filter((item) => item.id !== id)
            localStorage.setItem('cheersin_wishlist', JSON.stringify(next))
        } catch {
            /* ignore */
        }
    }

    /** B5.2 願望清單：拖曳排序更新 */
    const handleWishlistReorder = (newOrder: typeof wishlist) => {
        setWishlist(newOrder)
        try {
            localStorage.setItem('cheersin_wishlist', JSON.stringify(newOrder))
        } catch {
            /* ignore */
        }
    }

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
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-900/10 to-transparent pointer-events-none" />

            <div className="max-w-6xl xl:max-w-[1440px] mx-auto relative z-10">
                {/* E70 編輯模式：頂部「編輯」按鈕切換 */}
                <div className="flex justify-end mb-4">
                    <motion.button
                        type="button"
                        onClick={() => setEditMode((v) => !v)}
                        className="flex items-center gap-2 min-h-[48px] px-4 rounded-xl text-sm font-medium border border-white/20 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors games-focus-ring"
                        aria-pressed={editMode}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Pencil className="w-4 h-4" />
                        <AnimatePresence mode="wait">
                            <motion.span key={editMode ? 'done' : 'edit'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                                {editMode ? t('profile.done') : t('profile.edit')}
                            </motion.span>
                        </AnimatePresence>
                    </motion.button>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={editMode ? 'edit' : 'view'}
                        initial={{ opacity: 0.92 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0.92 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >

                    {/* Sidebar / Identity Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none" />

                            {/* E61 頭像 120px + 編輯浮層 */}
                            <div className="relative mb-6">
                                <div className="w-[120px] h-[120px] rounded-full p-1 bg-gradient-to-br from-primary-500 to-secondary-500">
                                    <motion.div className="w-full h-full rounded-full bg-black overflow-hidden relative" key={avatarUrl} initial={{ opacity: 0.7 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                                        <Image src={avatarUrl} alt={t('profile.avatarAlt').replace('{{name}}', displayName)} width={120} height={120} className="w-full h-full object-cover" unoptimized={avatarUrl.startsWith('data:')} />
                                    </motion.div>
                                </div>
                                {editMode && (
                                    <button
                                        type="button"
                                        className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-white/90 hover:text-white transition-colors min-h-[48px] min-w-[48px] games-focus-ring"
                                        title={t('profile.changeAvatar')}
                                        aria-label={t('profile.editAvatar')}
                                    >
                                        <Pencil className="w-6 h-6" />
                                    </button>
                                )}
                                <div className="absolute bottom-0 right-0 p-2 rounded-full bg-black border border-white/10">
                                    <Award className="w-5 h-5 text-yellow-500" />
                                </div>
                                {showBadge && (
                                    <div className="absolute top-0 right-0 px-2 py-1 rounded-lg bg-primary-500/90 text-white text-xs font-bold flex items-center gap-1" title={t('profile.planLabel').replace('{{tier}}', tierLabel)}>
                                        <Crown className="w-3.5 h-3.5" />
                                        {tierLabel}
                                    </div>
                                )}
                            </div>

                            <h1 className="text-2xl font-display font-bold text-white mb-1 truncate max-w-full" title={displayName}>{displayName}</h1>
                            <p className="text-white/40 text-sm mb-6 truncate max-w-full" title={displayEmail}>{displayEmail}</p>

                            <div className="w-full bg-white/5 rounded-full h-2 mb-2 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                                    style={{ width: `${profileData.nextLevel > 0 ? Math.min(100, (profileData.xp / profileData.nextLevel) * 100) : 0}%` }}
                                />
                            </div>
                            <div className="flex justify-between w-full text-xs text-white/40 mb-8">
                                <span>{levelLabel}</span>
                                <span>{profileData.xp} / {profileData.nextLevel} XP</span>
                            </div>

                            {/* E59：連續天數與總數據 — 從 gamification getStreak、profileData */}
                            {(() => {
                                const streak = getStreak()
                                const streakDays = streak.days > 0 ? streak.days : 0
                                return (
                                  <div className="grid grid-cols-2 gap-4 w-full">
                                    <div className="p-4 rounded-2xl bg-white/5 flex flex-col items-center">
                                        <Flame className="w-6 h-6 text-orange-500 mb-2" />
                                        <span className="text-2xl font-bold text-white tabular-nums">{streakDays}</span>
                                        <span className="text-xs text-white/40 uppercase tracking-wider">{t('profile.streakDays')}</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 flex flex-col items-center">
                                        <Star className="w-6 h-6 text-yellow-500 mb-2" />
                                        <span className="text-2xl font-bold text-white tabular-nums">{profileData.reviewsGiven}</span>
                                        <span className="text-xs text-white/40 uppercase tracking-wider">{t('profile.totalReviews')}</span>
                                    </div>
                                  </div>
                                )
                            })()}
                            {/* 216–225 分享、邀請 */}
                            <div className="flex gap-2 w-full mt-4">
                                <button type="button" onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 py-3 min-h-[48px] rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium games-focus-ring">
                                    <Share2 className="w-4 h-4" /> {t('profile.share')}
                                </button>
                                <button type="button" onClick={handleInvite} className="flex-1 flex items-center justify-center gap-2 py-3 min-h-[48px] rounded-xl bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 text-sm font-medium border border-primary-500/30 games-focus-ring">
                                    <UserPlus className="w-4 h-4" /> {t('profile.inviteFriends')}
                                </button>
                            </div>
                            {/* 294 推播訂閱（需 VAPID） */}
                            <div className="w-full mt-4 pt-4 border-t border-white/10">
                                <PushSubscribe />
                            </div>
                        </motion.div>

                        {/* E67 設定：圖標+標籤+右箭頭、觸控 48px；E68 訂閱狀態卡；E69 登出移到底部 */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass p-2 space-y-1 rounded-2xl bg-white/5 border border-white/5"
                        >
                            <NavButton icon={User} label={t('profile.navProfile')} active showArrow />
                            <NavButton icon={Settings} label={t('profile.navSettings')} showArrow />
                        </motion.div>
                        {/* P1：訂閱區塊 — 未訂閱主 CTA「升級方案」btn-primary，已訂閱「管理訂閱」btn-secondary、邊框區分 */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.12 }}
                            className={`rounded-2xl p-4 ${tier === 'free' ? 'bg-white/5 border border-white/10' : 'bg-white/5 border border-primary-500/30'}`}
                        >
                            <h3 className="text-sm font-semibold text-white mb-2">{t('profile.subscriptionStatus')}</h3>
                            <p className="text-white/80 text-sm">{tierLabel}</p>
                            <p className="text-white/50 text-xs mt-1">{tier === 'free' ? '—' : expiryLabel ?? t('profile.expiresByPlan')}</p>
                            {tier === 'free' ? (
                                <Link href="/pricing" className="btn-primary mt-3 inline-flex items-center gap-2 min-h-[48px] min-w-[48px] px-3 py-2 text-sm font-medium games-focus-ring rounded">
                                    {t('profile.upgradePlan')}
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <Link href="/subscription" className="btn-secondary mt-3 inline-flex items-center gap-2 min-h-[48px] min-w-[48px] px-3 py-2 text-sm font-medium games-focus-ring rounded">
                                    {t('profile.manageSubscription')}
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            )}
                        </motion.div>

                        {/* 149 Pro 專屬客服：僅 Pro 會員顯示 */}
                        {tier === 'premium' && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 }}
                                className="rounded-2xl bg-primary-500/10 border border-primary-500/30 p-4"
                            >
                                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-primary-400" />
                                    {t('profile.proSupport')}
                                </h3>
                                <p className="text-white/60 text-xs mb-3">{t('profile.proSupportDesc')}</p>
                                <a href="mailto:support@cheersin.app" className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 mb-2">
                                    <Mail className="w-4 h-4" />
                                    support@cheersin.app
                                </a>
                                <a href="https://line.me/R/ti/p/@cheersin" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300">
                                    <MessageCircle className="w-4 h-4" />
                                    {t('profile.lineSupport')}
                                </a>
                            </motion.div>
                        )}
                        {/* E94 P2：回饋／NPS 預留 — 可連 Typeform/Google Form 或 mailto */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.18 }}
                            className="pt-2"
                        >
                            <a href={`mailto:hello@cheersin.app?subject=${encodeURIComponent(t('profile.feedbackSubject'))}`} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors min-h-[48px] min-w-[48px] inline-flex games-focus-ring rounded">
                                <MessageSquare className="w-4 h-4" />
                                {t('profile.feedback')}
                            </a>
                        </motion.div>
                        {/* 任務 90：登出前確認 Dialog；E69 登出：頁面底部、紅色文字警示 */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="pt-4"
                        >
                            <button
                                ref={logoutTriggerRef}
                                type="button"
                                onClick={() => setShowLogoutConfirm(true)}
                                className="btn-danger w-full min-h-[48px] games-focus-ring"
                            >
                                <LogOut className="w-5 h-5" />
                                {user ? t('profile.logout') : t('profile.goLogin')}
                            </button>
                            <ConfirmDialog
                                open={showLogoutConfirm}
                                title={t('profile.logoutConfirmTitle')}
                                message={t('profile.logoutConfirmMessage')}
                                confirmLabel={t('profile.logoutConfirm')}
                                cancelLabel={t('profile.cancel')}
                                variant="danger"
                                triggerRef={logoutTriggerRef}
                                onConfirm={() => {
                                    setShowLogoutConfirm(false)
                                    if (supabase) {
                                        supabase.auth.signOut().then(() => {
                                            setUser(null)
                                            router.push('/login')
                                        })
                                    } else {
                                        setUser(null)
                                        router.push('/login')
                                    }
                                }}
                                onCancel={() => setShowLogoutConfirm(false)}
                            />
                        </motion.div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Stats Row — P0-025：來自 profileData，無 Mock */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard
                                icon={Wine}
                                label={t('profile.winesTasted')}
                                value={profileData.winesTasted}
                                trend={profileData.winesTasted > 0 ? '—' : t('profile.noData')}
                                color="primary"
                                delay={0.2}
                            />
                            <StatCard
                                icon={Zap}
                                label={t('profile.levelProgress')}
                                value={`Lv. ${profileData.level}`}
                                valueSize="sm"
                                trend={profileData.xp > 0 ? t('profile.percentToNext').replace('{{percent}}', String(Math.round((profileData.xp / profileData.nextLevel) * 100))) : '—'}
                                color="secondary"
                                delay={0.3}
                            />
                            <StatCard
                                icon={Target}
                                label={t('profile.tasteAccuracy')}
                                value="—"
                                trend={t('profile.tasteAccuracyHint')}
                                color="accent"
                                delay={0.4}
                            />
                        </div>

                        {/* P0-008：升級路徑與獎勵 — 等級門檻與解鎖內容 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="glass-card-spotlight p-6"
                        >
                            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                <Trophy className="w-5 h-5 text-primary-400" />
                                {t('profile.levelPathTitle')}
                            </h2>
                            <p className="text-white/60 text-sm mb-4">{t('profile.levelPathDesc')}</p>
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {LEVEL_PATH_KEYS.map(({ level, xpRequired, labelKey, rewardKey }) => {
                                    const isCurrent = profileData.level === level
                                    const isUnlocked = profileData.level >= level
                                    return (
                                        <div
                                            key={level}
                                            className={`flex items-center gap-3 py-2 px-3 rounded-xl border transition-colors ${isCurrent ? 'bg-primary-500/20 border-primary-500/40' : isUnlocked ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5'}`}
                                        >
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCurrent ? 'bg-primary-500 text-white' : isUnlocked ? 'bg-white/10 text-white/80' : 'bg-white/5 text-white/40'}`}>
                                                {level}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-sm font-medium truncate ${isUnlocked ? 'text-white' : 'text-white/50'}`}>{t(labelKey)}</p>
                                                <p className="text-xs text-white/40 truncate">{xpRequired.toLocaleString()} XP · {t(rewardKey)}</p>
                                            </div>
                                            {isCurrent && <span className="text-xs text-primary-400 font-medium shrink-0">{t('profile.currentLevel')}</span>}
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>

                        {/* 211–215：靈魂酒測結果 + 感官檔案 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass-card-spotlight p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FeatureIcon icon={Wind} size="sm" color="white" />
                                    {t('profile.soulQuiz')}
                                </h2>
                                <Link href="/quiz" className="text-sm text-primary-400 hover:text-primary-300 min-h-[48px] inline-flex items-center games-focus-ring rounded">
                                    {soulWine ? t('profile.retakeQuiz') : t('profile.startQuiz')} &rarr;
                                </Link>
                            </div>
                            {soulWine?.name && (
                                <div className="mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                                    <p className="text-white/60 text-sm mb-1">{t('profile.mySoulWine')}</p>
                                    <p className="text-xl font-bold text-primary-300">{soulWine.name}</p>
                                    {soulWine.type && <p className="text-white/50 text-sm mt-1">{soulWine.type}</p>}
                                </div>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <TraitBar label={t('profile.traitBold')} value={soulWine?.traits?.bold ?? 80} color="bg-red-500" icon={Flame} />
                                <TraitBar label={t('profile.traitAcid')} value={soulWine?.traits?.acid ?? 60} color="bg-yellow-500" icon={Zap} />
                                <TraitBar label={t('profile.traitSweet')} value={soulWine?.traits?.sweet ?? 30} color="bg-pink-500" icon={Droplets} />
                                <TraitBar label={t('profile.traitTannin')} value={soulWine?.traits?.tannin ?? 75} color="bg-purple-500" icon={Wine} />
                            </div>
                        </motion.div>

                        {/* 211–215：遊戲統計 + 學習進度 + 成就；R2-097 InView 觸發從零生長動畫 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InViewAnimate delay={0} y={20} amount={0.2} className="glass-card p-6">
                                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Gamepad2 className="w-5 h-5 text-primary-400" />
                                    {t('profile.gamesPlayed')}
                                </h2>
                                <div className="space-y-2 text-white/80 text-sm">
                                    <p>{t('profile.gamesPlayedCount').replace('{{count}}', String(gamesPlayed))}</p>
                                    <Link href="/games" className="text-primary-400 hover:text-primary-300 text-sm min-h-[48px] inline-flex items-center games-focus-ring rounded">
                                        {t('profile.goPlayGames')} &rarr;
                                    </Link>
                                </div>
                            </InViewAnimate>
                            {/* 216–225 好友、私訊佔位（即將推出） */}
                            <InViewAnimate delay={0.06} y={20} amount={0.2} className="glass-card p-6 opacity-80">
                                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary-400" />
                                    {t('profile.friends')}
                                </h2>
                                <p className="text-white/50 text-sm">{t('profile.friendsComingSoon')}</p>
                            </InViewAnimate>
                            <InViewAnimate delay={0.08} y={20} amount={0.2} className="glass-card p-6 opacity-80">
                                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-primary-400" />
                                    {t('profile.messages')}
                                </h2>
                                <p className="text-white/50 text-sm">{t('profile.messagesComingSoon')}</p>
                            </InViewAnimate>
                            <InViewAnimate delay={0.1} y={20} amount={0.2} className="glass-card p-6">
                                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-primary-400" />
                                    {t('profile.learnProgress')}
                                </h2>
                                {/* E46：已完課數/總課數可於 Profile 查詢 */}
                                {(() => {
                                    const completedCount = Object.values(learnProgress).filter(({ completed, total }) => total > 0 && completed >= total).length
                                    return (
                                      <p className="text-white/70 text-sm mb-3">{t('profile.learnCompleted').replace('{{completed}}', String(completedCount)).replace('{{total}}', String(LEARN_COURSE_COUNT))}</p>
                                    )
                                })()}
                                <div className="space-y-2">
                                    {Object.keys(learnProgress).length === 0 ? (
                                        <p className="text-white/50 text-sm">{t('profile.learnNotStarted')}</p>
                                    ) : (
                                        Object.entries(learnProgress).map(([courseId, { completed, total }]) => (
                                            <div key={courseId} className="flex items-center justify-between text-sm">
                                                <span className="text-white/80 truncate">{courseId}</span>
                                                <span className="text-primary-400 font-medium shrink-0 ml-2">
                                                    {total > 0 ? Math.round((completed / total) * 100) : 0}%
                                                </span>
                                            </div>
                                        ))
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                    <Link href="/learn" className="text-primary-400 hover:text-primary-300 text-sm min-h-[48px] inline-flex items-center games-focus-ring rounded">
                                        {t('profile.goLearn')} &rarr;
                                    </Link>
                                    <Link href="/learn/certificate" className="text-primary-400 hover:text-primary-300 text-sm min-h-[48px] inline-flex items-center games-focus-ring rounded px-2">
                                        {t('profile.getCertificate')} &rarr;
                                    </Link>
                                </div>
                                </div>
                            </InViewAnimate>
                        </div>

                        {/* E64 成就：橫向滾動、未解鎖半透明 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65 }}
                            className="glass-card p-8"
                        >
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                {t('profile.achievements')}
                            </h2>
                            <div className="flex overflow-x-auto gap-4 pb-2 -mx-1 scrollbar-hide" role="list" aria-label={t('profile.achievements')}>
                                {ACHIEVEMENT_KEYS.map((a) => (
                                    <motion.div
                                        key={a.id}
                                        role="listitem"
                                        className={`shrink-0 flex items-center gap-3 p-3 min-h-[48px] rounded-xl border transition-shadow duration-300 games-focus-ring ${a.unlocked ? 'bg-white/5 border-white/20 hover:shadow-lg hover:border-white/30' : 'bg-white/[0.02] border-white/5 opacity-50'}`}
                                        title={t(a.labelKey)}
                                        tabIndex={0}
                                        initial={false}
                                        animate={a.unlocked ? { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)' } : {}}
                                        whileHover={a.unlocked ? { scale: 1.02, boxShadow: '0 4px 20px rgba(212, 175, 55, 0.15)' } : {}}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <a.icon className={`w-6 h-6 shrink-0 ${a.unlocked ? 'text-primary-400' : 'text-white/30'}`} aria-hidden />
                                        <span className="text-sm text-white/80 whitespace-nowrap">{t(a.labelKey)}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* E66 願望酒單：列表 + 滑動刪除 + 空狀態 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="glass-card p-8"
                        >
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Heart className="w-5 h-5 text-pink-500" />
                                {t('profile.wishlist')}
                            </h2>
                            {wishlist.length === 0 ? (
                                <p className="text-white/50 text-sm mb-4">{t('profile.wishlistEmpty')}</p>
                            ) : (
                                /* B5.2 拖曳排序願望清單 */
                                <Reorder.Group axis="y" values={wishlist} onReorder={handleWishlistReorder} className="space-y-3 mb-4">
                                    {wishlist.map((w) => (
                                        <Reorder.Item
                                            key={w.id}
                                            value={w}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 group cursor-grab active:cursor-grabbing"
                                            whileDrag={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', backgroundColor: 'rgba(255,255,255,0.08)' }}
                                        >
                                            <GripVertical className="w-4 h-4 text-white/30 shrink-0 touch-none" aria-hidden />
                                            <Wine className="w-5 h-5 text-white/40 shrink-0" />
                                            <span className="flex-1 min-w-0 text-white/90 truncate">{w.name}</span>
                                            <span className="text-white/40 text-xs shrink-0">{w.type}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFromWishlist(w.id)}
                                                className="p-2 min-h-[48px] min-w-[48px] rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 flex items-center justify-center games-focus-ring"
                                                title={t('profile.remove')}
                                                aria-label={t('profile.removeFromWishlist')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            )}
                            <Link href="/assistant" className="text-primary-400 hover:text-primary-300 text-sm min-h-[48px] inline-flex items-center games-focus-ring rounded">
                                {t('profile.findWithAssistant')} &rarr;
                            </Link>
                        </motion.div>

                        {/* Recent History — P0-025：無 Mock，空狀態（可接 wine_favorites 或活動 API） */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="glass-card p-8"
                        >
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-white/50" />
                                {t('profile.recentActivity')}
                            </h2>
                            <div className="space-y-4">
                                <p className="text-white/50 text-sm">{t('profile.recentActivityEmpty')}</p>
                            </div>
                        </motion.div>

                    </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    )
}

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend: string
  color: 'primary' | 'secondary' | 'accent'
  delay: number
  valueSize?: 'lg' | 'sm'
}
function StatCard({ icon: Icon, label, value, trend, color, delay, valueSize = 'lg' }: StatCardProps) {
    const colors = {
        primary: 'text-primary-500',
        secondary: 'text-secondary-500',
        accent: 'text-accent-500'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass-card p-6"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-white/5">
                    <Icon className={`w-6 h-6 ${colors[color]}`} />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span>+2.4%</span>
                </div>
            </div>
            <div className="mb-1">
                <span className="text-white/40 text-sm font-medium uppercase tracking-wider">{label}</span>
            </div>
            <div className={`${valueSize === 'lg' ? 'text-3xl' : 'text-xl'} font-display font-bold text-white mb-2`}>
                {value}
            </div>
            <div className="text-xs text-white/30 truncate">
                {trend}
            </div>
        </motion.div>
    )
}

interface TraitBarProps {
  label: string
  value: number
  color: string
  icon: LucideIcon
}
function TraitBar({ label, value, color, icon: Icon }: TraitBarProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-white/80">
                    <Icon className="w-4 h-4 text-white/40" />
                    {label}
                </div>
                <span className="font-mono text-white/40">{value}%</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    )
}

interface NavButtonProps {
  icon: LucideIcon
  label: string
  active?: boolean
  variant?: 'default' | 'danger'
  /** E67 右箭頭、觸控 48px */
  showArrow?: boolean
}
function NavButton({ icon: Icon, label, active = false, variant = 'default', showArrow = false }: NavButtonProps) {
    return (
        <button className={`w-full flex items-center gap-3 px-4 min-h-[48px] rounded-xl text-sm font-medium transition-all games-focus-ring ${active
            ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
            : variant === 'danger'
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}>
            <Icon className="w-5 h-5 shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            {(active || showArrow) && <ChevronRight className="w-4 h-4 shrink-0" />}
        </button>
    )
}
