'use client'

import { m, useReducedMotion } from 'framer-motion'

export function StorySection() {
    const reducedMotion = useReducedMotion()

    return (
        <section className="py-10 md:py-14 border-t border-white/10 bg-white/[0.02]" aria-labelledby="home-story-heading">
            <h2 id="home-story-heading" className="sr-only">關於 Cheersin</h2>
            <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <m.div
                        className="md:pr-4"
                        initial={reducedMotion ? { x: 0, opacity: 1 } : { x: -32, opacity: 0 }}
                        whileInView={reducedMotion ? undefined : { x: 0, opacity: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5, delay: 0, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <span className="text-primary-500 font-mono text-xs tracking-widest uppercase">Our Mission</span>
                        <h3 className="home-heading-2 text-white mt-2 mb-3">We Cure Awkward Silences</h3>
                        <p className="text-white/70 text-sm md:text-base leading-relaxed">
                            我們相信，沒有無聊的派對，只有還沒被點燃的氣氛。<br className="hidden md:block" />
                            Cheersin 是你的口袋派對救星。30 秒內用遊戲破冰、用 AI 選對酒、用音樂帶動全場。<br />
                            <strong>別讓你的派對冷掉，成為傳奇主揪。</strong>
                        </p>
                    </m.div>
                    <m.div
                        className="md:pl-4"
                        initial={reducedMotion ? { x: 0, opacity: 1 } : { x: 32, opacity: 0 }}
                        whileInView={reducedMotion ? undefined : { x: 0, opacity: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center">
                            <p className="text-primary-400 font-semibold text-lg mb-1">破冰 · 遊戲 · 選酒</p>
                            <p className="text-white/50 text-sm">一站搞定所有派對需求</p>
                        </div>
                    </m.div>
                </div>
            </div>
        </section>
    )
}
