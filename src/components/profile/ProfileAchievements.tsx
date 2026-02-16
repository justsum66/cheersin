import { m } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { ACHIEVEMENT_KEYS } from '@/config/profile.config'

export function ProfileAchievements() {
    const { t } = useTranslation()
    const prefersReducedMotion = usePrefersReducedMotion()

    return (
        <m.div
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
                {ACHIEVEMENT_KEYS.map((a, idx) => (
                    <m.div
                        key={a.id}
                        role="listitem"
                        className={`shrink-0 flex items-center gap-3 p-3 min-h-[48px] rounded-xl border transition-shadow duration-300 games-focus-ring ${a.unlocked
                                ? 'bg-white/5 border-white/20 hover:shadow-lg hover:border-white/30 ring-2 ring-primary-400/50 hover:ring-primary-400/70'
                                : 'bg-white/[0.02] border-white/5 opacity-50'
                            }`}
                        title={t(a.labelKey)}
                        tabIndex={0}
                        initial={prefersReducedMotion ? false : { scale: 0, rotate: -8 }}
                        animate={{ scale: 1, rotate: 0, ...(a.unlocked ? { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)' } : {}) }}
                        whileHover={a.unlocked ? { scale: 1.02, boxShadow: '0 4px 20px rgba(212, 175, 55, 0.15)' } : {}}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.35, delay: prefersReducedMotion ? 0 : idx * 0.05 }}
                    >
                        <a.icon className={`w-6 h-6 shrink-0 ${a.unlocked ? 'text-primary-400' : 'text-white/30'}`} aria-hidden />
                        <span className="text-sm text-white/80 whitespace-nowrap">{t(a.labelKey)}</span>
                    </m.div>
                ))}
            </div>
        </m.div>
    )
}
