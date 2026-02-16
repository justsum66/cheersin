'use client'

import { m } from 'framer-motion'
import { Search, Smartphone, Wine, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/contexts/I18nContext'

export function HostPersonaSection() {
    const { t } = useTranslation()

    const cards = [
        { icon: Search, titleKey: 'pricing.partyHost.card1.title', descKey: 'pricing.partyHost.card1.desc', delay: 0 },
        { icon: Smartphone, titleKey: 'pricing.partyHost.card2.title', descKey: 'pricing.partyHost.card2.desc', delay: 0.1 },
        { icon: Wine, titleKey: 'pricing.partyHost.card3.title', descKey: 'pricing.partyHost.card3.desc', delay: 0.2 },
    ]

    return (
        <section className="py-16 md:py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary-900/5 -skew-y-3 transform origin-top-left scale-110" />
            <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-widest mb-4">
                        {t('pricing.partyHost.title')}
                    </span>
                    <h2 className="home-heading-2 text-white mb-4">
                        {t('pricing.partyHost.subtitle')}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cards.map((card, i) => (
                        <m.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: card.delay }}
                            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <card.icon className="w-6 h-6 text-primary-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{t(card.titleKey)}</h3>
                            <p className="text-white/60 text-sm leading-relaxed">{t(card.descKey)}</p>
                        </m.div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link href="/pricing" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4 rounded-full">
                        {t('pricing.partyHost.cta')}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
