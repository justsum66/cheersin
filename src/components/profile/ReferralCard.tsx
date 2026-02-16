'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import { Gift, Copy, Share2, Check, Users } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { toast } from 'react-hot-toast'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'

export function ReferralCard() {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)

    // Mock data - in real app, fetch from API
    const referralCount = 1
    const referralTarget = 3
    const progress = (referralCount / referralTarget) * 100

    const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/?ref=invite_user` : 'https://cheersin.app'

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        toast.success(t('profile.referralCopied'))
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: t('common.appName'),
                text: t('profile.referralShareText'),
                url: inviteLink,
            }).catch(() => { })
        } else {
            handleCopy()
        }
    }

    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl"
        >
            <GlassCard className="relative overflow-hidden p-6 md:p-8">
                {/* Background with interesting gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-[#1a0a2e] to-secondary-600/20" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
                            <Gift className="w-3.5 h-3.5" />
                            {t('profile.referralBadge')}
                        </div>

                        <h2 className="text-2xl font-bold text-white">
                            {t('profile.referralTitle')}
                        </h2>
                        <p className="text-white/60 text-sm max-w-md mx-auto md:mx-0">
                            {t('profile.referralDesc').replace('{{count}}', String(referralTarget))}
                        </p>

                        {/* Progress Bar */}
                        <div className="space-y-2 max-w-sm mx-auto md:mx-0">
                            <div className="flex justify-between text-xs text-white/50">
                                <span>{t('profile.referralProgress').replace('{{current}}', String(referralCount)).replace('{{total}}', String(referralTarget))}</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                <m.div
                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                            <p className="text-xs text-primary-300">{t('profile.referralReward')}</p>
                        </div>
                    </div>

                    <div className="flex-shrink-0 w-full md:w-auto flex flex-col gap-3">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white/70" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-white/40">{t('profile.yourInviteLink')}</p>
                                    <p className="text-sm text-white font-mono truncate max-w-[140px] md:max-w-[200px]">
                                        cheersin.app/?ref=...
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCopy}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                                title={t('common.copy')}
                            >
                                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>

                        <Button
                            onClick={handleShare}
                            className="w-full"
                            leftIcon={<Share2 className="w-5 h-5" />}
                        >
                            {t('profile.inviteFriends')}
                        </Button>
                        <p className="text-center text-xs text-white/30">{t('profile.referralTerms')}</p>
                    </div>
                </div>
            </GlassCard>
        </m.div>
    )
}
