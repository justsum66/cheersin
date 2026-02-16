'use client'

import { Lock, Crown, ArrowRight, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { m } from 'framer-motion'

interface FeatureLockProps {
    icon?: LucideIcon
    title: string
    description: string
    className?: string
}

export function FeatureLock({
    icon: Icon = Lock,
    title,
    description,
    className = ''
}: FeatureLockProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 md:p-12 bg-white/5 border border-white/10 rounded-3xl text-center relative overflow-hidden ${className}`}>
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />

            <m.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="relative z-10 flex flex-col items-center"
            >
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                    <Icon className="w-8 h-8 text-white/40" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center border border-white/10 shadow-lg">
                        <Lock className="w-3 h-3 text-white" />
                    </div>
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                    {title}
                </h3>

                <p className="text-white/60 max-w-md mb-8 leading-relaxed">
                    {description}
                </p>

                <Link
                    href="/pricing"
                    className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-primary-500/20 hover:scale-105 transition-transform"
                >
                    <Crown className="w-5 h-5" />
                    Upgrade to Unlock
                    <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </m.div>
        </div>
    )
}
