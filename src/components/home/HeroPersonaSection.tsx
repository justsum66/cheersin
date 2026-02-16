'use client'

import { m } from 'framer-motion'
import Link from 'next/link'
import { Crown, Zap, Users, ShieldCheck } from 'lucide-react'
import { InViewAnimate } from '@/components/ui/InViewAnimate'
import { useTranslation } from '@/contexts/I18nContext'

// Task 12: Party Host Persona ("Be the Hero")
export function HeroPersonaSection() {
    const { t } = useTranslation()

    return (
        <section className="py-20 md:py-32 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a] pointer-events-none -z-10" />
            <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Copy & Value Prop */}
                    <InViewAnimate x={-50}>
                        <div className="text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-bold uppercase tracking-wider mb-6">
                                <Crown className="w-4 h-4" />
                                <span>For the Party Host</span>
                            </div>

                            <h2 className="home-heading-2 text-white mb-6">
                                Don't let the party <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">die</span>.
                                <br />
                                Be the <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Legend</span>.
                            </h2>

                            <p className="text-xl text-white/70 mb-8 leading-relaxed">
                                尷尬的沉默？無聊的對話？這是派對主揪最大的噩夢。<br />
                                Cheersin 讓你手機裡隨時備好 50+ 款破冰遊戲、調酒指南與氣氛歌單。
                                <br />
                                <strong className="text-white">只要 30 秒，你就是全場的核心。</strong>
                            </p>

                            <div className="flex flex-col gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-secondary-400">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">瞬間破冰</h3>
                                        <p className="text-white/60 text-sm">各種真心話、大冒險、趣味問答隨點即玩。</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-primary-400">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">人人參與</h3>
                                        <p className="text-white/60 text-sm">支援 12+ 人連線遊玩，沒人被冷落。</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-yellow-400">
                                        <Crown className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">超值訂閱</h3>
                                        <p className="text-white/60 text-sm">
                                            一杯調酒的錢 ($15)，換整個月無限暢玩 ($9.99)。<br />
                                            <span className="text-primary-400 text-xs font-bold">CP 值最高的派對投資。</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10">
                                <Link
                                    href="/subscription"
                                    className="btn-primary inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all hover:scale-105"
                                >
                                    成為派對救星
                                </Link>
                            </div>
                        </div>
                    </InViewAnimate>

                    {/* Right: Visual (Abstract Phone/Party Scene) */}
                    <InViewAnimate x={50} delay={0.2}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-secondary-500/20 rounded-3xl blur-3xl transform rotate-6" />
                            <div className="relative bg-[#1a0a2e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl skew-y-[-2deg] hover:skew-y-0 transition-transform duration-700">
                                {/* Mock UI: Host Mode */}
                                <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <div className="text-xs font-mono text-white/50">PARTY_MODE_ACTIVE</div>
                                </div>
                                <div className="p-8 min-h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px]" />

                                    <Crown className="w-20 h-20 text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] animate-pulse-slow" />
                                    <h3 className="text-3xl font-black text-white mb-2">YOU ARE THE HOST</h3>
                                    <p className="text-secondary-400 font-mono mb-8 tracking-widest">LEVEL: LEGEND</p>

                                    <div className="w-full bg-white/5 rounded-xl p-4 backdrop-blur-md mb-4 border border-white/10 transform translate-x-4">
                                        <div className="flex justify-between text-sm text-white/80 mb-2">
                                            <span>Vibe Check</span>
                                            <span className="text-primary-400">98% 🔥</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 w-[98%]" />
                                        </div>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-xl p-4 backdrop-blur-md border border-white/10 transform -translate-x-4">
                                        <div className="flex justify-between text-sm text-white/80 mb-2">
                                            <span>Players Active</span>
                                            <span className="text-secondary-400">12 / 12</span>
                                        </div>
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#1a0a2e] bg-gray-600`} />
                                            ))}
                                            <div className="w-8 h-8 rounded-full border-2 border-[#1a0a2e] bg-[#0a0a1a] flex items-center justify-center text-[10px] text-white font-bold">+7</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </InViewAnimate>
                </div>
            </div>
        </section>
    )
}
