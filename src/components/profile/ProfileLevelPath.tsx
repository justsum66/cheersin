import { m } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { LEVEL_PATH_KEYS } from '@/config/profile.config'

interface ProfileLevelPathProps {
    level: number
}

export function ProfileLevelPath({ level: currentLevel }: ProfileLevelPathProps) {
    const { t } = useTranslation()

    return (
        <m.div
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
                    const isCurrent = currentLevel === level
                    const isUnlocked = currentLevel >= level
                    return (
                        <div
                            key={level}
                            className={`flex items-center gap-3 py-2 px-3 rounded-xl border transition-colors ${isCurrent
                                    ? 'bg-primary-500/20 border-primary-500/40'
                                    : isUnlocked
                                        ? 'bg-white/5 border-white/10'
                                        : 'bg-white/[0.02] border-white/5'
                                }`}
                        >
                            <span
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCurrent ? 'bg-primary-500 text-white' : isUnlocked ? 'bg-white/10 text-white/80' : 'bg-white/5 text-white/40'
                                    }`}
                            >
                                {level}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className={`text-sm font-medium truncate ${isUnlocked ? 'text-white' : 'text-white/50'}`}>{t(labelKey)}</p>
                                <p className="text-xs text-white/40 truncate">
                                    {xpRequired.toLocaleString()} XP · {t(rewardKey)}
                                </p>
                            </div>
                            {isCurrent && <span className="text-xs text-primary-400 font-medium shrink-0">{t('profile.currentLevel')}</span>}
                        </div>
                    )
                })}
            </div>
        </m.div>
    )
}
