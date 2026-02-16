import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { m } from 'framer-motion'
import {
    Pencil,
    Award,
    Crown,
    Flame,
    Star,
    Share2,
    UserPlus,
    User,
    Settings,
    LogOut,
    Mail,
    MessageCircle,
    MessageSquare,
    ChevronRight,
} from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { useUser } from '@/contexts/UserContext'
import { useSupabase } from '@/hooks/useSupabase'
import { useSubscription } from '@/hooks/useSubscription'
import { getStreak } from '@/lib/gamification'
import { SUBSCRIPTION_TIERS, hasProBadge } from '@/lib/subscription'
import { NavButton } from './NavButton'
import PushSubscribe from '@/components/pwa/PushSubscribe'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { GlassCard } from '@/components/ui/GlassCard'
import type { ProfileData } from '@/config/profile.config'
import { LEVEL_LABEL_KEYS } from '@/config/profile.config'

interface ProfileSidebarProps {
    profileData: ProfileData
    editMode: boolean
}

export function ProfileSidebar({ profileData, editMode }: ProfileSidebarProps) {
    const { t, locale } = useTranslation()
    const router = useRouter()
    const { user, setUser } = useUser()
    const supabase = useSupabase()
    const { tier, expiresAt } = useSubscription()

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const logoutTriggerRef = useRef<HTMLButtonElement>(null)

    const showBadge = hasProBadge(tier)
    const tierLabel = SUBSCRIPTION_TIERS[tier]?.label ?? t('pricing.free')

    const levelLabel = t(LEVEL_LABEL_KEYS[profileData.level] ?? 'profile.levelTrainee')
    const displayName = (profileData.displayName || user?.name || user?.email) ?? '—'
    const displayEmail = user?.email ?? '—'
    const avatarSeed = user?.id ?? 'guest'
    const avatarUrl = user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`

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

    const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/?ref=invite` : ''
    const handleInvite = () => {
        navigator.clipboard?.writeText(inviteUrl).then(() => alert(t('profile.inviteLinkCopied')))
    }

    return (
        <m.div
            className="lg:col-span-1 space-y-6"
            variants={editMode ? { visible: { transition: { staggerChildren: 0.05 } }, hidden: {} } : { visible: {}, hidden: {} }}
            initial="hidden"
            animate="visible"
        >
            <m.div
                variants={editMode ? { hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } } : {}}
                initial={editMode ? undefined : { opacity: 0, x: -20 }}
                animate={editMode ? undefined : { opacity: 1, x: 0 }}
                transition={editMode ? undefined : { duration: 0.25 }}
                className="relative"
            >
                <GlassCard className="p-8 flex flex-col items-center text-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none" />

                    {/* E61 頭像 120px + 編輯浮層 */}
                    <div className="relative mb-6">
                        <div className="w-[120px] h-[120px] rounded-full p-1 bg-gradient-to-br from-primary-500 to-secondary-500">
                            <m.div className="w-full h-full rounded-full bg-black overflow-hidden relative" key={avatarUrl} initial={{ opacity: 0.7 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                                <Image src={avatarUrl} alt={t('profile.avatarAlt').replace('{{name}}', displayName)} width={120} height={120} className="w-full h-full object-cover" unoptimized={avatarUrl.startsWith('data:')} />
                            </m.div>
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
                        <m.div
                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${profileData.nextLevel > 0 ? Math.min(100, (profileData.xp / profileData.nextLevel) * 100) : 0}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
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
                </GlassCard>
            </m.div>

            {/* E67 設定：圖標+標籤+右箭頭、觸控 48px；E68 訂閱狀態卡；E69 登出移到底部 */}
            <m.div
                variants={editMode ? { hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } } : {}}
                initial={editMode ? undefined : { opacity: 0, x: -20 }}
                animate={editMode ? undefined : { opacity: 1, x: 0 }}
                transition={editMode ? undefined : { delay: 0.1 }}
                className="rounded-2xl"
            >
                <GlassCard className="p-2 space-y-1 bg-white/5 border-white/5">
                    <NavButton icon={User} label={t('profile.navProfile')} active showArrow />
                    <NavButton icon={Settings} label={t('profile.navSettings')} showArrow />
                </GlassCard>
            </m.div>
            {/* P1：訂閱區塊 */}
            <m.div
                variants={editMode ? { hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } } : {}}
                initial={editMode ? undefined : { opacity: 0, x: -20 }}
                animate={editMode ? undefined : { opacity: 1, x: 0 }}
                transition={editMode ? undefined : { delay: 0.12 }}
                className="rounded-2xl"
            >
                <GlassCard className={`p-4 ${tier === 'free' ? 'bg-white/5 border-white/10' : 'bg-white/5 border-primary-500/30'}`}>
                    <h2 className="text-sm font-semibold text-white mb-2">{t('profile.subscriptionStatus')}</h2>
                    <p className="text-white/80 text-sm">{tierLabel}</p>
                    <p className="text-white/50 text-xs mt-1">{tier === 'free' ? '—' : expiryLabel ?? t('profile.expiresByPlan')}</p>
                    {/* R2-186：訂閱價值（節省金額）— 依到期日反推訂閱月數估算 */}
                    {tier !== 'free' && expiresAt && (() => {
                        const endMs = new Date(expiresAt).getTime()
                        const nowMs = Date.now()
                        if (endMs <= nowMs) return null
                        const monthsLeft = (endMs - nowMs) / (30 * 24 * 3600 * 1000)
                        const monthsActive = Math.max(1, Math.round(12 - monthsLeft))
                        const monthlyPrice = tier === 'premium' ? 199 : 99
                        const saved = monthsActive * monthlyPrice
                        return (
                            <p className="text-primary-400/90 text-xs mt-2">
                                相當於省下約 NT$ {saved.toLocaleString('zh-TW')}
                            </p>
                        )
                    })()}
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
                </GlassCard>
            </m.div>

            {/* 149 Pro 專屬客服：僅 Pro 會員顯示 */}
            {tier === 'premium' && (
                <m.div
                    variants={editMode ? { hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } } : {}}
                    initial={editMode ? undefined : { opacity: 0, x: -20 }}
                    animate={editMode ? undefined : { opacity: 1, x: 0 }}
                    transition={editMode ? undefined : { delay: 0.15 }}
                    className="rounded-2xl"
                >
                    <GlassCard className="bg-primary-500/10 border-primary-500/30 p-4">
                        <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                            <Crown className="w-4 h-4 text-primary-400" />
                            {t('profile.proSupport')}
                        </h2>
                        <p className="text-white/60 text-xs mb-3">{t('profile.proSupportDesc')}</p>
                        <a href="mailto:support@cheersin.app" className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 mb-2">
                            <Mail className="w-4 h-4" />
                            support@cheersin.app
                        </a>
                        <a href="https://line.me/R/ti/p/@cheersin" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300">
                            <MessageCircle className="w-4 h-4" />
                            {t('profile.lineSupport')}
                        </a>
                    </GlassCard>
                </m.div>
            )}
            {/* E94 P2：回饋／NPS 預留 */}
            <m.div
                variants={editMode ? { hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } } : {}}
                initial={editMode ? undefined : { opacity: 0, x: -20 }}
                animate={editMode ? undefined : { opacity: 1, x: 0 }}
                transition={editMode ? undefined : { delay: 0.18 }}
                className="pt-2"
            >
                <a href={`mailto:hello@cheersin.app?subject=${encodeURIComponent(t('profile.feedbackSubject'))}`} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors min-h-[48px] min-w-[48px] inline-flex games-focus-ring rounded">
                    <MessageSquare className="w-4 h-4" />
                    {t('profile.feedback')}
                </a>
            </m.div>
            {/* 任務 90：登出前確認 Dialog；E69 登出 */}
            <m.div
                variants={editMode ? { hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } } : {}}
                initial={editMode ? undefined : { opacity: 0, x: -20 }}
                animate={editMode ? undefined : { opacity: 1, x: 0 }}
                transition={editMode ? undefined : { delay: 0.2 }}
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
            </m.div>
        </m.div>
    )
}
