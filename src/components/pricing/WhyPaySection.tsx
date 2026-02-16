'use client'

import { m } from 'framer-motion'
import { Frown, PartyPopper, Wine, Sparkles, Check, X } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'

export function WhyPaySection() {
    const { t } = useTranslation()

    const comparison = [
        {
            feature: t('pricing.whyPay.vibe'),
            free: { icon: Frown, text: t('pricing.whyPay.free.vibe'), color: 'text-gray-400' },
            pro: { icon: PartyPopper, text: t('pricing.whyPay.pro.vibe'), color: 'text-primary-400' },
        },
        {
            feature: t('pricing.whyPay.wine'),
            free: { icon: X, text: t('pricing.whyPay.free.wine'), color: 'text-gray-400' },
            pro: { icon: Wine, text: t('pricing.whyPay.pro.wine'), color: 'text-primary-400' },
        },
        {
            feature: t('pricing.whyPay.host'),
            free: { icon: Frown, text: t('pricing.whyPay.free.host'), color: 'text-gray-400' },
            pro: { icon: Sparkles, text: t('pricing.whyPay.pro.host'), color: 'text-accent-400' },
        },
    ]

    return (
        <section className="py-16 md:py-24 relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="home-heading-2 text-white mb-4">
                        {t('pricing.whyPay.title')}
                    </h2>
                    <p className="text-white/60 text-lg">
                        {t('pricing.whyPay.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                    {/* VS Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-black italic z-20 shadow-lg border-4 border-[#0a0a1a] hidden md:flex">
                        VS
                    </div>

                    {/* Other Parties */}
                    <m.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="rounded-3xl p-8 bg-white/5 border border-white/10 grayscale opacity-80"
                    >
                        <h3 className="text-xl font-bold text-white/60 mb-6 flex items-center justify-center gap-2">
                            <Frown className="w-6 h-6" />
                            {t('pricing.whyPay.badParty')}
                        </h3>
                        <div className="space-y-6">
                            {comparison.map((item, i) => (
                                <div key={i} className="text-center md:text-right">
                                    <p className="text-xs text-white/30 uppercase tracking-widest mb-1">{item.feature}</p>
                                    <p className="text-white/60 flex items-center justify-center md:justify-end gap-2">
                                        {item.free.text}
                                        <item.free.icon className="w-4 h-4 text-white/30" />
                                    </p>
                                </div>
                            ))}
                        </div>
                    </m.div>

                    {/* Cheersin Party */}
                    <m.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="rounded-3xl p-8 bg-gradient-to-br from-primary-900/40 to-[#0a0a1a] border border-primary-500/30 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-primary-500/10 blur-3xl" />
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-center gap-2 relative z-10">
                            <Sparkles className="w-6 h-6 text-yellow-400" />
                            {t('pricing.whyPay.goodParty')}
                        </h3>
                        <div className="space-y-6 relative z-10">
                            {comparison.map((item, i) => (
                                <div key={i} className="text-center md:text-left">
                                    <p className="text-xs text-primary-300/50 uppercase tracking-widest mb-1">{item.feature}</p>
                                    <p className="text-white font-bold flex items-center justify-center md:justify-start gap-2 text-lg">
                                        <item.pro.icon className={`w-5 h-5 ${item.pro.color}`} />
                                        {item.pro.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </m.div>
                </div>
            </div>
        </section>
    )
}
