'use client'

import { m, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { Beer, Check, X, PartyPopper } from 'lucide-react'
import { InViewAnimate } from '@/components/ui/InViewAnimate'
import { CountUp } from '@/components/ui/CountUp'
import { useTranslation } from '@/contexts/I18nContext'

// HP-014: ROI Section ("Why Pay?") with animated counters
export function RoiSection() {
    const { t } = useTranslation()
    const reducedMotion = useReducedMotion()

    return (
        <section className="py-20 md:py-24 relative overflow-hidden bg-black/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/10 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="home-heading-2 text-white mb-4">Why Go Pro?</h2>
                    <p className="text-xl text-white/70">
                        Is it worth it? Let's do the math.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-4xl mx-auto items-center">

                    {/* The Cost of Average */}
                    <InViewAnimate x={-30} className="relative group">
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                            <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6">
                                <Beer className="w-10 h-10 text-white/50" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">1 Fancy Cocktail</h3>
                            {/* HP-014: Animate counter on scroll-into-view */}
                            <div className="text-4xl font-display font-bold text-white/80 mb-6">
                                $<CountUp endValue={15} duration={1200} suffix=".00" reducedMotion={!!reducedMotion} />
                            </div>
                            <ul className="text-left space-y-3 text-white/60 text-sm mb-8 max-w-[200px] mx-auto">
                                <li className="flex items-center gap-2"><Check className="w-4 h-4" /> Gone in 15 mins</li>
                                <li className="flex items-center gap-2"><X className="w-4 h-4" /> Just a drink</li>
                                <li className="flex items-center gap-2"><X className="w-4 h-4" /> Doesn't save the party</li>
                            </ul>
                            <div className="text-xs uppercase tracking-widest text-white/30 font-bold">The Old Way</div>
                        </div>
                    </InViewAnimate>

                    {/* The Value of Epic */}
                    <InViewAnimate x={30} className="relative z-10">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl blur opacity-30 animate-pulse" />
                        <div className="relative p-8 rounded-3xl bg-[#1a0a2e] border border-primary-500/50 text-center shadow-2xl shadow-primary-500/10 transform md:scale-110">
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl shadow-lg">
                                BEST VALUE
                            </div>

                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/20">
                                <PartyPopper className="w-10 h-10 text-primary-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Unlimited Fun</h3>
                            {/* HP-014: Animate counter on scroll-into-view */}
                            <div className="text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mb-6">
                                $<CountUp endValue={9} duration={1000} suffix=".99" className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400" reducedMotion={!!reducedMotion} /><span className="text-base text-white/40 font-normal">/mo</span>
                            </div>
                            <ul className="text-left space-y-3 text-white mb-8 max-w-[240px] mx-auto font-medium">
                                <li className="flex items-center gap-2 text-secondary-400"><Check className="w-4 h-4" /> Lasts all month</li>
                                <li className="flex items-center gap-2 text-secondary-400"><Check className="w-4 h-4" /> 50+ Party Games</li>
                                <li className="flex items-center gap-2 text-secondary-400"><Check className="w-4 h-4" /> AI Sommelier & DJ</li>
                                <li className="flex items-center gap-2 text-secondary-400"><Check className="w-4 h-4" /> You're the Legend</li>
                            </ul>

                            <Link
                                href="/subscription"
                                className="w-full btn-primary py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 block"
                            >
                                Start Free Trial
                            </Link>
                            <p className="mt-3 text-[10px] text-white/40">Less than the cost of one drink.</p>
                        </div>
                    </InViewAnimate>

                </div>
            </div>
        </section>
    )
}
