'use client'

import { useGameSound, type SoundKind } from '@/hooks/useGameSound'
import { m } from 'framer-motion'
import { Volume2, VolumeX, Music, Drum, Bell, PartyPopper, CheckCircle, XCircle, AlertCircle, Clock, type LucideIcon } from 'lucide-react'

const EFFECTS: { kind: SoundKind; label: string; icon: LucideIcon; color: string }[] = [
    { kind: 'click', label: 'Click', icon: Volume2, color: 'bg-blue-500' },
    { kind: 'correct', label: 'Correct', icon: CheckCircle, color: 'bg-green-500' },
    { kind: 'wrong', label: 'Wrong', icon: XCircle, color: 'bg-red-500' },
    { kind: 'win', label: 'Win', icon: PartyPopper, color: 'bg-yellow-500' },
    { kind: 'countdown', label: 'Timer', icon: Clock, color: 'bg-purple-500' },
    { kind: 'drum', label: 'Drum', icon: Drum, color: 'bg-orange-500' },
    { kind: 'airhorn', label: 'Air Horn', icon: AlertCircle, color: 'bg-pink-500' },
    { kind: 'pop', label: 'Pop', icon: Bell, color: 'bg-cyan-500' },
]

export function SoundboardTool() {
    const { play, enabled, toggle, volume, setVolume, startBGM, stopBGM, bgmEnabled, toggleBGM } = useGameSound()

    return (
        <div className="max-w-2xl mx-auto p-4">

            {/* Controls */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggle}
                        className={`p-3 rounded-full transition-colors ${enabled ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/40'}`}
                    >
                        {enabled ? <Volume2 /> : <VolumeX />}
                    </button>
                    <div className="flex flex-col">
                        <span className="text-white font-bold">Sound Effects</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-32 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500 mt-2"
                        />
                    </div>
                </div>

                <div className="w-px h-12 bg-white/10 hidden md:block" />

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleBGM}
                        className={`p-3 rounded-full transition-colors ${bgmEnabled ? 'bg-secondary-500 text-white' : 'bg-white/10 text-white/40'}`}
                    >
                        <Music />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-white font-bold">BGM</span>
                        <span className="text-xs text-white/40">{bgmEnabled ? 'Playing' : 'Paused'}</span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {EFFECTS.map((effect) => (
                    <m.button
                        key={effect.kind}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => play(effect.kind)}
                        className={`
                            relative aspect-square rounded-3xl border border-white/10 overflow-hidden group
                            flex flex-col items-center justify-center gap-3
                            bg-white/5 hover:bg-white/10 transition-colors
                        `}
                    >
                        <div className={`p-4 rounded-2xl ${effect.color}/20 text-white group-hover:scale-110 transition-transform`}>
                            <effect.icon className={`w-8 h-8 ${effect.color.replace('bg-', 'text-')}`} />
                        </div>
                        <span className="text-white/80 font-medium">{effect.label}</span>

                        {/* Ripple Effect (Simple) */}
                        <div className={`absolute inset-0 ${effect.color} opacity-0 group-active:opacity-10 transition-opacity`} />
                    </m.button>
                ))}
            </div>
        </div>
    )
}
