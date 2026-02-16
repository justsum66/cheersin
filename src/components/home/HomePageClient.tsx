'use client'

import './home.css'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useReducedMotion } from 'framer-motion'
import Link from 'next/link'
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

interface HomePageClientProps {
  testimonials: ReactNode
  faq: ReactNode
}

export default function HomePageClient({ testimonials, faq }: HomePageClientProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const [soulWineName, setSoulWineName] = useState<string | null>(null)

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
      <ParticleBubbles reducedMotion={!!reducedMotion} />

      {/* E21/E08：Hero 區 role=banner、100svh、E09 safe-area 底部 */}
      <HeroSection />

      {/* H83：ResubscribeBanner 置於 Hero 下方，不遮擋首屏主 CTA */}
      <ResubscribeBanner />

      {/* Task 12: Party Host Persona ("Be the Hero") - Merged with ROI value */}
      <HeroPersonaSection />

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
      <HomeFeaturedGames />

      {/* R2-117：品牌故事區 — InView 左右交錯入場 */}
      <StorySection />

      {/* Social Proof: Testimonials + Trust + Partners */}
      <SocialProofSection testimonials={testimonials} />

      {/* Footer & FAQ */}
      <HomeFooter faq={faq} />
    </div>
  )
}
