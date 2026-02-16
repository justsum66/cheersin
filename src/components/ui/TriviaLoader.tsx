'use client'

import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Martini, Music, Sparkles } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'

// Task 10: Themed Loading Experience - Hints
const LOADING_HINTS = [
    'Mixing drinks...',
    'Setting up the playlist...',
    'Inviting the squad...',
    'Chilling the champagne...',
    'Checking the vibe...',
    'Testing the microphone...'
]

export function TriviaLoader() {
    const { t } = useTranslation()
    const [hintIndex, setHintIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setHintIndex(prev => (prev + 1) % LOADING_HINTS.length)
        }, 2500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center min-h-[300px]">
            {/* Task 10: Bouncing Cocktail Animation */}
            <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                <m.div
                    animate={{
                        y: [-10, 10, -10],
                        rotate: [-5, 5, -5]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative z-10"
                >
                    <Martini className="w-16 h-16 text-primary-400 drop-shadow-[0_0_15px_rgba(255,46,99,0.6)]" />

                    {/* Bubbles */}
                    <m.div
                        className="absolute -top-4 -right-2 w-3 h-3 bg-secondary-400 rounded-full"
                        animate={{ y: [0, -20], opacity: [1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
                    />
                    <m.div
                        className="absolute -top-6 left-0 w-2 h-2 bg-primary-400 rounded-full"
                        animate={{ y: [0, -25], opacity: [1, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
                    />
                </m.div>

                {/* Glow Background */}
                <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full animate-pulse" />
            </div>

            <div className="w-full max-w-[240px] h-1.5 bg-white/10 rounded-full overflow-hidden mb-6">
                <m.div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            </div>

            <div className="h-8 flex items-center justify-center relative w-full">
                <AnimatePresence mode="wait">
                    <m.div
                        key={hintIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-x-0 top-0"
                    >
                        <p className="text-white/80 font-medium tracking-wide flex items-center justify-center gap-2">
                            <Music className="w-3.5 h-3.5 text-secondary-400" />
                            {LOADING_HINTS[hintIndex]}
                        </p>
                    </m.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
