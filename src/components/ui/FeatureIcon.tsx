'use client'

import { memo } from 'react'
import { LucideIcon } from 'lucide-react'

// P001: Use CSS transitions instead of framer-motion for simple hover effects
// R2-233: 純展示組件用 React.memo 減少重繪
interface FeatureIconProps {
    icon: LucideIcon
    color?: 'primary' | 'secondary' | 'accent' | 'white'
    size?: 'sm' | 'md' | 'lg'
}

function FeatureIconInner({ icon: Icon, color = 'primary', size = 'md' }: FeatureIconProps) {
    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-14 h-14',
        lg: 'w-20 h-20'
    }

    const iconSizes = {
        sm: 'w-5 h-5',
        md: 'w-7 h-7',
        lg: 'w-10 h-10'
    }

    const gradients = {
        primary: 'from-primary-500/20 to-primary-600/20 text-primary-500',
        secondary: 'from-secondary-500/20 to-secondary-600/20 text-secondary-500',
        accent: 'from-accent-500/20 to-accent-600/20 text-accent-500',
        white: 'from-white/10 to-white/5 text-white'
    }

    return (
        <div className={`relative ${sizeClasses[size]} group`}>
            {/* Glow behind */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradients[color]} blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-[400ms]`} />

            {/* Main Container */}
            {/* Phase 1 A4.2: 增加 icon 旋轉與 pulse 動畫 */}
            <div className={`relative h-full w-full rounded-2xl bg-gradient-to-br ${gradients[color]} 
            border border-white/10 backdrop-blur-md flex items-center justify-center
            shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]
            group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ease-out`}>

                <Icon className={`${iconSizes[size]} drop-shadow-lg group-hover:scale-110 transition-transform duration-300`} />

                {/* Shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    )
}

export const FeatureIcon = memo(FeatureIconInner)
