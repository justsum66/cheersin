import Link from 'next/link'
import { Gamepad2, Users, MessageSquare, BookOpen } from 'lucide-react'
import { InViewAnimate } from '@/components/ui/InViewAnimate'
import { useTranslation } from '@/contexts/I18nContext'
import { LEARN_COURSE_COUNT } from '@/lib/learn-constants'

interface ProfileGamesStatsProps {
    gamesPlayed: number
    learnProgress: Record<string, { completed: number; total: number }>
}

export function ProfileGamesStats({ gamesPlayed, learnProgress }: ProfileGamesStatsProps) {
    const { t } = useTranslation()

    return (
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
                        <p className="text-white/70 text-sm mb-3">
                            {t('profile.learnCompleted').replace('{{completed}}', String(completedCount)).replace('{{total}}', String(LEARN_COURSE_COUNT))}
                        </p>
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
    )
}
