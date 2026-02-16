import { m } from 'framer-motion'
import { TrendingUp, type LucideIcon } from 'lucide-react'

interface StatCardProps {
    icon: LucideIcon
    label: string
    value: string | number
    trend: string
    color: 'primary' | 'secondary' | 'accent'
    delay: number
    valueSize?: 'lg' | 'sm'
}

export function StatCard({ icon: Icon, label, value, trend, color, delay, valueSize = 'lg' }: StatCardProps) {
    const colors = {
        primary: 'text-primary-500',
        secondary: 'text-secondary-500',
        accent: 'text-accent-500',
    }

    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass-card p-6"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-white/5">
                    <Icon className={`w-6 h-6 ${colors[color]}`} />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span>+2.4%</span>
                </div>
            </div>
            <div className="mb-1">
                <span className="text-white/40 text-sm font-medium uppercase tracking-wider">{label}</span>
            </div>
            <div className={`${valueSize === 'lg' ? 'text-3xl' : 'text-xl'} font-display font-bold text-white mb-2`}>
                {value}
            </div>
            <div className="text-xs text-white/30 truncate">{trend}</div>
        </m.div>
    )
}
