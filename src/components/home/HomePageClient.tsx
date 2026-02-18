'use client'

import './home.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { m, AnimatePresence, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { ArrowUp } from 'lucide-react'
import { type ReactNode } from 'react'

/** Code splitting：首屏外組件延後載入，縮小首頁 bundle */
const ResubscribeBanner = dynamic(() => import('@/components/ResubscribeBanner'), { ssr: false, loading: () => null })

/** R2-105：熱門遊戲 - 改為網格展示，避免 3D 輪播兼容性問題 */
const HomeFeaturedGames = dynamic(
  () => import('./HomeFeaturedGames').then((m) => ({ default: m.HomeFeaturedGames })),
  { ssr: false, loading: () => <div className="py-10 min-h-[200px]" aria-hidden /> }
)

import { HeroSection } from '@/components/home/HeroSection'
import { HeroPersonaSection } from '@/components/home/HeroPersonaSection'
import { StorySection } from '@/components/home/StorySection'
import { SocialProofSection } from '@/components/home/SocialProofSection'
import { HomeFooter } from '@/components/home/HomeFooter'
import ParticleBubbles from '@/components/ParticleBubbles'
import { InViewAnimate } from '@/components/ui/InViewAnimate'
import ErrorBoundaryBlock from '@/components/ErrorBoundaryBlock'

interface HomePageClientProps {
  testimonials: ReactNode
  faq: ReactNode
}

export default function HomePageClient({ testimonials, faq }: HomePageClientProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const [soulWineName, setSoulWineName] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // HP-024: Show scroll-to-top button after scrolling 2 screens
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleScroll = () => {
      const twoScreens = window.innerHeight * 2
      setShowScrollTop(window.scrollY > twoScreens)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [reducedMotion])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('quiz-last-result')
      if (raw) {
        const data = JSON.parse(raw) as { name?: string; type?: string }
        if (data?.name) setSoulWineName(data.type ? `${data.name}（${data.type}）` : data.name)
      }
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <div ref={containerRef} className="relative overflow-x-hidden home-brand-pattern" role="region" aria-label="Cheersin 首頁">
      {/* HP-020: Skip-to-content link as first focusable element for screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        跳至主要內容
      </a>
      <ParticleBubbles reducedMotion={!!reducedMotion} />

      {/* E21/E08：Hero 區 role=banner、100svh、E09 safe-area 底部 */}
      <ErrorBoundaryBlock blockName="HeroSection">
        <HeroSection />
      </ErrorBoundaryBlock>

      {/* H83：ResubscribeBanner 置於 Hero 下方，不遮擋首屏主 CTA */}
      <ErrorBoundaryBlock blockName="ResubscribeBanner">
        <ResubscribeBanner />
      </ErrorBoundaryBlock>

      {/* Task 12: Party Host Persona ("Be the Hero") - Merged with ROI value */}
      {/* HP-020: Main content target for skip link */}
      <main id="main-content">
        <ErrorBoundaryBlock blockName="HeroPersonaSection">
          <HeroPersonaSection />
        </ErrorBoundaryBlock>

      {/* EXPERT_60 P3：有靈魂酒測結果時顯示「根據你的偏好」區塊，提升回訪與個人化體感 */}
      {soulWineName && (
        <section className="py-6 md:py-8 px-4 relative z-10 border-y border-white/10 bg-white/[0.02]" aria-labelledby="home-personalized-heading">
          <div className="max-w-7xl xl:max-w-[1440px] mx-auto">
            <InViewAnimate delay={0} y={12} amount={0.2} reducedMotion={!!reducedMotion}>
              <h2 id="home-personalized-heading" className="sr-only">根據你的靈魂酒款</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 rounded-2xl bg-primary-500/10 border border-primary-500/20 px-6 py-4">
                <p className="text-white/90 text-sm md:text-base text-center sm:text-left">
                  <span className="text-primary-300 font-medium">根據你的靈魂酒款</span>
                  <span className="text-white/50 text-xs ml-1" aria-hidden>（上次測驗結果）</span>
                  <span className="text-white font-semibold mx-1">{soulWineName}</span>
                  <span className="text-white/70">為你推薦</span>
                </p>
                <div className="flex items-center gap-3">
                  <Link href="/assistant" className="btn-primary games-touch-target inline-flex items-center justify-center">
                    AI 侍酒師
                  </Link>
                  <Link href="/quiz" className="btn-secondary games-touch-target inline-flex items-center justify-center">
                    重新測驗
                  </Link>
                </div>
              </div>
            </InViewAnimate>
          </div>
        </section>
      )}

      {/* R2-105：熱門遊戲 - 網格展示 */}
      <ErrorBoundaryBlock blockName="HomeFeaturedGames">
        <HomeFeaturedGames />
      </ErrorBoundaryBlock>

      {/* R2-117：品牌故事區 — InView 左右交錯入場 */}
      <ErrorBoundaryBlock blockName="StorySection">
        <StorySection />
      </ErrorBoundaryBlock>

      {/* Social Proof: Testimonials + Trust + Partners */}
      <ErrorBoundaryBlock blockName="SocialProofSection">
        <SocialProofSection testimonials={testimonials} />
      </ErrorBoundaryBlock>
      </main>

      {/* Footer & FAQ */}
      <ErrorBoundaryBlock blockName="HomeFooter">
        <HomeFooter faq={faq} />
      </ErrorBoundaryBlock>

      {/* HP-024: Scroll-to-top floating button */}
      <AnimatePresence>
        {showScrollTop && (
          <m.button
            type="button"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary-500/90 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label="回到頂部"
          >
            <ArrowUp className="w-5 h-5" />
          </m.button>
        )}
      </AnimatePresence>
    </div>
  )
}
