'use client'

import { m } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { useTranslation } from '@/contexts/I18nContext'
import { usePathname } from 'next/navigation'
import { useGameReduceMotion } from './GameWrapper'

/**
 * R2-Extra: Mobile Sticky Footer for Games (Unlock All Features)
 * Shows only on mobile when user is on free tier
 */
export function GameStickyFooter() {
    const reducedMotion = useGameReduceMotion()
    const { tier } = useSubscription()
    const { t } = useTranslation()
    const pathname = usePathname()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Show only on game routes (e.g., /games/xxx) and free tier
        // Also avoid showing on /games (lobby) if desired, but maybe okay.
        // Let's say specific game pages contain '/games/' but not just '/games'?
        // Actually, usually structure is /games/[id].
        // Let's show on any page starting with /games/
        const isGamePage = pathname?.startsWith('/games/')

        if (tier === 'free' && isGamePage) {
            setIsVisible(true)
        } else {
            setIsVisible(false)
        }
    }, [tier, pathname])

    if (!isVisible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden safe-area-pb">
            <m.div
                initial={reducedMotion ? false : { y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={reducedMotion ? { duration: 0 } : undefined}
                className="relative"
            >
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute -top-3 -right-2 p-2 bg-dark-800 rounded-full border border-white/10 text-white/50 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center games-focus-ring"
                    aria-label="關閉升級提示"
                >
                    <X className="w-3 h-3" />
                </button>
                <Link href="/pricing">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl p-3 shadow-lg shadow-primary-900/50 flex items-center justify-between border border-primary-400/30 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/10">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-white leading-tight">
                                    {t('common.unlockAll')}
                                </p>
                                <p className="text-[10px] text-primary-100/80">
                                    {t('common.unlockAllDesc')}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white text-primary-600 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">
                            {t('upgrade.cta')}
                        </div>
                    </div>
                </Link>
            </m.div>
        </div>
    )
}
