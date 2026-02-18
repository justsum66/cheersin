import { HTMLAttributes, ElementType, forwardRef, memo } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'base' | 'layer-1' | 'layer-2' | 'layer-3' | 'spotlight'
    hoverEffect?: boolean
    gradient?: 'none' | 'subtle' | 'glow'
    as?: ElementType
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
}

/**
 * GlassCard Primitive
 *
 * Implements the "Deep Glass" design system with multi-layered transparency and blurs.
 * Task #53: 使用 memo + forwardRef 優化列表渲染性能
 *
 * @param variant - Controls transparency level (base=clearest, layer-3=most opaque)
 * @param hoverEffect - Adds lift and glow on hover
 * @param gradient - Adds subtle background gradient
 */
const GlassCardInner = forwardRef<HTMLDivElement, GlassCardProps>(({
    variant = 'base',
    hoverEffect = false,
    gradient = 'none',
    className,
    children,
    as: Component = 'div',
    ...props
}, ref) => {
    const variants = {
        base: 'bg-[rgba(var(--glass-1))] border-[rgba(var(--glass-border-1))] backdrop-blur-md',
        'layer-1': 'bg-[rgba(var(--glass-1))] border-[rgba(var(--glass-border-1))] backdrop-blur-xl shadow-glass-1',
        'layer-2': 'bg-[rgba(var(--glass-2))] border-[rgba(var(--glass-border-1))] backdrop-blur-2xl shadow-glass-2',
        'layer-3': 'bg-[rgba(var(--glass-3))] border-[rgba(var(--glass-border-2))] backdrop-blur-3xl shadow-glass-2',
        spotlight: 'bg-glass-card-spotlight border-white/10 backdrop-blur-xl', // Uses CSS class for complex gradient
    }

    const gradients = {
        none: '',
        subtle: 'bg-gradient-to-br from-white/[0.03] to-transparent',
        glow: 'bg-gradient-to-br from-primary-500/[0.08] via-transparent to-secondary-500/[0.08]', // Enhanced glow effect
    }

    const hoverStyles = hoverEffect
        ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-hover hover:bg-[rgba(var(--glass-shine))] hover:border-[rgba(var(--glass-border-2))] hover:scale-[1.02]' // Added subtle scale for better feedback
        : ''

    return (
        <Component
            ref={ref}
            className={cn(
                'relative rounded-2xl border overflow-hidden',
                variants[variant],
                gradients[gradient],
                hoverStyles,
                className
            )}
            {...props}
        >
            {/* Optional: Add inner shine or noise texture here if needed globally */}
            <div className="relative z-10 h-full">{children}</div>
        </Component>
    )
})

GlassCardInner.displayName = 'GlassCard'

export const GlassCard = memo(GlassCardInner)
