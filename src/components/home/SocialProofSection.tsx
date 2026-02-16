'use client'

import { type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Star } from 'lucide-react'
import { InViewAnimate } from '@/components/ui/InViewAnimate'
import { HomePartnerMarquee } from '@/components/home/HomePartnerMarquee'
import { HOME_TRUST_COPY } from '@/config/home.config'
import { SOCIAL_PROOF_USER_COUNT } from '@/lib/constants'

interface SocialProofSectionProps {
    testimonials: ReactNode
}

export function SocialProofSection({ testimonials }: SocialProofSectionProps) {
    const reducedMotion = useReducedMotion()

    return (
        <section aria-label="用戶評價與合作夥伴">
            {/* H28/H41：用戶頭像區 role/aria-label；頭像字母可配置 */}
            {/* H28/H41：用戶頭像區 role/aria-label；頭像字母可配置 */}
            <InViewAnimate delay={0.1} y={16} amount={0.15} className="mt-8 mb-8" reducedMotion={!!reducedMotion}>
                <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex items-center gap-1 text-[#F59E0B]">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className="w-5 h-5 fill-current drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        ))}
                    </div>
                    <p className="text-white/80 text-lg">
                        Trusted by <span className="text-white font-bold font-display text-xl mx-1">{SOCIAL_PROOF_USER_COUNT.toLocaleString()}</span> Parties
                    </p>
                </div>
            </InViewAnimate>

            <div className="mt-8">{testimonials}</div>

            {/* H34：安全與信任區文案可配置 */}
            <InViewAnimate delay={0.2} y={16} amount={0.15} className="mt-10 pt-8 border-t border-white/10" reducedMotion={!!reducedMotion}>
                <p className="text-center home-text-muted text-xs uppercase tracking-widest mb-4">{HOME_TRUST_COPY.label}</p>
                <div className="flex items-center justify-center gap-6 sm:gap-8 flex-wrap text-white/70 text-sm">
                    {HOME_TRUST_COPY.items.map((item, i) => (
                        <span key={item}>
                            {i > 0 && <span className="text-white/30 mx-1" aria-hidden>·</span>}
                            <span className="inline-flex items-center gap-1.5">{item}</span>
                        </span>
                    ))}
                </div>
            </InViewAnimate>

            {/* R2-095：合作夥伴 Logo 無限滾動 - Moved inside SocialProof for grouped layout, but it was outside section in original. 
          Original structure: Section (Avatars+Testimonials+Trust) -> PartnerMarquee.
          Here we group them.
      */}
            <div className="mt-10 md:mt-14">
                <HomePartnerMarquee />
            </div>
        </section>
    )
}
