'use client';

import * as React from 'react';
import { m, useReducedMotion, LazyMotion, domAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface OptimizedBadgeProps {
  /** Badge content */
  children?: React.ReactNode;
  /** Badge variant */
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'custom';
  /** Badge size */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
  /** Title/tooltip text */
  title?: string;
  /** Whether to show shimmer effect */
  shimmer?: boolean;
  /** Whether to show pulse animation */
  pulse?: boolean;
  /** Custom color classes for custom variant */
  customColors?: {
    bg?: string;
    text?: string;
    border?: string;
  };
  /** Badge shape */
  shape?: 'rounded' | 'pill' | 'square';
  /** Whether badge is interactive */
  interactive?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Whether to use CSS animations instead of framer-motion */
  preferCSS?: boolean;
  /** Custom animation duration */
  animationDuration?: number;
  /** Whether badge should be dismissible */
  dismissible?: boolean;
  /** Dismiss handler */
  onDismiss?: () => void;
  /** Icon to show */
  icon?: React.ReactNode;
  /** Whether to show count/badge */
  count?: number | string;
  /** Maximum count to show */
  maxCount?: number;
}

const variantClasses = {
  default: 'bg-white/10 text-white/90 border-white/20',
  primary: 'bg-primary-500/20 text-primary-300 border-primary-500/40',
  secondary: 'bg-secondary-500/20 text-secondary-300 border-secondary-500/40',
  accent: 'bg-accent-500/20 text-accent-300 border-accent-500/40',
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  error: 'bg-red-500/20 text-red-300 border-red-500/40',
  info: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  custom: ''
};

const sizeClasses = {
  xs: 'text-[8px] px-1.5 py-0.5',
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5'
};

const shapeClasses = {
  rounded: 'rounded',
  pill: 'rounded-full',
  square: 'rounded-none'
};

/** 
 * Task 24: Optimized Badge Component
 * Performance improvements:
 * 1. Better memoization with custom comparison
 * 2. Reduced overhead through optimized rendering
 * 3. CSS-based animations option for better performance
 * 4. Proper event handling and cleanup
 * 5. Better accessibility support
 * 6. Memory efficient implementation
 * 7. Reduced motion support
 * 8. Optimized class name generation
 */
export const OptimizedBadge = React.memo(
  React.forwardRef<HTMLSpanElement, OptimizedBadgeProps>(
    ({
      children,
      variant = 'default',
      size = 'md',
      className = '',
      title,
      shimmer = false,
      pulse = false,
      customColors,
      shape = 'pill',
      interactive = false,
      onClick,
      preferCSS = false,
      animationDuration = 0.2,
      dismissible = false,
      onDismiss,
      icon,
      count,
      maxCount = 99
    }, ref) => {
      const reducedMotion = useReducedMotion();
      const isMounted = React.useRef(true);
      
      // Get variant classes
      const getVariantClass = React.useCallback(() => {
        if (variant === 'custom' && customColors) {
          return cn(
            customColors.bg || 'bg-white/10',
            customColors.text || 'text-white/90',
            customColors.border || 'border-white/20'
          );
        }
        return variantClasses[variant];
      }, [variant, customColors]);

      // Format count
      const formattedCount = React.useMemo(() => {
        if (count === undefined) return null;
        if (typeof count === 'number' && maxCount && count > maxCount) {
          return `${maxCount}+`;
        }
        return count;
      }, [count, maxCount]);

      // Get CSS classes
      const badgeClasses = React.useMemo(() => 
        cn(
          'inline-flex items-center font-medium border relative overflow-hidden',
          getVariantClass(),
          sizeClasses[size],
          shapeClasses[shape],
          interactive && 'cursor-pointer hover:bg-opacity-20 transition-all duration-200',
          className
        ),
        [getVariantClass, size, shape, interactive, className]
      );

      // Handle dismiss
      const handleDismiss = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDismiss?.();
      }, [onDismiss]);

      // Cleanup on unmount
      React.useEffect(() => {
        return () => {
          isMounted.current = false;
        };
      }, []);

      // Early return for count-only badge
      if (formattedCount !== null && !children && !icon) {
        return (
          <span 
            ref={ref}
            className={badgeClasses}
            title={title}
            role="status"
            aria-label={`${formattedCount} items`}
          >
            {formattedCount}
          </span>
        );
      }

      // CSS animation approach
      if (preferCSS || reducedMotion) {
        return (
          <span
            ref={ref}
            className={cn(
              badgeClasses,
              pulse && !reducedMotion && 'animate-pulse',
              interactive && 'hover:scale-105 active:scale-95'
            )}
            onClick={onClick}
            title={title}
            role={interactive ? 'button' : 'status'}
            aria-label={typeof children === 'string' ? children : title}
            style={{
              transition: reducedMotion ? 'none' : `all ${animationDuration}s ease-in-out`
            }}
          >
            {shimmer && (
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            )}
            
            <span className="flex items-center gap-1 min-w-0">
              {icon && <span className="flex-shrink-0">{icon}</span>}
              {children && <span className="truncate">{children}</span>}
              {formattedCount !== null && (
                <span className="ml-1 bg-white/20 rounded-full px-1.5 py-0.5 text-[8px] font-bold min-w-[16px] text-center">
                  {formattedCount}
                </span>
              )}
            </span>
            
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="ml-1 p-0.5 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
                aria-label="Dismiss badge"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60 hover:opacity-100">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </span>
        );
      }

      // Framer Motion approach
      return (
        <LazyMotion features={domAnimation}>
          <m.span
            ref={ref as any}
            className={badgeClasses}
            onClick={onClick}
            title={title}
            role={interactive ? 'button' : 'status'}
            aria-label={typeof children === 'string' ? children : title}
            whileHover={interactive && !reducedMotion ? { scale: 1.05 } : undefined}
            whileTap={interactive && !reducedMotion ? { scale: 0.95 } : undefined}
            animate={pulse && !reducedMotion ? {
              scale: [1, 1.05, 1],
            } : undefined}
            transition={pulse && !reducedMotion ? {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            } : {
              duration: animationDuration,
              ease: "easeInOut"
            }}
          >
            {shimmer && (
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            )}
            
            <span className="flex items-center gap-1 min-w-0">
              {icon && <span className="flex-shrink-0">{icon}</span>}
              {children && <span className="truncate">{children}</span>}
              {formattedCount !== null && (
                <span className="ml-1 bg-white/20 rounded-full px-1.5 py-0.5 text-[8px] font-bold min-w-[16px] text-center">
                  {formattedCount}
                </span>
              )}
            </span>
            
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="ml-1 p-0.5 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
                aria-label="Dismiss badge"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60 hover:opacity-100">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </m.span>
        </LazyMotion>
      );
    }
  ),
  // Custom memo comparison
  (prevProps, nextProps) => {
    // Compare all props except functions
    const propKeys = Object.keys({ ...prevProps, ...nextProps }) as (keyof OptimizedBadgeProps)[];
    
    for (const key of propKeys) {
      if (typeof prevProps[key] === 'function' || typeof nextProps[key] === 'function') {
        continue;
      }
      
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }
    
    return true;
  }
);

OptimizedBadge.displayName = 'OptimizedBadge';

// Predefined variants
export const BadgeVariants = {
  Default: (props: Partial<OptimizedBadgeProps> & { children?: React.ReactNode }) => (
    <OptimizedBadge variant="default" {...props} />
  ),
  
  Primary: (props: Partial<OptimizedBadgeProps> & { children?: React.ReactNode }) => (
    <OptimizedBadge variant="primary" {...props} />
  ),
  
  Success: (props: Partial<OptimizedBadgeProps> & { children?: React.ReactNode }) => (
    <OptimizedBadge variant="success" {...props} />
  ),
  
  Warning: (props: Partial<OptimizedBadgeProps> & { children?: React.ReactNode }) => (
    <OptimizedBadge variant="warning" {...props} />
  ),
  
  Error: (props: Partial<OptimizedBadgeProps> & { children?: React.ReactNode }) => (
    <OptimizedBadge variant="error" {...props} />
  ),
  
  Interactive: (props: Partial<OptimizedBadgeProps> & { children?: React.ReactNode }) => (
    <OptimizedBadge 
      variant="primary" 
      interactive 
      {...props} 
    />
  ),
  
  WithCount: (props: Partial<OptimizedBadgeProps> & { count: number | string; children?: React.ReactNode }) => (
    <OptimizedBadge {...props} />
  )
};

export default OptimizedBadge;