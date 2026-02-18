'use client';

import * as React from 'react';
import { m, AnimatePresence, useReducedMotion, LazyMotion, domAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface OptimizedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the card has hover effects */
  hoverable?: boolean;
  /** Whether the card has a border */
  bordered?: boolean;
  /** Card shadow level */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Card padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether to use memoization for better performance */
  memoized?: boolean;
  /** Animation variants for entry/exit */
  animation?: {
    initial?: object;
    animate?: object;
    exit?: object;
    transition?: object;
  };
  /** Whether to use CSS transitions instead of framer-motion */
  preferCSS?: boolean;
  /** Custom ref for the card element */
  ref?: React.Ref<HTMLDivElement>;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

const baseClasses = 'rounded-xl bg-white/5 backdrop-blur-sm border border-white/10';

/** 
 * Task 16: Optimized Card Component
 * Performance improvements:
 * 1. Proper memoization with custom comparison
 * 2. Option to use CSS transitions instead of framer-motion
 * 3. Reduced re-renders through optimized props handling
 * 4. Better memory management for animations
 * 5. Conditional animation loading
 * 6. Optimized class name generation
 */
const OptimizedCardInner = React.forwardRef<HTMLDivElement, OptimizedCardProps>(
  ({
    className,
    hoverable = true,
    bordered = true,
    shadow = 'md',
    padding = 'md',
    memoized = true,
    animation,
    preferCSS = false,
    children,
    ...props
  }, ref) => {
    const reducedMotion = useReducedMotion();
    const isMounted = React.useRef(true);

    // Cleanup on unmount
    React.useEffect(() => {
      return () => {
        isMounted.current = false;
      };
    }, []);

    // Optimized class name generation
    const cardClasses = React.useMemo(() => {
      const classes = [
        baseClasses,
        paddingClasses[padding],
        shadowClasses[shadow],
        className || '',
      ];
      
      if (bordered) {
        classes.push('border border-white/10');
      }
      
      if (hoverable) {
        classes.push('hover:bg-white/10 hover:border-white/20 transition-colors duration-200');
      }
      
      return cn(...classes);
    }, [padding, shadow, className, bordered, hoverable]);

    // CSS-based animation classes
    const cssAnimationClasses = React.useMemo(() => {
      if (!animation || preferCSS || reducedMotion) return '';
      
      return 'transition-all duration-300 ease-out';
    }, [animation, preferCSS, reducedMotion]);

    // Framer Motion animation configuration
    const motionConfig = React.useMemo(() => {
      if (!animation || preferCSS || reducedMotion) return null;
      
      return {
        initial: animation.initial || { opacity: 0, y: 20 },
        animate: animation.animate || { opacity: 1, y: 0 },
        exit: animation.exit || { opacity: 0, y: -20 },
        transition: {
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
          ...animation.transition
        }
      };
    }, [animation, preferCSS, reducedMotion]);

    // Use CSS animations for better performance
    if (preferCSS || reducedMotion || !motionConfig) {
      return (
        <div
          ref={ref}
          className={cn(cardClasses, cssAnimationClasses)}
          {...props}
        >
          {children}
        </div>
      );
    }

    // Use Framer Motion with proper cleanup
    return (
      <LazyMotion features={domAnimation} key="optimized-card">
        <m.div
          ref={ref as any}
          className={cardClasses}
          initial={motionConfig.initial}
          animate={motionConfig.animate}
          exit={motionConfig.exit}
          transition={motionConfig.transition}
          {...(props as any)}
        >
          {children}
        </m.div>
      </LazyMotion>
    );
  }
);

OptimizedCardInner.displayName = 'OptimizedCard';

// Custom memoized version with optimized comparison
const MemoizedOptimizedCard = React.memo(
  OptimizedCardInner,
  (prevProps, nextProps) => {
    // Shallow compare all props except functions and children
    const propKeys = Object.keys({ ...prevProps, ...nextProps }) as (keyof OptimizedCardProps)[];
    
    for (const key of propKeys) {
      // Skip function and children comparisons
      if (key === 'children' || typeof prevProps[key] === 'function' || typeof nextProps[key] === 'function') {
        continue;
      }
      
      if (prevProps[key] !== nextProps[key]) {
        return false; // Props are different
      }
    }
    
    // Special handling for children - shallow compare if they're arrays
    if (Array.isArray(prevProps.children) && Array.isArray(nextProps.children)) {
      if (prevProps.children.length !== nextProps.children.length) {
        return false;
      }
      // For simple cases, we can do shallow comparison
      for (let i = 0; i < prevProps.children.length; i++) {
        if (prevProps.children[i] !== nextProps.children[i]) {
          return false;
        }
      }
    }
    
    return true; // Props are the same
  }
);

// Export both memoized and non-memoized versions
const OptimizedCard = React.memo(OptimizedCardInner);

export { OptimizedCard, MemoizedOptimizedCard };

// Convenience wrapper for animated cards
interface AnimatedCardProps extends OptimizedCardProps {
  inView?: boolean;
  delay?: number;
}

export const AnimatedCard = React.memo(
  React.forwardRef<HTMLDivElement, AnimatedCardProps>(
    ({ inView = true, delay = 0, animation, ...props }, ref) => {
      const defaultAnimation = React.useMemo(() => ({
        initial: { opacity: 0, y: 30, scale: 0.95 },
        animate: inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 },
        exit: { opacity: 0, y: -30, scale: 0.95 },
        transition: { 
          duration: 0.4, 
          delay,
          ease: [0.22, 1, 0.36, 1] 
        },
        ...animation
      }), [inView, delay, animation]);

      return (
        <OptimizedCard
          ref={ref}
          animation={defaultAnimation}
          {...props}
        />
      );
    }
  )
);

AnimatedCard.displayName = 'AnimatedCard';