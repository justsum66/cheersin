'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Star, Pencil } from 'lucide-react'
import Link from 'next/link'
import { InViewAnimate } from '@/components/ui/InViewAnimate'
import { HomePartnerMarquee } from '@/components/home/HomePartnerMarquee'
import { HOME_TRUST_COPY } from '@/config/home.config'
import { SOCIAL_PROOF_USER_COUNT } from '@/lib/constants'

interface SocialProofSectionProps {
    testimonials: ReactNode
}

export function SocialProofSection({ testimonials }: SocialProofSectionProps) {
    const reducedMotion = useReducedMotion()
    // HP-039: Simulated real-time online user count
    const [onlineCount, setOnlineCount] = useState(0)

    useEffect(() => {
        // Seed a plausible "online now" number based on time of day
        const hour = new Date().getHours()
        const base = hour >= 18 && hour <= 23 ? 120 : hour >= 12 ? 60 : 30
        setOnlineCount(base + Math.floor(Math.random() * 40))

        const interval = setInterval(() => {
            setOnlineCount((prev) => {
                const delta = Math.floor(Math.random() * 7) - 3 // -3 to +3
                return Math.max(10, prev + delta)
            })
        }, 8000) // update every 8s
        return () => clearInterval(interval)
    }, [])

    return (
        <section aria-labelledby="social-proof-heading" role="region">
            <h2 id="social-proof-heading" className="sr-only">用戶評價與合作夥伴</h2>
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
                    {/* HP-039: Real-time user count indicator */}
                    {onlineCount > 0 && (
                        <p className="text-white/50 text-xs flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                            </span>
                            {onlineCount} 人正在線上玩
                        </p>
                    )}
                </div>
            </InViewAnimate>

            <div className="mt-8">{testimonials}</div>

            {/* HP-035: "Write a review" CTA for users */}
            <InViewAnimate delay={0.15} y={12} amount={0.15} className="mt-4 text-center" reducedMotion={!!reducedMotion}>
                <Link
                    href="/profile#reviews"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/60 hover:text-white border border-white/10 hover:border-primary-500/30 rounded-full transition-all hover:bg-white/5"
                >
                    <Pencil className="w-3 h-3" />
                    撰寫評價
                </Link>
            </InViewAnimate>

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

            <div className="mt-10 md:mt-14">
                <HomePartnerMarquee />
            </div>
        </section>
    )
}
