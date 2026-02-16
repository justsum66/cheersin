import { Wine, Zap, Target } from 'lucide-react'
import { StatCard } from './StatCard'
import { useTranslation } from '@/contexts/I18nContext'

interface ProfileStatsProps {
    winesTasted: number
    level: number
    xp: number
    nextLevel: number
}

export function ProfileStats({ winesTasted, level, xp, nextLevel }: ProfileStatsProps) {
    const { t } = useTranslation()

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
                icon={Wine}
                label={t('profile.winesTasted')}
                value={winesTasted}
                trend={winesTasted > 0 ? '—' : t('profile.noData')}
                color="primary"
                delay={0.2}
            />
            <StatCard
                icon={Zap}
                label={t('profile.levelProgress')}
                value={`Lv. ${level}`}
                valueSize="sm"
                trend={xp > 0 ? t('profile.percentToNext').replace('{{percent}}', String(Math.round((xp / nextLevel) * 100))) : '—'}
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
    )
}
