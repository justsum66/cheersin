import { m } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'

interface TraitBarProps {
    label: string
    value: number
    color: string
    icon: LucideIcon
}

export function TraitBar({ label, value, color, icon: Icon }: TraitBarProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-white/80">
                    <Icon className="w-4 h-4 text-white/40" />
                    {label}
                </div>
                <span className="font-mono text-white/40">{value}%</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <m.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    )
}
