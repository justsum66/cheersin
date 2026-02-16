'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Siren, Zap } from 'lucide-react'
import { m } from 'framer-motion'
import { useTranslation } from '@/contexts/I18nContext'
import { toast } from 'react-hot-toast'

export function PartyEmergencyButton({ className = '' }: { className?: string }) {
    const router = useRouter()
    const { t } = useTranslation()
    const [isLoading, setIsLoading] = useState(false)

    const handleEmergency = async () => {
        setIsLoading(true)
        try {
            // Mock logic: randomly pick a game ID from a list
            // In real app, fetch from API or config
            const gameIds = ['kings-cup', 'never-have-i-ever', 'truth-or-dare', 'most-likely-to']
            const randomId = gameIds[Math.floor(Math.random() * gameIds.length)]

            // Simulate "Finding best game..."
            await new Promise(resolve => setTimeout(resolve, 800))

            router.push(`/games/${randomId}`)
        } catch (error) {
            toast.error('Emergency Failed!')
            setIsLoading(false)
        }
    }

    return (
        <m.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEmergency}
            disabled={isLoading}
            className={`relative group overflow-hidden rounded-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 shadow-[0_0_20px_rgba(220,38,38,0.5)] border-2 border-red-400/50 flex items-center gap-3 transition-all ${className}`}
        >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine opacity-0 group-hover:opacity-100" />

            <Siren className={`w-6 h-6 ${isLoading ? 'animate-spin' : 'animate-pulse'}`} />
            <span className="uppercase tracking-widest text-sm md:text-base">
                {isLoading ? t('common.loading') : t('hero.emergency')}
            </span>
            <Zap className="w-5 h-5 text-yellow-300" />
        </m.button>
    )
}
