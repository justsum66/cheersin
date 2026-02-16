'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { m, useMotionValue, useSpring, useReducedMotion, LazyMotion, domAnimation } from 'framer-motion'

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-xl transition-all duration-300 font-medium disabled:opacity-70 disabled:pointer-events-none active:scale-95 border ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    {
        variants: {
            variant: {
                primary: 'bg-primary-500 text-white shadow-hero-glow hover:shadow-glass-hover border-transparent hover:bg-primary-600',
                secondary: 'bg-glass-1 border-glass-border-1 text-white hover:bg-glass-2 shadow-sm',
                ghost: 'bg-transparent border-transparent text-white/80 hover:text-white hover:bg-glass-1 hover:border-white/10',
                danger: 'bg-red-500/10 border-red-500/20 text-red-100 hover:bg-red-500/20 hover:border-red-500/40',
                outline: 'border-white/20 bg-transparent text-white hover:bg-white/10',
            },
            size: {
                sm: 'h-9 px-3 text-sm',
                md: 'h-12 px-6 text-base',
                lg: 'h-14 px-8 text-lg',
                icon: 'h-10 w-10 p-2',
            },
            neonBorder: {
                true: 'border-primary-400/50 shadow-[0_0_10px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]',
            },
            fullWidth: {
                true: 'w-full',
            },
            rounded: {
                default: 'rounded-xl',
                full: 'rounded-full',
            }
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
            rounded: 'default',
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    magnetic?: boolean
    magneticStrength?: number
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, neonBorder, fullWidth, rounded, isLoading, leftIcon, rightIcon, magnetic = false, magneticStrength = 0.2, children, ...props }, ref) => {
        const reducedMotion = useReducedMotion()

        // Magnetic Physics
        const x = useMotionValue(0)
        const y = useMotionValue(0)
        const springX = useSpring(x, { stiffness: 150, damping: 15 })
        const springY = useSpring(y, { stiffness: 150, damping: 15 })

        const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (reducedMotion || props.disabled || isLoading) return
            const rect = e.currentTarget.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            const dx = (e.clientX - centerX) * magneticStrength
            const dy = (e.clientY - centerY) * magneticStrength
            x.set(dx)
            y.set(dy)
        }

        const handleMouseLeave = () => {
            x.set(0)
            y.set(0)
        }

        const commonClasses = cn(buttonVariants({ variant, size, neonBorder, fullWidth, rounded, className }))
        const content = (
            <>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </>
        )

        if (magnetic && !reducedMotion && !isLoading && !props.disabled) {
            return (
                <LazyMotion features={domAnimation}>
                    <m.button
                        ref={ref as any}
                        className={commonClasses}
                        disabled={props.disabled}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={{ x: springX, y: springY }}
                        whileTap={{ scale: 0.95 }}
                        {...(props as any)}
                    >
                        {content}
                    </m.button>
                </LazyMotion>
            )
        }

        return (
            <button
                className={commonClasses}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {content}
            </button>
        )
    }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
