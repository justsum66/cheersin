'use client'

/**
 * R2-105：特色遊戲 3D 輪播 — 首頁熱門遊戲旋轉木馬
 * reducedMotion 時改為 2D 水平輪播
 */
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { m , AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { gamesWithCategory } from '@/config/games.config'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { GameWithCategory } from '@/config/games.config'

const FEATURED_GAMES = gamesWithCategory
  .filter((g) => g.popular === true)
  .slice(0, 5)

export function HomeGamesCarousel3D() {
  const [index, setIndex] = useState(0)
  const reducedMotion = usePrefersReducedMotion()

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % FEATURED_GAMES.length)
  }, [])
  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + FEATURED_GAMES.length) % FEATURED_GAMES.length)
  }, [])

  if (FEATURED_GAMES.length === 0) return null

  if (reducedMotion) {
    return (
      <section className="py-10 md:py-14 border-t border-white/10 bg-white/[0.02]" aria-labelledby="home-featured-games-heading">
        <h2 id="home-featured-games-heading" className="text-center text-lg font-bold text-white mb-6">
          精選派對遊戲
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
          {FEATURED_GAMES.map((game, i) => (
            <Link
              key={game.id}
              href={`/games?game=${game.id}`}
              className="flex-shrink-0 w-[180px] snap-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/30 transition-colors"
            >
              <game.icon className="w-10 h-10 text-primary-400 mb-2" aria-hidden />
              <p className="font-semibold text-white text-sm truncate">{game.name}</p>
              <p className="text-white/50 text-xs mt-0.5 truncate">{game.short_description || game.description.slice(0, 20)}</p>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  const current = FEATURED_GAMES[index] as GameWithCategory
  const radius = 180
  const total = FEATURED_GAMES.length

  return (
    <section className="py-10 md:py-14 border-t border-white/10 bg-white/[0.02]" aria-labelledby="home-featured-games-heading">
      <h2 id="home-featured-games-heading" className="text-center text-lg font-bold text-white mb-8">
        精選派對遊戲
      </h2>
      <div className="relative flex items-center justify-center min-h-[220px] perspective-1000">
        <button
          type="button"
          onClick={prev}
          className="absolute left-2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 transition-colors -translate-y-1/2 top-1/2"
          aria-label="上一個遊戲"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 transition-colors -translate-y-1/2 top-1/2"
          aria-label="下一個遊戲"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        <div
          className="relative w-full max-w-[320px] mx-auto"
          style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
        >
          <AnimatePresence mode="wait">
            <m.div
              key={current.id}
              initial={{ opacity: 0, rotateY: -30, scale: 0.9 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: 30, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Link
                href={`/games?game=${current.id}`}
                className="block p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/30 transition-colors group"
              >
                <current.icon className="w-14 h-14 text-primary-400 mb-3 group-hover:scale-110 transition-transform" aria-hidden />
                <p className="font-bold text-white text-lg">{current.name}</p>
                <p className="text-white/50 text-sm mt-1 line-clamp-2">
                  {current.short_description || current.description}
                </p>
                <span className="inline-flex items-center gap-1 mt-3 text-primary-400 text-sm font-medium">
                  立即遊玩
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </m.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="遊戲輪播指標">
        {FEATURED_GAMES.map((g, i) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setIndex(i)}
            role="tab"
            aria-selected={index === i}
            aria-label={`遊戲 ${i + 1}：${g.name}`}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === i ? 'bg-primary-500 w-6' : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
