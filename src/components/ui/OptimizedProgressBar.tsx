'use client';

import * as React from 'react';
import { m, useReducedMotion, LazyMotion, domAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface OptimizedProgressBarProps {
  /** Current progress value */
  value: number;
  /** Maximum value */
  max?: number;
  /** Whether to show progress label */
  showLabel?: boolean;
  /** Custom label text */
  label?: string;
  /** Additional className */
  className?: string;
  /** Progress bar height */
  height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Progress bar variant */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gradient';
  /** Animation duration in seconds */
  animationDuration?: number;
  /** Animation easing function */
  easing?: [number, number, number, number];
  /** Whether to show percentage indicator */
  showPercentage?: boolean;
  /** Custom percentage formatter */
  percentageFormatter?: (value: number) => string;
  /** Whether to animate on mount */
  animateOnMount?: boolean;
  /** Minimum animation duration */
  minAnimationDuration?: number;
  /** Maximum animation duration */
  maxAnimationDuration?: number;
  /** Whether to use CSS animations instead of framer-motion */
  preferCSS?: boolean;
  /** Custom color classes */
  colorClasses?: {
    track?: string;
    progress?: string;
  };
  /** Whether to show animated stripes */
  striped?: boolean;
  /** Stripe animation speed */
  stripeSpeed?: number;
  /** Whether to show glow effect */
  glow?: boolean;
}

const heightClasses = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
  xl: 'h-6'
};

const variantClasses = {
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  gradient: 'bg-gradient-to-r from-primary-400 via-purple-500 to-pink-500'
};

/** 
 * Task 21: Optimized ProgressBar Component
 * Performance improvements:
 * 1. Smooth animations with configurable easing
 * 2. Optimized re-renders with proper memoization
 * 3. CSS-based animations option for better performance
 * 4. Dynamic animation duration based on progress change
 * 5. Better accessibility support
 * 6. Customizable styling and variants
 * 7. Memory efficient implementation
 */
export const OptimizedProgressBar = React.memo(
  React.forwardRef<HTMLDivElement, OptimizedProgressBarProps>(
    ({
      value,
      max = 100,
      showLabel = false,
      label,
      className = '',
      height = 'md',
      variant = 'primary',
      animationDuration = 0.6,
      easing = [0.34, 1.56, 0.64, 1],
      showPercentage = true,
      percentageFormatter = (val) => `${Math.round(val)}%`,
      animateOnMount = true,
      minAnimationDuration = 0.3,
      maxAnimationDuration = 1.5,
      preferCSS = false,
      colorClasses,
      striped = false,
      stripeSpeed = 1,
      glow = false
    }, ref) => {
      const reducedMotion = useReducedMotion();
      const isMounted = React.useRef(false);
      const previousValue = React.useRef(value);
      
      // State for mount animation
      const [shouldAnimate, setShouldAnimate] = React.useState(false);

      // Calculate percentage
      const percentage = React.useMemo(() => {
        const pct = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0));
        return isNaN(pct) ? 0 : pct;
      }, [value, max]);

      // Calculate dynamic animation duration based on value change
      const dynamicDuration = React.useMemo(() => {
        if (reducedMotion) return 0;
        
        const change = Math.abs(value - previousValue.current);
        const duration = Math.max(
          minAnimationDuration,
          Math.min(
            maxAnimationDuration,
            animationDuration * (change / 100)
          )
        );
        
        return duration;
      }, [value, animationDuration, minAnimationDuration, maxAnimationDuration, reducedMotion]);

      // Update previous value
      React.useEffect(() => {
        previousValue.current = value;
      }, [value]);

      // Handle mount animation
      React.useEffect(() => {
        if (animateOnMount) {
          // Small delay to ensure component is rendered
          const timer = setTimeout(() => {
            setShouldAnimate(true);
          }, 50);
          
          return () => clearTimeout(timer);
        } else {
          setShouldAnimate(true);
        }
      }, [animateOnMount]);

      // Get CSS classes
      const trackClass = React.useMemo(() => 
        cn(
          'w-full rounded-full bg-white/10 overflow-hidden',
          heightClasses[height],
          colorClasses?.track
        ),
        [height, colorClasses?.track]
      );

      const progressClass = React.useMemo(() => 
        cn(
          'rounded-full relative',
          heightClasses[height],
          colorClasses?.progress || variantClasses[variant],
          striped && 'animate-stripes',
          glow && 'shadow-lg'
        ),
        [height, colorClasses?.progress, variant, striped, glow]
      );

      // CSS animation approach
      if (preferCSS || reducedMotion) {
        return (
          <div 
            ref={ref}
            className={cn('min-w-0 max-w-full', className)}
            role="progressbar" 
            aria-valuenow={value} 
            aria-valuemin={0} 
            aria-valuemax={max} 
            aria-label={label}
          >
            {(showLabel || label || showPercentage) && (
              <div className="flex justify-between items-center gap-2 mb-1">
                {label && <span className="text-sm text-white/70 truncate">{label}</span>}
                {(showPercentage || showLabel) && (
                  <span className="text-sm tabular-nums text-white/80">
                    {percentageFormatter(percentage)}
                  </span>
                )}
              </div>
            )}
            
            <div className={trackClass}>
              <div
                className={progressClass}
                style={{
                  width: shouldAnimate ? `${percentage}%` : '0%',
                  transition: reducedMotion 
                    ? 'none' 
                    : `width ${dynamicDuration}s cubic-bezier(${easing.join(',')})`,
                  backgroundImage: striped 
                    ? `linear-gradient(
                        45deg,
                        rgba(255,255,255,0.15) 25%,
                        transparent 25%,
                        transparent 50%,
                        rgba(255,255,255,0.15) 50%,
                        rgba(255,255,255,0.15) 75%,
                        transparent 75%,
                        transparent
                      )` 
                    : undefined,
                  backgroundSize: striped ? '1rem 1rem' : undefined,
                  animation: striped && !reducedMotion 
                    ? `stripes ${stripeSpeed}s linear infinite` 
                    : undefined
                }}
              />
            </div>
          </div>
        );
      }

      // Framer Motion approach
      return (
        <LazyMotion features={domAnimation}>
          <div 
            ref={ref}
            className={cn('min-w-0 max-w-full', className)}
            role="progressbar" 
            aria-valuenow={value} 
            aria-valuemin={0} 
            aria-valuemax={max} 
            aria-label={label}
          >
            {(showLabel || label || showPercentage) && (
              <div className="flex justify-between items-center gap-2 mb-1">
                {label && <span className="text-sm text-white/70 truncate">{label}</span>}
                {(showPercentage || showLabel) && (
                  <span className="text-sm tabular-nums text-white/80">
                    {percentageFormatter(percentage)}
                  </span>
                )}
              </div>
            )}
            
            <div className={trackClass}>
              <m.div
                className={progressClass}
                initial={animateOnMount ? { width: 0 } : false}
                animate={{ width: shouldAnimate ? `${percentage}%` : '0%' }}
                transition={{
                  duration: dynamicDuration,
                  ease: easing
                }}
                style={{
                  backgroundImage: striped 
                    ? `linear-gradient(
                        45deg,
                        rgba(255,255,255,0.15) 25%,
                        transparent 25%,
                        transparent 50%,
                        rgba(255,255,255,0.15) 50%,
                        rgba(255,255,255,0.15) 75%,
                        transparent 75%,
                        transparent
                      )` 
                    : undefined,
                  backgroundSize: striped ? '1rem 1rem' : undefined
                }}
              />
            </div>
          </div>
        </LazyMotion>
      );
    }
  )
);

OptimizedProgressBar.displayName = 'OptimizedProgressBar';

// Predefined variants
export const ProgressBarVariants = {
  Primary: (props: Partial<OptimizedProgressBarProps> & { value: number }) => (
    <OptimizedProgressBar variant="primary" {...props} />
  ),
  
  Success: (props: Partial<OptimizedProgressBarProps> & { value: number }) => (
    <OptimizedProgressBar variant="success" {...props} />
  ),
  
  Warning: (props: Partial<OptimizedProgressBarProps> & { value: number }) => (
    <OptimizedProgressBar variant="warning" {...props} />
  ),
  
  Danger: (props: Partial<OptimizedProgressBarProps> & { value: number }) => (
    <OptimizedProgressBar variant="danger" {...props} />
  ),
  
  Gradient: (props: Partial<OptimizedProgressBarProps> & { value: number }) => (
    <OptimizedProgressBar variant="gradient" {...props} />
  ),
  
  Striped: (props: Partial<OptimizedProgressBarProps> & { value: number }) => (
    <OptimizedProgressBar 
      variant="primary" 
      striped 
      glow 
      {...props} 
    />
  )
};

// Animated stripes CSS keyframes
const stripeStyles = `
  @keyframes stripes {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 1rem 0;
    }
  }
`;

// Inject CSS if not already present
if (typeof document !== 'undefined' && !document.getElementById('progress-bar-styles')) {
  const style = document.createElement('style');
  style.id = 'progress-bar-styles';
  style.textContent = stripeStyles;
  document.head.appendChild(style);
}

export default OptimizedProgressBar;