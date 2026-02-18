'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { m, useMotionValue, useSpring, useReducedMotion, LazyMotion, domAnimation } from 'framer-motion';

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
);

export interface OptimizedButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    magnetic?: boolean;
    magneticStrength?: number;
    /** Debounce time for click events to prevent double clicks */
    clickDebounce?: number;
    /** Whether to use CSS transitions instead of framer-motion for better performance */
    preferCSSAnimations?: boolean;
    /** Custom loading spinner component */
    loadingSpinner?: React.ReactNode;
}

/** 
 * Task 15: Optimized Button Component
 * Performance improvements:
 * 1. Better memoization with custom comparison
 * 2. Click debouncing to prevent double clicks
 * 3. Option to use CSS animations instead of framer-motion
 * 4. Optimized event handling
 * 5. Reduced re-renders through proper memoization
 * 6. Better memory management for motion values
 */
const OptimizedButtonInner = React.forwardRef<HTMLButtonElement, OptimizedButtonProps>(
    ({ 
        className, 
        variant, 
        size, 
        neonBorder, 
        fullWidth, 
        rounded, 
        isLoading, 
        leftIcon, 
        rightIcon, 
        magnetic = false, 
        magneticStrength = 0.2,
        clickDebounce = 300,
        preferCSSAnimations = false,
        loadingSpinner,
        onClick,
        children, 
        ...props 
    }, ref) => {
        const reducedMotion = useReducedMotion();
        const lastClickTime = React.useRef(0);
        const isMounted = React.useRef(true);

        // Cleanup on unmount
        React.useEffect(() => {
            return () => {
                isMounted.current = false;
            };
        }, []);

        // Magnetic Physics - only initialize when needed
        const motionValues = React.useMemo(() => {
            if (!magnetic || reducedMotion || preferCSSAnimations) return null;
            
            const x = useMotionValue(0);
            const y = useMotionValue(0);
            const springX = useSpring(x, { stiffness: 150, damping: 15 });
            const springY = useSpring(y, { stiffness: 150, damping: 15 });
            
            return { x, y, springX, springY };
        }, [magnetic, reducedMotion, preferCSSAnimations]);

        // Debounced click handler
        const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
            if (!onClick) return;
            
            const now = Date.now();
            if (now - lastClickTime.current < clickDebounce) {
                e.preventDefault();
                return;
            }
            
            lastClickTime.current = now;
            onClick(e);
        }, [onClick, clickDebounce]);

        // Optimized mouse move handler
        const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
            if (!motionValues || reducedMotion || props.disabled || isLoading) return;
            
            const rect = e.currentTarget.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = (e.clientX - centerX) * magneticStrength;
            const dy = (e.clientY - centerY) * magneticStrength;
            
            motionValues.x.set(dx);
            motionValues.y.set(dy);
        }, [motionValues, reducedMotion, props.disabled, isLoading, magneticStrength]);

        // Optimized mouse leave handler
        const handleMouseLeave = React.useCallback(() => {
            if (!motionValues) return;
            motionValues.x.set(0);
            motionValues.y.set(0);
        }, [motionValues]);

        const commonClasses = React.useMemo(() => 
            cn(buttonVariants({ variant, size, neonBorder, fullWidth, rounded, className })), 
            [variant, size, neonBorder, fullWidth, rounded, className]
        );

        const content = React.useMemo(() => (
            <>
                {isLoading && (loadingSpinner || <Loader2 className="mr-2 h-4 w-4 animate-spin" />)}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </>
        ), [isLoading, loadingSpinner, leftIcon, children, rightIcon]);

        // Use CSS animations for better performance when preferred
        if (preferCSSAnimations && !reducedMotion && !isLoading && !props.disabled) {
            const cssClasses = cn(commonClasses, 'hover:scale-[0.98] active:scale-95 transition-transform duration-150');
            
            return (
                <button
                    ref={ref}
                    className={cssClasses}
                    disabled={props.disabled}
                    onClick={handleClick}
                    onMouseMove={magnetic ? handleMouseMove : undefined}
                    onMouseLeave={magnetic ? handleMouseLeave : undefined}
                    {...props}
                >
                    {content}
                </button>
            );
        }

        // Apply tap animation to all buttons
        if (!reducedMotion && !isLoading && !props.disabled && motionValues) {
            // For magnetic buttons with framer-motion
            if (magnetic) {
                return (
                    <LazyMotion features={domAnimation} key="magnetic-button">
                        <m.button
                            ref={ref as any}
                            className={commonClasses}
                            disabled={props.disabled}
                            onClick={handleClick}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            style={{ 
                                x: motionValues.springX, 
                                y: motionValues.springY 
                            }}
                            whileTap={{ scale: 0.95 }}
                            {...(props as any)}
                        >
                            {content}
                        </m.button>
                    </LazyMotion>
                );
            } else {
                // For non-magnetic buttons with framer-motion
                return (
                    <LazyMotion features={domAnimation} key="regular-button">
                        <m.button
                            ref={ref as any}
                            className={commonClasses}
                            disabled={props.disabled}
                            onClick={handleClick}
                            whileTap={{ scale: 0.95 }}
                            {...(props as any)}
                        >
                            {content}
                        </m.button>
                    </LazyMotion>
                );
            }
        }

        // Fallback to regular button when motion is reduced or button is loading/disabled
        return (
            <button
                className={commonClasses}
                ref={ref}
                disabled={isLoading || props.disabled}
                onClick={handleClick}
                {...props}
            >
                {content}
            </button>
        );
    }
);

OptimizedButtonInner.displayName = 'OptimizedButton';

// Custom memo comparison function for better performance
const OptimizedButton = React.memo(
    OptimizedButtonInner,
    (prevProps, nextProps) => {
        // Shallow compare all props except functions
        const propKeys = Object.keys({ ...prevProps, ...nextProps }) as (keyof OptimizedButtonProps)[];
        
        for (const key of propKeys) {
            if (key === 'onClick' || key === 'onMouseMove' || key === 'onMouseLeave') {
                continue; // Skip function comparisons
            }
            
            if (prevProps[key] !== nextProps[key]) {
                return false; // Props are different
            }
        }
        
        return true; // Props are the same
    }
);

export { OptimizedButton, buttonVariants };