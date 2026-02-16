'use client'

import { memo, useState, useRef, useCallback } from 'react'
import { m, useScroll, useTransform, useReducedMotion, type TargetAndTransition } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, Gamepad2, BookOpen, MessageCircle, GraduationCap, type LucideIcon } from 'lucide-react'
import { FeatureIcon } from '@/components/ui/FeatureIcon'
import { InViewAnimate } from '@/components/ui/InViewAnimate'
import { HOME_COPY } from '@/config/home-copy'
import { BENTO_CARDS } from '@/config/home.config'

/** R2-080：各區塊圖標獨特入場動畫 */
const BENTO_ICON_ANIMATIONS: Record<string, { initial: TargetAndTransition; animate: TargetAndTransition }> = {
    quiz: { initial: { scale: 0, rotate: -10 }, animate: { scale: 1, rotate: 0 } },
    games: { initial: { y: 20, rotateX: 15 }, animate: { y: 0, rotateX: 0 } },
    'script-murder': { initial: { opacity: 0, x: -12 }, animate: { opacity: 1, x: 0 } },
    assistant: { initial: { scale: 0.5, opacity: 0 }, animate: { scale: 1, opacity: 1 } },
    learn: { initial: { y: -10, opacity: 0 }, animate: { y: 0, opacity: 1 } },
}

/** P1-048：Bento 卡片 hover 光暈追隨鼠標；任務 19：3D 傾角 */
const BentoCard = memo(function BentoCard({ cardId, href, icon: Icon, title, description, delay, badge, reducedMotion }: {
    cardId: string
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
    const iconAnim = BENTO_ICON_ANIMATIONS[cardId] ?? { initial: { opacity: 0 }, animate: { opacity: 1 } }

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
                <m.div
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    whileHover={reducedMotion ? undefined : { rotateX: 1.5, rotateY: -1.5, translateZ: 6, scale: 1.02 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="card-glow-hover glass-card-spotlight bento-card-hover p-4 md:p-5 group hover:border-primary-500/50 hover:shadow-[0_0_30px_rgba(255,46,99,0.2)] h-full flex flex-col relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10"
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
                    {/* R2-037：Bento 卡片 hover 時圖標旋轉 15deg、背景微亮；R2-080：圖標獨特入場 */}
                    <div className="flex items-start justify-between mb-2 md:mb-3 relative z-10">
                        <m.span
                            className="inline-block transition-transform duration-200 group-hover:rotate-[15deg] group-hover:brightness-110"
                            initial={reducedMotion ? { opacity: 1, scale: 1 } : iconAnim.initial}
                            whileInView={reducedMotion ? undefined : iconAnim.animate}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.4, delay: delay + 0.1, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <FeatureIcon icon={Icon} size="md" color="primary" />
                        </m.span>
                        {badge && (
                            <span className="home-badge">{badge}</span>
                        )}
                    </div>
                    <h3 className="home-heading-3 text-white mb-1 md:mb-2 group-hover:text-primary-400 transition-colors duration-200 relative z-10">{title}</h3>
                    <p className="home-body text-white/60 text-xs md:text-sm leading-relaxed line-clamp-2 flex-1 relative z-10">{description}</p>
                </m.div>
            </Link>
        </InViewAnimate >
    )
})

export function FeaturesSection() {
    const containerRef = useRef<HTMLElement>(null)
    const reducedMotion = useReducedMotion()

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    })

    /** P1-055：Features 區背景裝飾視差 — 滾動時 subtle 位移增加深度 */
    const featuresParallaxY = useTransform(
        scrollYProgress,
        reducedMotion ? [0, 1] : [0, 1],
        reducedMotion ? ['0%', '0%'] : ['-5%', '15%'] // Slightly different range for section-relative scroll
    )

    return (
        <section ref={containerRef} id="home-features" className="py-10 md:py-14 px-4 relative z-10 bg-white/[0.01]" aria-labelledby="home-features-heading">
            <m.div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                style={{ y: featuresParallaxY }}
                aria-hidden
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: 'var(--hero-glow-primary)' }} />
            </m.div>
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
                            cardId={card.id}
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
    )
}
