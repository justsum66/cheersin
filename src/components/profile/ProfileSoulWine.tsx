import Link from 'next/link'
import { m } from 'framer-motion'
import { Wind, Flame, Zap, Droplets, Wine } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { FeatureIcon } from '@/components/ui/FeatureIcon'
import { TraitBar } from './TraitBar'

interface ProfileSoulWineProps {
    soulWine: { name?: string; type?: string; traits?: Record<string, number> } | null
}

export function ProfileSoulWine({ soulWine }: ProfileSoulWineProps) {
    const { t } = useTranslation()

    return (
        <m.div
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
        </m.div>
    )
}
