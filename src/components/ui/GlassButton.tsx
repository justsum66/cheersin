import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    isLoading?: boolean
    leftIcon?: ReactNode
    rightIcon?: ReactNode
    neonBorder?: boolean
}

/**
 * GlassButton Primitive
 *
 * A premium button component implementing the "Deep Glass" design system.
 * Features inner glow, neon borders, and haptic-like visual feedback.
 */
export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, neonBorder = false, children, ...props }, ref) => {
        /** A11Y: Respect reduced motion preference for loading spinner */
        const reducedMotion = usePrefersReducedMotion()

        const variants = {
            primary: 'btn-primary text-white shadow-hero-glow hover:shadow-glass-hover', // Uses globals.css .btn-primary + extra glow
            secondary: 'btn-secondary text-white bg-glass-1 border-glass-border-1 hover:bg-glass-2',
            ghost: 'btn-ghost text-white/80 hover:text-white hover:bg-glass-1',
            danger: 'btn-danger bg-red-500/10 border-red-500/20 text-red-100 hover:bg-red-500/20 hover:border-red-500/40',
        }

        const sizes = {
            sm: 'h-9 px-3 text-sm',
            md: 'h-12 px-6 text-base',
            lg: 'h-14 px-8 text-lg',
            icon: 'h-10 w-10 p-2',
        }

        // Neon border effect for active/emphasis states
        const neonClass = neonBorder
            ? 'border border-primary-400/50 shadow-[0_0_10px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]'
            : ''

        return (
            <button
                ref={ref}
                disabled={isLoading || props.disabled}
                className={cn(
                    'inline-flex items-center justify-center rounded-xl transition-all duration-300 font-medium active:scale-95 disabled:opacity-70 disabled:pointer-events-none',
                    variants[variant],
                    sizes[size],
                    neonClass,
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className={cn("mr-2 h-4 w-4", !reducedMotion && "animate-spin")} aria-hidden />}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </button>
        )
    }
)

GlassButton.displayName = 'GlassButton'
