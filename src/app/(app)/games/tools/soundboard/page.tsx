'use client'

import { SoundboardTool } from '@/components/games/tools/SoundboardTool'
import { ArrowLeft, Music } from 'lucide-react'
import Link from 'next/link'
import { FeatureIcon } from '@/components/ui/FeatureIcon'

export default function SoundboardPage() {
    return (
        <div className="min-h-screen bg-[#0a0a1a] pb-24 pt-20 px-4">
            <div className="container mx-auto max-w-2xl">
                <header className="mb-8">
                    <Link href="/games/tools" className="text-white/40 hover:text-white flex items-center gap-2 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Tools
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="bg-secondary-500/20 p-3 rounded-2xl">
                            <FeatureIcon icon={Music} size="md" color="secondary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Party Soundboard</h1>
                            <p className="text-white/60">Hype up the room with sound effects!</p>
                        </div>
                    </div>
                </header>

                <SoundboardTool />
            </div>
        </div>
    )
}
