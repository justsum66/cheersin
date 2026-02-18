'use client'

import { useState, useEffect, memo } from 'react'
import Link from 'next/link'
import { m } from 'framer-motion'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { gamesWithCategory } from '@/config/games.config'
import { InViewAnimate } from '@/components/ui/InViewAnimate'
import { useTranslation } from '@/contexts/I18nContext'

const FEATURED_GAMES = gamesWithCategory
    .filter((g) => g.popular === true)
    .slice(0, 6)

/** HP-016: Skeleton loader for featured games cards */
const GameCardSkeleton = memo(function GameCardSkeleton() {
    return (
        <div className="snap-center shrink-0 w-[240px] md:w-auto h-full">
            <div className="relative h-[320px] md:h-[280px] rounded-2xl overflow-hidden bg-white/5 border border-white/10 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <div className="mb-3 w-12 h-12 rounded-xl bg-white/10" />
                    <div className="h-6 w-3/4 bg-white/10 rounded mb-2" />
                    <div className="h-3 w-full bg-white/10 rounded mb-1" />
                    <div className="h-3 w-2/3 bg-white/10 rounded" />
                </div>
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>
        </div>
    )
})

export function HomeFeaturedGames() {
    const [isLoading, setIsLoading] = useState(true)
    const { t } = useTranslation()

    // HP-016: Simulate initial loading state for skeleton display
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 100)
        return () => clearTimeout(timer)
    }, [])

    if (FEATURED_GAMES.length === 0) return null

    return (
        <section className="py-12 md:py-20 relative overflow-hidden" aria-labelledby="home-featured-heading">
            {/* Background Decor - Minimal */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/5 to-transparent pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
                <InViewAnimate delay={0} y={20} className="mb-8 md:mb-12 flex items-end justify-between px-2">
                    <div>
                        <h2 id="home-featured-heading" className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                            {t('home.featuredGamesTitle')}
                        </h2>
                        <p className="text-white/60 text-sm md:text-base max-w-lg">
                            {t('home.featuredGamesSubtitle')}
                        </p>
                    </div>
                    <Link href="/games" className="hidden md:flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors text-sm font-bold">
                        {t('home.viewAllGames')} <ArrowRight className="w-4 h-4" />
                    </Link>
                </InViewAnimate>

                {/* HP-016: Show skeleton loader during initial load */}
                {/* Horizontal Scroll Container */}
                <div className="flex overflow-x-auto pb-8 -mx-4 px-6 md:mx-0 md:px-0 gap-4 md:gap-6 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible">
                    {isLoading ? (
                        // Skeleton placeholders
                        Array.from({ length: 6 }).map((_, i) => (
                            <GameCardSkeleton key={`skeleton-${i}`} />
                        ))
                    ) : (
                        FEATURED_GAMES.map((game, i) => (
                        <InViewAnimate key={game.id} delay={i * 0.05} y={20} className="snap-center shrink-0 w-[240px] md:w-auto h-full">
                            <Link
                                href={`/games?game=${game.id}`}
                                className="group block relative h-[320px] md:h-[280px] rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-primary-500/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)] hover:-translate-y-2"
                            >
                                {/* HP-036: Trending badge for top 3 games */}
                                {i < 3 && (
                                    <span className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500/90 to-red-500/90 text-white text-[10px] font-bold shadow-lg">
                                        <TrendingUp className="w-3 h-3" />
                                        Trending
                                    </span>
                                )}
                                {/* Card Image / Gradient - Luxury Dark */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent`} />

                                {/* Icon as big background graphic - Subtle Gold */}
                                <game.icon className="absolute -right-4 -top-4 w-40 h-40 text-white/5 group-hover:text-primary-500/5 transition-colors duration-500 rotate-12" />

                                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                                    <div className="mb-3 w-12 h-12 rounded-xl bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:border-primary-500/50 group-hover:bg-primary-500/10 transition-all duration-500">
                                        <game.icon className="w-5 h-5 text-white/70 group-hover:text-primary-400 transition-colors duration-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-primary-400 transition-colors duration-300 font-display">
                                        {game.name}
                                    </h3>
                                    <p className="text-white/50 text-xs line-clamp-2 leading-relaxed group-hover:text-white/70 transition-colors">
                                        {game.short_description}
                                    </p>
                                </div>
                            </Link>
                        </InViewAnimate>
                        ))
                    )}
                </div>
                <div className="mt-4 text-center md:hidden">
                    <Link href="/games" className="text-white/60 text-sm flex items-center justify-center gap-1">
                        {t('home.viewAllGames')} <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
