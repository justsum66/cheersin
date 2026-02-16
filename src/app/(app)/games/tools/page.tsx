'use client'

import Link from 'next/link'
import { Trophy, Music, ArrowLeft, PenTool, Mic2 } from 'lucide-react'
import { FeatureIcon } from '@/components/ui/FeatureIcon'
import { m } from 'framer-motion'
import { useSubscription } from '@/hooks/useSubscription'

export default function ToolsPage() {
    const { tier } = useSubscription()
    // const isPro = tier === 'premium'
    const isPro = true

    const tools = [
        {
            id: 'scoreboard',
            name: 'Scoreboard',
            description: 'Track points for any game manually.',
            icon: Trophy,
            href: '/games/tools/scoreboard',
            color: 'primary' as const
        },
        {
            id: 'soundboard',
            name: 'Soundboard',
            description: 'DJ your party with fun sound effects.',
            icon: Music,
            href: '/games/tools/soundboard',
            color: 'secondary' as const
        },
        // Future tools placeholders
        // { id: 'timer', name: 'Game Timer', description: 'Countdown timer with style.', icon: Clock, href: '#', color: 'accent' as const, disabled: true },
    ]

    return (
        <div className="min-h-screen bg-[#0a0a1a] pb-24 pt-20 px-4">
            <div className="container mx-auto max-w-4xl">
                <header className="mb-12">
                    <Link href="/games" className="text-white/40 hover:text-white flex items-center gap-2 mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Lobby
                    </Link>
                    <h1 className="text-4xl font-bold text-white mb-4">Host Tools</h1>
                    <p className="text-white/60 text-lg">Utilities to level up your hosting game.</p>
                </header>

                <div className="grid md:grid-cols-2 gap-6">
                    {tools.map((tool, index) => (
                        <Link
                            key={tool.id}
                            href={tool.href}
                            onClick={(e) => {
                                // if (tool.disabled) e.preventDefault() 
                            }}
                        >
                            <m.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                    bg-[#121226] border border-white/10 rounded-3xl p-8 h-full
                                    hover:bg-[#1a1a35] hover:border-white/20 transition-all group
                                    relative overflow-hidden
                                `}
                            >
                                <div className="flex items-start gap-6">
                                    <div className={`p-4 rounded-2xl bg-${tool.color}-500/10 text-${tool.color}-500 group-hover:bg-${tool.color}-500/20 transition-colors`}>
                                        <FeatureIcon icon={tool.icon} size="md" color={tool.color} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors">
                                            {tool.name}
                                        </h2>
                                        <p className="text-white/60 leading-relaxed">
                                            {tool.description}
                                        </p>
                                    </div>
                                </div>
                                <div className={`absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    <ArrowLeft className="w-6 h-6 rotate-180 text-white/20" />
                                </div>
                            </m.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
