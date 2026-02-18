'use client';

import * as React from 'react';
import { m, useReducedMotion, LazyMotion, domAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface OptimizedLoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'white' | 'custom';
  /** Custom color class */
  colorClass?: string;
  /** Additional className */
  className?: string;
  /** Whether to show label */
  showLabel?: boolean;
  /** Custom label text */
  label?: string;
  /** Animation speed (seconds) */
  speed?: number;
  /** Whether to use CSS animations instead of framer-motion */
  preferCSS?: boolean;
  /** Custom size in pixels */
  customSize?: number;
  /** Thickness of the spinner ring */
  thickness?: number;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const variantClasses = {
  primary: 'border-primary-500/30 border-t-primary-400',
  secondary: 'border-secondary-500/30 border-t-secondary-400',
  success: 'border-emerald-500/30 border-t-emerald-400',
  warning: 'border-amber-500/30 border-t-amber-400',
  danger: 'border-red-500/30 border-t-red-400',
  white: 'border-white/30 border-t-white',
  custom: ''
};

const thicknessClasses = {
  1: 'border',
  2: 'border-2',
  3: 'border-[3px]',
  4: 'border-4'
};

/** 
 * Task 18: Optimized LoadingSpinner Component
 * Performance improvements:
 * 1. CSS-based animations for better performance
 * 2. Reduced motion support
 * 3. Optimized rendering with proper memoization
 * 4. Customizable sizes and variants
 * 5. Better accessibility support
 * 6. Memory efficient implementation
 */
export const OptimizedLoadingSpinner = React.memo(
  React.forwardRef<HTMLDivElement, OptimizedLoadingSpinnerProps>(
    ({
      size = 'md',
      variant = 'primary',
      colorClass,
      className = '',
      showLabel = false,
      label = '載入中',
      speed = 1,
      preferCSS = true,
      customSize,
      thickness = 2
    }, ref) => {
      const reducedMotion = useReducedMotion();
      const isMounted = React.useRef(true);

      // Cleanup on unmount
      React.useEffect(() => {
        return () => {
          isMounted.current = false;
        };
      }, []);

      // Calculate size styles
      const sizeStyle = React.useMemo(() => {
        if (customSize) {
          return { width: `${customSize}px`, height: `${customSize}px` };
        }
        return {};
      }, [customSize]);

      // Get variant classes
      const spinnerClasses = React.useMemo(() => {
        const baseClasses = [
          'rounded-full',
          thicknessClasses[thickness as keyof typeof thicknessClasses],
          variant === 'custom' ? colorClass : variantClasses[variant],
          className
        ];
        
        if (!customSize) {
          baseClasses.push(sizeClasses[size]);
        }
        
        return cn(...baseClasses);
      }, [size, variant, colorClass, className, thickness, customSize]);

      // CSS animation approach (better performance)
      if (preferCSS || reducedMotion) {
        return (
          <div className="inline-flex items-center gap-2" ref={ref}>
            <div
              className={spinnerClasses}
              style={{
                ...sizeStyle,
                animation: reducedMotion 
                  ? 'none' 
                  : `spin ${speed}s linear infinite`,
                animationPlayState: reducedMotion ? 'paused' : 'running'
              }}
              role="status"
              aria-label={label}
              aria-hidden={!showLabel}
            />
            {showLabel && (
              <span className="text-sm text-white/70">
                {label}
              </span>
            )}
          </div>
        );
      }

      // Framer Motion approach
      return (
        <LazyMotion features={domAnimation}>
          <div className="inline-flex items-center gap-2" ref={ref as any}>
            <m.div
              className={spinnerClasses}
              style={sizeStyle}
              animate={{ rotate: 360 }}
              transition={{
                duration: speed,
                repeat: Infinity,
                ease: 'linear'
              }}
              role="status"
              aria-label={label}
              aria-hidden={!showLabel}
            />
            {showLabel && (
              <span className="text-sm text-white/70">
                {label}
              </span>
            )}
          </div>
        </LazyMotion>
      );
    }
  )
);

OptimizedLoadingSpinner.displayName = 'OptimizedLoadingSpinner';

// Predefined spinner variants
export const SpinnerVariants = {
  Primary: (props: Partial<OptimizedLoadingSpinnerProps>) => (
    <OptimizedLoadingSpinner variant="primary" {...props} />
  ),
  
  Secondary: (props: Partial<OptimizedLoadingSpinnerProps>) => (
    <OptimizedLoadingSpinner variant="secondary" {...props} />
  ),
  
  Success: (props: Partial<OptimizedLoadingSpinnerProps>) => (
    <OptimizedLoadingSpinner variant="success" {...props} />
  ),
  
  Warning: (props: Partial<OptimizedLoadingSpinnerProps>) => (
    <OptimizedLoadingSpinner variant="warning" {...props} />
  ),
  
  Danger: (props: Partial<OptimizedLoadingSpinnerProps>) => (
    <OptimizedLoadingSpinner variant="danger" {...props} />
  ),
  
  White: (props: Partial<OptimizedLoadingSpinnerProps>) => (
    <OptimizedLoadingSpinner variant="white" {...props} />
  )
};

// Overlay spinner for full-screen loading
export interface LoadingOverlayProps {
  message?: string;
  visible?: boolean;
  variant?: OptimizedLoadingSpinnerProps['variant'];
  size?: OptimizedLoadingSpinnerProps['size'];
}

export const LoadingOverlay = React.memo(
  React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
    ({ 
      message = '載入中...', 
      visible = true, 
      variant = 'primary',
      size = 'lg'
    }, ref) => {
      if (!visible) return null;

      return (
        <div 
          ref={ref}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-busy="true"
          aria-label={message}
        >
          <div className="glass-card p-6 flex flex-col items-center gap-4">
            <OptimizedLoadingSpinner 
              variant={variant} 
              size={size} 
              showLabel={false}
            />
            <p className="text-white text-sm font-medium">{message}</p>
          </div>
        </div>
      );
    }
  )
);

LoadingOverlay.displayName = 'LoadingOverlay';

// Text-based loading indicator
export interface LoadingTextProps {
  text?: string;
  dots?: number;
  speed?: number;
  className?: string;
}

export const LoadingText = React.memo(
  React.forwardRef<HTMLSpanElement, LoadingTextProps>(
    ({ 
      text = '載入中', 
      dots = 3, 
      speed = 0.5,
      className = ''
    }, ref) => {
      const [dotCount, setDotCount] = React.useState(0);
      const reducedMotion = useReducedMotion();

      React.useEffect(() => {
        if (reducedMotion) return;
        
        const interval = setInterval(() => {
          setDotCount(prev => (prev + 1) % (dots + 1));
        }, speed * 1000);

        return () => clearInterval(interval);
      }, [dots, speed, reducedMotion]);

      return (
        <span 
          ref={ref}
          className={cn('text-white/70 text-sm font-medium', className)}
          aria-label={`${text}${'.'.repeat(dotCount)}`}
        >
          {text}
          <span aria-hidden="true">
            {'.'.repeat(dotCount)}
            {'\u00A0'.repeat(dots - dotCount)}
          </span>
        </span>
      );
    }
  )
);

LoadingText.displayName = 'LoadingText';

// Export all components
export default OptimizedLoadingSpinner;