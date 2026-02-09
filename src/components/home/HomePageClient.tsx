'use client'

import { memo, useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useRef, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Sparkles,
  MessageCircle,
  ArrowRight,
  GraduationCap,
  Gamepad2,
  BookOpen,
  Instagram,
  Facebook,
  Send,
  ChevronDown,
  Quote,
} from 'lucide-react'

/** Code splitting：首屏外組件延後載入，縮小首頁 bundle */
const ResubscribeBanner = dynamic(() => import('@/components/ResubscribeBanner'), { ssr: false, loading: () => null })
const SpringDrag = dynamic(
  () => import('@/components/ui/SpringDrag').then((m) => ({ default: m.SpringDrag })),
  { ssr: false, loading: () => null }
)

/** 任務 30 / HOME_30：多語預留；T018 P2：品牌感年輕、適合社交 — 用語一致「派對」「輕鬆」「一起」 */
const HOME_COPY = {
  heroTitle1: '探索你的',
  heroTitle2: '靈魂之酒',
  /** H04：副標由 config 驅動，HOME_COPY 保留相容 */
  heroSubtitle: HERO_SUBTITLE_VARIANTS[0],
  heroSubtitleB: HERO_SUBTITLE_VARIANTS[1],
  /** P0-007：首屏唯一主 CTA 為靈魂酒測 */
  ctaQuiz: '開始靈魂酒測',
  ctaQuizHint: '免費 · 約 30 秒',
  ctaAssistant: 'AI 侍酒師諮詢',
  ctaGames: '派對遊樂場',
  ctaBadge: '限時免費',
  featuresLabel: HOME_FEATURES_LABEL,
  featuresTitle: '重新定義品酒體驗',
  featuresDesc: '四大功能，一起探索，價值一目了然。懲罰可自訂，不飲酒也能同樂。立即開始測驗或選一款遊戲試玩。',
  statsTrust: `${SOCIAL_PROOF_USER_COUNT.toLocaleString('en-US')}+ 用戶信賴 Cheersin`,
  ctaFooterTitle: '30 秒輕鬆開始你的品酒之旅',
  ctaFooterDesc: '永久免費方案，隨時註冊，輕鬆升級 Pro，隨時取消。',
  ctaFooterButton: COPY_CTA_IMMEDIATE_QUIZ,
} as const
import Image from 'next/image'
import FeatureIcon from '@/components/ui/FeatureIcon'
import ParticleBubbles from '@/components/ParticleBubbles'
import { LOGO_SRC, BRAND_NAME } from '@/components/BrandLogo'
import { InViewAnimate } from '@/components/ui/InViewAnimate'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useTranslation } from '@/contexts/I18nContext'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'
import { SOCIAL_PROOF_USER_COUNT } from '@/lib/constants'
import { HERO_SUBTITLE_VARIANTS, HERO_ANIMATION_DELAYS, HOME_TRUST_COPY, HOME_AVATAR_LETTERS, HOME_FEATURES_LABEL, FOOTER_DRINK_NOTE, FOOTER_DRINK_NOTE_BOTTOM, BENTO_CARDS } from '@/config/home.config'
import { COPY_CTA_IMMEDIATE_QUIZ } from '@/config/copy.config'
import toast from 'react-hot-toast'
import { CountUp } from '@/components/ui/CountUp'

interface HomePageClientProps {
  testimonials: ReactNode
  faq: ReactNode
}

export default function HomePageClient({ testimonials, faq }: HomePageClientProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const reducedMotion = useReducedMotion()
  /** EXPERT_60 P0：A/B 副標 variant（0=現有、1=30秒命定酒款），用於 analytics */
  const [heroVariant, setHeroVariant] = useState<0 | 1>(0)
  /** EXPERT_60 P3：推薦與個人化 — 有靈魂酒測結果時顯示「根據你的靈魂酒款」區塊 */
  const [soulWineName, setSoulWineName] = useState<string | null>(null)
  /** AUDIT #8：訂閱表單 loading 態與防重複送出 */
  const [subscribeSubmitting, setSubscribeSubmitting] = useState(false)
  useEffect(() => {
    setHeroVariant(Math.random() < 0.5 ? 0 : 1)
  }, [])
  /** E05 / T001 P0：Hero 曝光 variant 追蹤，供 7 天後依 /quiz 進入率與跳出率決策全量 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'hero_view', value: 1, id: `variant_${heroVariant}` }),
      }).catch(() => {})
    } catch { /* noop */ }
  }, [heroVariant])
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
  const heroSubtitleText = HERO_SUBTITLE_VARIANTS[heroVariant]
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  /** 任務 11：視差曲線 — 多關鍵幀 ease-out，避免線性暈眩；prefers-reduced-motion 時不位移 */
  const parallaxAmount = reducedMotion ? '0%' : '25%'
  const heroY = useTransform(
    scrollYProgress,
    reducedMotion ? [0, 1] : [0, 0.15, 0.4, 0.7, 1],
    reducedMotion ? ['0%', '0%'] : ['0%', '2%', '8%', '16%', parallaxAmount]
  )
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const logoY = useTransform(scrollYProgress, [0, 0.8], ['0%', reducedMotion ? '0%' : '12%'])
  const titleY = useTransform(scrollYProgress, [0, 0.7], ['0%', reducedMotion ? '0%' : '16%'])
  const subtitleY = useTransform(scrollYProgress, [0, 0.6], ['0%', reducedMotion ? '0%' : '18%'])
  const buttonsY = useTransform(scrollYProgress, [0, 0.5], ['0%', reducedMotion ? '0%' : '20%'])

  /** H10：滾動指示器約 3s 內保持可見後淡出 */
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.05, 0.2], [1, 1, 0])

  /** P1-055：Features 區背景裝飾視差 — 滾動時 subtle 位移增加深度 */
  const featuresParallaxY = useTransform(
    scrollYProgress,
    reducedMotion ? [0.2, 0.6] : [0.15, 0.35, 0.55],
    reducedMotion ? ['0%', '0%'] : ['0%', '6%', '12%']
  )

  return (
    <div ref={containerRef} className="relative overflow-x-hidden home-brand-pattern" role="region" aria-label="Cheersin 首頁">
      <ParticleBubbles reducedMotion={!!reducedMotion} />

      {/* E21/E08：Hero 區 role=banner、100svh、E09 safe-area 底部 */}
      <section
        role="banner"
        className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 pt-0 overflow-hidden home-hero-gradient safe-area-pb-hero page-container-mobile"
        aria-label="你的 AI 派對靈魂伴侶：靈魂酒測、選遊戲、問酒款、派對桌遊、品酒學院，一站滿足。"
      >
        {/* 氣泡動畫延伸至 Hero：absolute 填滿 Hero 區，z-[2] 在漸層之上、內容之下 */}
        <ParticleBubbles reducedMotion={!!reducedMotion} absolute />
        {/* 任務 6：暗角 vignette，四角輕微變暗 */}
        <div className="absolute inset-0 z-[1] pointer-events-none home-hero-vignette" aria-hidden />
        {/* H23：光暈 will-change 僅在動畫時，減少重繪 */}
        <div className={`absolute inset-0 z-0 pointer-events-none opacity-50 ${!reducedMotion ? 'will-change-[opacity]' : ''}`} aria-hidden>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow" style={{ backgroundColor: 'var(--hero-glow-primary)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow animation-delay-400" style={{ backgroundColor: 'var(--hero-glow-secondary)' }} />
        </div>
        <motion.div
          className={`absolute inset-0 z-0 pointer-events-none ${!reducedMotion ? 'will-change-transform' : ''}`}
          style={{ y: heroY, opacity: heroOpacity }}
          aria-hidden
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] mix-blend-screen" style={{ backgroundColor: 'var(--hero-glow-primary)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] mix-blend-screen" style={{ backgroundColor: 'var(--hero-glow-secondary)' }} />
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto text-center w-full page-container-mobile px-4 sm:px-6 lg:px-8">
          {/* E13/E15/E34：Logo LCP 優先、sizes 提示、入場 delay 可配置 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: HERO_ANIMATION_DELAYS.logo }}
            style={{ y: logoY }}
            className="flex flex-col items-center justify-center mb-4"
          >
            <Image
              src={LOGO_SRC}
              alt={BRAND_NAME}
              width={128}
              height={128}
              sizes="(max-width: 640px) 96px, 128px"
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-lg"
              priority
              fetchPriority="high"
              decoding="async"
            />
          </motion.div>

          {/* E22/E23/E33：h1 唯一、aria-describedby 副標、入場 delay 可配置 */}
          {/* P1：Hero 主標使用 design token --text-hero、leading-tight */}
          {/* Phase 1 A3.1: 標題 gradient text 動畫增強 */}
          {/* Phase 1 A2.3: text-balance 平衡換行 */}
          <motion.h1
            id="hero-heading"
            style={{ y: titleY, lineHeight: 1.08 }}
            className="home-heading-1 font-display font-bold mb-4 md:mb-6 tracking-tighter leading-tight text-balance"
            aria-describedby="hero-subtitle"
          >
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: HERO_ANIMATION_DELAYS.title1 }}
              className="block text-white"
            >
              {t('common.heroTitle1')}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: HERO_ANIMATION_DELAYS.title2 }}
              className="block gradient-text-animated pb-2"
              style={{
                backgroundImage: 'linear-gradient(90deg, #8B0000 0%, #D4AF37 25%, #8A2BE2 50%, #D4AF37 75%, #8B0000 100%)',
                backgroundSize: '200% 100%',
              }}
            >
              {t('common.heroTitle2')}
            </motion.span>
          </motion.h1>

          {/* E04/E35：副標 text-balance、id 供 aria-describedby、delay 可配置 */}
          <motion.p
            id="hero-subtitle"
            style={{ y: subtitleY }}
            className="home-subtitle text-white/90 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: HERO_ANIMATION_DELAYS.subtitle }}
          >
            {heroSubtitleText}
          </motion.p>

          {/* E36/E11：CTA 區入場 delay 可配置、間距一致；R2-099 CTA 區塊背景漸層動畫 */}
          <motion.div
            style={{ y: buttonsY }}
            className={`relative rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-2 ${!reducedMotion ? 'hero-cta-bg-gradient' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: HERO_ANIMATION_DELAYS.cta }}
          >
            {/* EXPERT_60 P0：單一主 CTA；次 CTA 改為文字連結；點擊送 analytics variant；AUDIT #38 主 CTA 為 Link 包內層 div 以套 btn-primary，語意為導向 /quiz 之 CTA */}
            {/* Phase 1 A2.3 + B2.1: 套用 text-balance 與 btn-press-scale */}
            <Link
              href="/quiz"
              aria-label={t('common.cta')}
              aria-describedby="hero-cta-hint"
              className="w-full sm:w-auto order-2 sm:order-1 rounded-2xl outline-none games-focus-ring transition-[box-shadow,transform] duration-200 hover:shadow-hero-glow"
              onClick={() => {
                try {
                  fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'hero_cta_quiz', value: 1, id: `variant_${heroVariant}` }),
                  }).catch(() => {})
                } catch { /* noop */ }
              }}
            >
              <div className={`btn-primary btn-press-scale hero-cta-primary flex items-center justify-center gap-3 text-base md:text-lg group cursor-pointer games-touch-target ${!reducedMotion ? 'hero-cta-glow-pulse' : ''}`}>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                <span>{t('common.cta')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </Link>
            {/* P0-007：派對遊樂場弱化為文字連結；主 CTA 僅靈魂酒測 */}
            <div className="order-1 sm:order-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link
                href="/games"
                className="text-white/60 hover:text-white/80 text-sm font-medium underline underline-offset-2 transition-colors min-h-[44px] flex items-center gap-1.5"
                aria-label={t('nav.games')}
              >
                <Gamepad2 className="w-4 h-4 shrink-0" aria-hidden />
                {t('nav.games')}
              </Link>
              <Link
                href="/assistant"
                className="text-white/70 hover:text-white text-sm font-medium underline underline-offset-2 transition-colors min-h-[44px] flex items-center gap-1.5"
                aria-label={t('nav.assistant')}
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden />
                {t('nav.assistant')}
              </Link>
              <Link
                href="/learn"
                className="text-white/70 hover:text-white text-sm font-medium underline underline-offset-2 transition-colors min-h-[44px] flex items-center gap-1.5"
                aria-label={t('nav.learn')}
              >
                <GraduationCap className="w-4 h-4 shrink-0" aria-hidden />
                {t('nav.learn')}
              </Link>
            </div>
            {/* H13：限時 badge 不遮擋 CTA — relative z-0 */}
            <span className={`order-1 sm:order-3 home-badge shrink-0 mt-1 sm:mt-0 sm:ml-1 relative z-0 ${!reducedMotion ? 'home-badge-pulse' : ''}`}>
              {HOME_COPY.ctaBadge}
            </span>
          </motion.div>
          {/* E27/E49：CTA 提示對比度 WCAG AA、供主 CTA aria-describedby */}
          <p id="hero-cta-hint" className="text-white/70 text-sm mt-5 mb-0 order-last w-full">{HOME_COPY.ctaQuizHint}</p>
        </div>

        {/* E12/E37/E38/E29：滾動指示器底邊距、延遲淡出、reducedMotion 時靜態、aria-hidden */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: HERO_ANIMATION_DELAYS.scrollIndicator, duration: 0.6 }}
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none"
          aria-hidden
        >
          <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
          <motion.div
            animate={reducedMotion ? { opacity: 0.5 } : { opacity: [0.4, 0.65, 0.4] }}
            transition={reducedMotion ? {} : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-6 h-6 text-white/50" aria-hidden />
          </motion.div>
        </motion.div>
      </section>

      {/* H83：ResubscribeBanner 置於 Hero 下方，不遮擋首屏主 CTA */}
      <ResubscribeBanner />

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

      {/* B07/B39：Features 區 aria-labelledby、id 供錨點；P1-055 視差裝飾 */}
      <section id="home-features" className="py-10 md:py-14 px-4 relative z-10 bg-white/[0.01]" aria-labelledby="home-features-heading">
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ y: featuresParallaxY }}
          aria-hidden
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: 'var(--hero-glow-primary)' }} />
        </motion.div>
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto relative z-10">
          {/* B09/B10：Core Features 標籤與主標可配置 */}
          <InViewAnimate delay={0} y={16} amount={0.15} reducedMotion={!!reducedMotion}>
            <div className="text-center mb-6 md:mb-8">
              <span className="text-primary-500 font-mono text-xs tracking-widest uppercase mb-1 block">
                {HOME_COPY.featuresLabel}
              </span>
              <h2 id="home-features-heading" className="home-heading-2 text-white mb-2 text-balance">{HOME_COPY.featuresTitle}</h2>
              <p className="home-text-muted home-body max-w-xl mx-auto text-balance">
                {HOME_COPY.featuresDesc}
                {' '}
                詳見<Link href="/games" className="text-primary-400 hover:text-primary-300 underline underline-offset-1 focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a] rounded">派對遊樂場</Link>，懲罰可自訂、不飲酒也能玩。
              </p>
            </div>
          </InViewAnimate>

          {/* B01/B29/B50：Bento 網格、四卡文案由 config 驅動 */}
          {/* Phase 1 B1.2: 卡片 stagger 動畫優化 - 增加延遲變化 */}
          <div className="home-bento-grid">
            {BENTO_CARDS.map((card, i) => (
              <BentoCard
                key={card.id}
                href={card.id === 'quiz' ? '/quiz' : card.id === 'games' ? '/games' : card.id === 'script-murder' ? '/script-murder' : card.id === 'assistant' ? '/assistant' : '/learn'}
                icon={card.id === 'quiz' ? Sparkles : card.id === 'games' ? Gamepad2 : card.id === 'script-murder' ? BookOpen : card.id === 'assistant' ? MessageCircle : GraduationCap}
                title={card.title}
                description={card.description}
                delay={i * 0.12 + 0.05}
                badge={'badge' in card ? card.badge : undefined}
                reducedMotion={!!reducedMotion}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 border-t border-white/10 bg-white/[0.02]" aria-labelledby="home-stats-heading">
        <h2 id="home-stats-heading" className="sr-only">用戶數據與評價</h2>
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4">
          {/* 社會認證橫幅：「12,000+ 用戶信賴」+ 媒體 Logo 列 */}
          {/* 任務 40：社會認證區 — 標題/數字層級分明；任務 39：媒體佔位改為圖標 */}
          {/* AUDIT #14：社會認證區 intersection 閾值 0.05 延後觸發 */}
          <InViewAnimate delay={0} y={16} amount={0.05} reducedMotion={!!reducedMotion}>
            <div className="text-center py-4 px-4 rounded-xl bg-white/[0.04] border border-white/10 mb-6">
              <p className="home-stats-trust text-sm mb-3">{HOME_COPY.statsTrust}</p>
              <div className="flex items-center justify-center gap-6 flex-wrap" role="group" aria-label="媒體與用戶評價">
                <span className="sr-only">用戶頭像與媒體評價</span>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30"
                    aria-hidden
                  >
                    <Quote className="w-5 h-5" />
                  </div>
                ))}
              </div>
            </div>
          </InViewAnimate>

          {/* H50：統計數字 id 供 aria-describedby */}
          <InViewAnimate delay={0} y={16} amount={0.15} reducedMotion={!!reducedMotion}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <div id="home-stats-users" className="text-center md:text-left group cursor-default" title="累積註冊並完成至少一次測驗的用戶數">
                <p className="home-stats-num text-white">
                  <CountUp endValue={SOCIAL_PROOF_USER_COUNT} suffix="+" duration={1800} title="累積註冊並完成至少一次測驗的用戶數" reducedMotion={!!reducedMotion} />
                </p>
                <p className="home-text-muted uppercase tracking-widest text-xs md:text-sm mt-1">活躍用戶</p>
              </div>
              <div className="h-10 w-px bg-white/10 hidden md:block" aria-hidden />
              <div id="home-stats-satisfaction" className="text-center md:text-left group cursor-default" title="完成靈魂酒測後對推薦結果表示滿意之比例">
                <p className="home-stats-num text-white">
                  <CountUp endValue={98} suffix="%" duration={1500} title="完成靈魂酒測後對推薦結果表示滿意之比例" reducedMotion={!!reducedMotion} />
                </p>
                <p className="home-text-muted uppercase tracking-widest text-xs md:text-sm mt-1">配對滿意度</p>
              </div>
              <div className="h-10 w-px bg-white/10 hidden md:block" aria-hidden />
              <div id="home-stats-24-7" className="text-center md:text-left" title="AI 侍酒師 24 小時待命">
                <p className="home-stats-num text-white">24/7</p>
                <p className="home-text-muted uppercase tracking-widest text-xs md:text-sm mt-1">AI 侍酒師待命</p>
              </div>
            </div>
          </InViewAnimate>

          {/* AUDIT #35：用戶頭像區 role="group"、aria-label 用戶頭像；每格 title 輔助說明 */}
          {/* H28/H41：用戶頭像區 role/aria-label；頭像字母可配置 */}
          <InViewAnimate delay={0.1} y={16} amount={0.15} className="mt-8" reducedMotion={!!reducedMotion}>
            <div className="flex items-center justify-center gap-2 flex-wrap" role="group" aria-label="用戶頭像">
              {HOME_AVATAR_LETTERS.map((letter, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-primary-500/30 border border-white/10 flex items-center justify-center text-sm font-bold text-white/80"
                  title="用戶頭像"
                >
                  {letter}
                </div>
              ))}
              <span className="text-white/40 text-xs ml-2">與更多用戶一起探索</span>
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
        </div>
      </section>

      {/* 單一 Footer（方案 A）：CTA + 訂閱 + 網站地圖 + 法律與支援 + 版權，僅一處 contentinfo */}
      <footer id="footer-cta-section" className="border-t border-white/10 bg-white/[0.02] py-10 md:py-14 px-4 relative overflow-hidden safe-area-pb print:py-6" role="contentinfo" aria-label="頁尾與網站地圖">
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a2e]/80 via-transparent to-transparent pointer-events-none" aria-hidden />
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h2 id="home-cta-heading" className="home-heading-2 text-white mb-2">{HOME_COPY.ctaFooterTitle}</h2>
            <p className="home-text-muted home-body mb-6 text-balance">{HOME_COPY.ctaFooterDesc}</p>
            <Link
              href="/quiz"
              className="inline-block mb-6 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a]"
              onClick={() => {
                try {
                  fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'footer_cta_quiz', value: 1 }) }).catch(() => {})
                } catch { /* noop */ }
              }}
            >
              <MagneticButton as="span" strength={0.15} className="btn-primary inline-flex px-8 py-4 min-h-[56px] games-touch-target rounded-2xl font-bold text-base hover:scale-105 transition-transform duration-300 cursor-pointer items-center justify-center gap-2 games-focus-ring">
                <Sparkles className="w-5 h-5" /> {HOME_COPY.ctaFooterButton}
              </MagneticButton>
            </Link>
            <p className="text-white/70 text-sm mb-6" role="note" aria-label="飲酒與年齡提醒">{FOOTER_DRINK_NOTE}</p>
            <form
              id="footer-subscribe-form"
              className="flex flex-col gap-3 max-w-md mx-auto mt-2 mb-6 home-footer-form opacity-90 text-sm"
              aria-label="Email 訂閱表單"
              onSubmit={(e) => {
                e.preventDefault()
                if (subscribeSubmitting) return
                setSubscribeSubmitting(true)
                toast.success('已收到！我們會寄送新品與優惠給您。', { duration: 4000 })
                setTimeout(() => setSubscribeSubmitting(false), 2000)
              }}
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <input type="email" placeholder="留下 Email，接收新品與優惠" className="input-glass flex-1 games-touch-target rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-primary-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a]" aria-label="Email 訂閱" disabled={subscribeSubmitting} required />
                <button type="submit" disabled={subscribeSubmitting} className="btn-ghost flex items-center justify-center gap-2 games-touch-target px-6 rounded-xl border border-white/20 text-white/80 hover:text-white hover:border-white/30 transition-colors duration-200 games-focus-ring disabled:opacity-60 disabled:cursor-not-allowed" aria-busy={subscribeSubmitting}>
                  <Send className="w-4 h-4" /> {subscribeSubmitting ? '送出中…' : '訂閱'}
                </button>
              </div>
              <div className="flex flex-col gap-2 text-left">
                <label className="flex items-center gap-2 text-white/70 text-xs cursor-pointer">
                  <input type="checkbox" name="consent_news" className="rounded border-white/30 text-primary-500 focus:ring-primary-400" aria-label="同意接收新品與優惠" required />
                  同意接收新品與優惠
                </label>
                <label className="flex items-center gap-2 text-white/70 text-xs cursor-pointer">
                  <input type="checkbox" name="consent_privacy" className="rounded border-white/30 text-primary-500 focus:ring-primary-400" aria-label="已讀隱私政策" required />
                  已讀<Link href="/privacy" className="text-primary-400 hover:text-primary-300 underline underline-offset-1">隱私政策</Link>
                </label>
              </div>
            </form>
            <div className="flex items-center justify-center gap-4 mb-6 text-white/60" role="navigation" aria-label="社群連結">
              {/* R2-086：社群圖標 hover 品牌色背景擴散 */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-primary-500/30 text-white/70 hover:text-white transition-all duration-200 hover:scale-110" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-primary-500/30 text-white/70 hover:text-white transition-all duration-200 hover:scale-110" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
              <a href="https://line.me" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors" aria-label="Line"><span className="text-sm font-bold">LINE</span></a>
            </div>
            <p className="text-white/70 text-sm mb-8" role="note" aria-label="飲酒提醒">{FOOTER_DRINK_NOTE_BOTTOM}</p>
          </div>

          {/* 網站地圖（原 Footer 內容）：產品／體驗／公司／語系 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">{t('footer.sectionProduct')}</h3>
              <ul className="space-y-2" aria-label={t('footer.sectionProduct')}>
                {[{ href: '/quiz', label: t('nav.quiz') }, { href: '/games', label: t('nav.games') }, { href: '/assistant', label: t('nav.assistant') }, { href: '/learn', label: t('nav.learn') }].map(({ href, label }) => (
                  <li key={href}><Link href={href} className="text-white/60 hover:text-white text-sm transition-colors min-h-[44px] min-w-[44px] flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded" aria-label={label}>{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">體驗</h3>
              <ul className="space-y-2" aria-label="體驗">
                {[{ href: '/script-murder', label: '酒局劇本殺' }, { href: '/party-dj', label: '派對 DJ' }, { href: '/party-room', label: '派對房' }].map(({ href, label }) => (
                  <li key={href}><Link href={href} className="text-white/60 hover:text-white text-sm transition-colors min-h-[44px] min-w-[44px] flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded" aria-label={label}>{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">{t('footer.sectionCompany')}</h3>
              <ul className="space-y-2" aria-label={t('footer.sectionCompany')}>
                {[{ href: '/pricing', label: t('nav.pricing') }, { href: '/privacy', label: t('footer.privacy') }, { href: '/terms', label: t('footer.terms') }].map(({ href, label }) => (
                  <li key={href}><Link href={href} className="text-white/60 hover:text-white text-sm transition-colors min-h-[44px] min-w-[44px] flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded" aria-label={label}>{label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-2">{t('footer.sectionLanguage')}</h3>
              <LocaleSwitcher />
            </div>
          </div>

          {/* 法律與支援：無障礙、狀態、訂閱、取消、聯絡、企業 */}
          <h2 id="footer-links-heading" className="sr-only">法律與支援</h2>
          <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-8 mb-6 text-sm home-footer-link" aria-labelledby="footer-links-heading">
            <Link href="/accessibility" className="games-touch-target inline-flex items-center justify-center px-2 py-2 games-focus-ring rounded">無障礙聲明</Link>
            <span className="text-white/30" aria-hidden>|</span>
            <Link href="/status" className="games-touch-target inline-flex items-center justify-center px-2 py-2 games-focus-ring rounded">系統狀態</Link>
            <span className="text-white/30" aria-hidden>|</span>
            <Link href="/subscription" className="games-touch-target inline-flex items-center justify-center px-2 py-2 games-focus-ring rounded">訂閱管理</Link>
            <span className="text-white/30" aria-hidden>|</span>
            <Link href="/subscription/cancel" className="games-touch-target inline-flex items-center justify-center px-2 py-2 text-white/70 hover:text-white games-focus-ring rounded">取消訂閱</Link>
            <span className="text-white/30" aria-hidden>|</span>
            <a href="mailto:hello@cheersin.app" className="games-touch-target inline-flex items-center justify-center px-2 py-2 games-focus-ring rounded">聯絡我們</a>
            <span className="text-white/30" aria-hidden>|</span>
            <a href="mailto:enterprise@cheersin.app?subject=企業/團體需求&body=您好，我們對 Cheersin 企業或團體方案有興趣。%0D%0A%0D%0A需求類型：%0D%0A預估人數/場次：%0D%0A聯絡人：%0D%0A" className="games-touch-target inline-flex items-center justify-center px-2 py-2 text-white/70 hover:text-white games-focus-ring rounded">企業需求</a>
          </nav>

          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm text-center sm:text-left">{t('footer.copyright').replace('©', `© ${new Date().getFullYear()} `)}</p>
            <p className="text-white/40 text-xs" aria-label="飲酒警語">飲酒過量有害健康</p>
          </div>

          <div className="hidden md:block mt-4">
            <SpringDrag dragDirection="x" dragConstraints={{ left: -60, right: 60, top: 0, bottom: 0 }} className="inline-block cursor-grab active:cursor-grabbing rounded-full px-4 py-2 text-white/40 text-xs border border-white/10 hover:border-white/20 hover:text-white/60">拖曳試試 →</SpringDrag>
          </div>

          <div className="mt-8">{faq}</div>
        </div>
      </footer>
    </div>
  )
}

/** P1-048：Bento 卡片 hover 光暈追隨鼠標；任務 19：3D 傾角 */
const BentoCard = memo(function BentoCard({ href, icon: Icon, title, description, delay, badge, reducedMotion }: {
  href: string
  icon: LucideIcon
  title: string
  description: string
  delay: number
  badge?: string
  reducedMotion?: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [glow, setGlow] = useState<{ x: number; y: number } | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setGlow({ x, y })
  }, [reducedMotion])

  const handleMouseLeave = useCallback(() => setGlow(null), [])

  return (
    <InViewAnimate delay={delay} y={16} duration={0.4} reducedMotion={!!reducedMotion}>
      <Link href={href} className="block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a] transition-[box-shadow] duration-200" aria-label={`${title}：${description}`}>
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={reducedMotion ? undefined : { rotateX: 1.5, rotateY: -1.5, translateZ: 6, scale: 1.02 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="card-3d card-glow-hover glass-card-spotlight bento-card-hover p-4 md:p-5 group hover:border-primary-500/30 hover:shadow-glass-hover h-full flex flex-col relative overflow-hidden"
        >
          {/* P1-048：鼠標追隨光暈，僅在非 reduced-motion 且 hover 時顯示 */}
          {!reducedMotion && glow && (
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              aria-hidden
              style={{
                background: `radial-gradient(circle 80px at ${glow.x}% ${glow.y}%, rgb(var(--primary) / 0.25) 0%, transparent 70%)`,
              }}
            />
          )}
          {/* R2-037：Bento 卡片 hover 時圖標旋轉 15deg、背景微亮 */}
          <div className="flex items-start justify-between mb-2 md:mb-3 relative z-10">
            <span className="inline-block transition-transform duration-200 group-hover:rotate-[15deg] group-hover:brightness-110">
              <FeatureIcon icon={Icon} size="md" color="primary" />
            </span>
            {badge && (
              <span className="home-badge">{badge}</span>
            )}
          </div>
          <h3 className="home-heading-3 text-white mb-1 md:mb-2 group-hover:text-primary-400 transition-colors duration-200 relative z-10">{title}</h3>
          <p className="home-body text-white/60 text-xs md:text-sm leading-relaxed line-clamp-2 flex-1 relative z-10">{description}</p>
        </motion.div>
      </Link>
    </InViewAnimate>
  )
})
