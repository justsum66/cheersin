'use client'

import { useState, useEffect, useRef } from 'react'
import { m, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, ArrowRight, Gamepad2, MessageCircle, GraduationCap, ChevronDown } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { LOGO_SRC, BRAND_NAME } from '@/components/BrandLogo'
import { slideUp } from '@/lib/animations'
import { HERO_SUBTITLE_VARIANTS, HERO_ANIMATION_DELAYS } from '@/config/home.config'
import { HOME_COPY } from '@/config/home-copy'
import { PartyEmergencyButton } from '@/components/PartyEmergencyButton'
import confetti from 'canvas-confetti'

export function HeroSection() {
    const containerRef = useRef<HTMLElement>(null)
    const { t, locale } = useTranslation()
    const reducedMotion = useReducedMotion()

    // Locale-based Theme Config
    const isAsian = ['zh-TW', 'zh-CN', 'ja', 'ko'].includes(locale)
    const activeTheme = isAsian ? 'gold' : 'silver'

    // Simplified Analytics Tracking
    useEffect(() => {
        if (typeof window === 'undefined') return
        try {
            fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'hero_view_oled', value: 1, locale }),
            }).catch(() => { })
        } catch { /* noop */ }
    }, [locale])

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    })

    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
    const yRange = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

    const handleConfetti = () => {
        const count = 150;
        const defaults = {
            origin: { y: 0.7 },
            zIndex: 100,
        };

        function fire(particleRatio: number, opts: any) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        // Theme-specific Confetti
        const colors = activeTheme === 'gold'
            ? ['#D4AF37', '#FF2E63', '#FFFFFF'] // Gold/Red/White
            : ['#E5E4E2', '#08D9D6', '#FFFFFF'] // Silver/Cyan/White

        fire(0.25, { spread: 26, startVelocity: 55, colors });
        fire(0.2, { spread: 60, colors });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors });
    }

    return (
        <section
            ref={containerRef}
            role="banner"
            className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 pt-0 overflow-hidden bg-black safe-area-pb-hero page-container-mobile"
            aria-label={t('home.heroDesc')}
        >
            {/* Cinematic Background: OLED Luxury (Deep Black with Locale Accents) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#050505]">
                {/* 1. Base Gradient: Subtle ambient light based on locale */}
                <div
                    className={`absolute inset-0 opacity-40 ${activeTheme === 'gold'
                        ? 'bg-[radial-gradient(circle_at_top,_#1a1005_0%,_#000000_60%)]'
                        : 'bg-[radial-gradient(circle_at_top,_#0a0a1a_0%,_#000000_60%)]'
                        }`}
                />

                {/* 2. Spotlight: Focused, High-End Light */}
                <div
                    className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[120px] mix-blend-screen opacity-20 ${activeTheme === 'gold' ? 'bg-primary-500' : 'bg-secondary-400'
                        }`}
                />

                {/* 3. Floating Dust - Subtle Movement */}
                <div className="absolute inset-0 opacity-30">
                    <div className={`absolute top-1/4 left-1/4 w-1 h-1 rounded-full animate-float-slow ${activeTheme === 'gold' ? 'bg-primary-300' : 'bg-secondary-300'}`} />
                    <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white rounded-full animate-float-medium" />
                    <div className={`absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full animate-float-fast ${activeTheme === 'gold' ? 'bg-accent-400' : 'bg-primary-400'}`} />
                </div>
            </div>

            <m.div
                className="relative z-10 max-w-5xl mx-auto text-center w-full px-4 flex flex-col items-center justify-center min-h-[80vh]"
                style={{ y: reducedMotion ? 0 : yRange, opacity: heroOpacity }}
            >
                {/* Brand Pill - Distinct Style per Locale (Bifurcated) */}
                <m.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className={`mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)] ${isAsian
                            ? 'border-primary-500/50 bg-black/40 text-primary-100'
                            : 'border-white/20 bg-white/5 text-secondary-100'
                        }`}
                >
                    <Sparkles className={`w-4 h-4 animate-pulse ${isAsian ? 'text-primary-400' : 'text-blue-300'}`} />
                    <span className="text-xs font-bold tracking-[0.2em] uppercase">
                        {isAsian ? 'THE ULTIMATE PARTY APP' : 'PREMIUM SOCIAL TOOLKIT'}
                    </span>
                </m.div>

                {/* Massive Typography - BIFURCATED LAYOUTS */}
                {isAsian ? (
                    /* ASIAN LAYOUT: Maximalist, Stacked, Gold */
                    <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-black text-white mb-6 leading-tight tracking-tighter drop-shadow-2xl">
                            <span className="block text-white">
                                {t('home.heroTitle')}
                            </span>
                            <span className="block text-3xl sm:text-5xl md:text-6xl mt-4 font-serif italic text-shimmer">
                                Elevate Your Night
                            </span>
                        </h1>
                    </m.div>
                ) : (
                    /* WESTERN LAYOUT: Minimalist, Clean, Platinum */
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-col items-center gap-4 mb-8"
                    >
                        <h1 className="text-6xl sm:text-8xl font-sans font-bold text-white tracking-tighter">
                            {t('home.heroTitle')}
                        </h1>
                        <p className="text-2xl sm:text-3xl font-light text-secondary-200 tracking-wide">
                            {t('home.heroSubtitle')}
                        </p>
                    </m.div>
                )}

                {/* Subtitle - Only for Asian layout as Western includes it in title block */}
                {isAsian && (
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="max-w-2xl mx-auto mb-10"
                    >
                        <p className="text-lg sm:text-xl text-white/90 font-medium leading-relaxed drop-shadow-md">
                            {t('home.heroSubtitle')}
                        </p>
                    </m.div>
                )}

                {/* High-Contrast CTA Buttons */}
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
                >
                    <Link
                        href="/quiz"
                        onClick={handleConfetti}
                        className={`w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 px-10 py-5 text-black rounded-full text-lg font-bold transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(255,255,255,0.2)] ${activeTheme === 'gold'
                                ? 'bg-gradient-to-r from-primary-100 to-white hover:bg-white'
                                : 'bg-white hover:bg-secondary-100'
                            }`}
                    >
                        <span>{t('home.ctaStart')}</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <PartyEmergencyButton className="w-full sm:w-auto px-10 py-5 rounded-full text-lg font-bold border border-white/30 hover:bg-white/10 backdrop-blur-sm transition-all text-white shadow-[0_0_20px_rgba(255,46,99,0.2)]" />
                </m.div>

                {/* Social Proof - "As seen in" vibe */}
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-8 opacity-40 hover:opacity-100 transition-all duration-500"
                >
                    <div className="text-white/60 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${isAsian ? 'bg-green-500' : 'bg-blue-500'}`} />
                        {t('home.trustBadge')}
                    </div>
                </m.div>
            </m.div>
        </section>
    )
}
