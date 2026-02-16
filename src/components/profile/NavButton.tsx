import { ChevronRight, type LucideIcon } from 'lucide-react'

interface NavButtonProps {
    icon: LucideIcon
    label: string
    active?: boolean
    variant?: 'default' | 'danger'
    showArrow?: boolean
}

export function NavButton({ icon: Icon, label, active = false, variant = 'default', showArrow = false }: NavButtonProps) {
    return (
        <button
            className={`w-full flex items-center gap-3 px-4 min-h-[48px] rounded-xl text-sm font-medium transition-all games-focus-ring ${active
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : variant === 'danger'
                        ? 'text-red-400 hover:bg-red-500/10'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
        >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            {(active || showArrow) && <ChevronRight className="w-4 h-4 shrink-0" />}
        </button>
    )
}
