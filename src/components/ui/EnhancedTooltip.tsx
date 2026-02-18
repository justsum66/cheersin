import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  trigger?: 'hover' | 'click' | 'focus' | 'manual';
  delay?: number;
  duration?: number;
  disabled?: boolean;
  className?: string;
  tooltipClassName?: string;
  arrow?: boolean;
  arrowClassName?: string;
  offset?: number;
  maxWidth?: number;
  interactive?: boolean;
  hideOnClick?: boolean;
  hideOnEsc?: boolean;
  showOnTouch?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  animationType?: 'fade' | 'scale' | 'slide' | 'bounce';
  'aria-label'?: string;
}

interface TooltipRef {
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

const VARIANT_STYLES = {
  default: 'bg-[#1a1a2e] border border-white/10 text-white',
  primary: 'bg-primary-500 text-white',
  success: 'bg-green-500 text-white',
  warning: 'bg-amber-500 text-white',
  error: 'bg-red-500 text-white',
  dark: 'bg-gray-900 text-white',
  light: 'bg-white text-gray-900 border border-gray-200'
};

const SIZE_STYLES = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base'
};

const ANIMATION_VARIANTS = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },
  slide: {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 5 }
  },
  bounce: {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    exit: { opacity: 0, scale: 0.5 }
  }
};

/**
 * Enhanced Tooltip Component
 * Features:
 * - Multiple positioning options
 * - Various trigger methods
 * - Custom animations
 * - Accessibility support
 * - Interactive tooltips
 * - Responsive positioning
 * - Arrow support
 * - Touch device support
 */
export const EnhancedTooltip = forwardRef<TooltipRef, TooltipProps>(({
  children,
  content,
  position = 'top',
  trigger = 'hover',
  delay = 0,
  duration = 0,
  disabled = false,
  className = '',
  tooltipClassName = '',
  arrow = true,
  arrowClassName = '',
  offset = 8,
  maxWidth = 200,
  interactive = false,
  hideOnClick = true,
  hideOnEsc = true,
  showOnTouch = true,
  variant = 'default',
  size = 'md',
  animationType = 'fade',
  'aria-label': ariaLabel
}, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const [tooltipStyles, setTooltipStyles] = useState<React.CSSProperties>({});
  const [arrowStyles, setArrowStyles] = useState<React.CSSProperties>({});
  
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reducedMotion = useReducedMotion();

  // Imperative handle for parent components
  useImperativeHandle(ref, () => ({
    show: () => handleShow(),
    hide: () => handleHide(),
    toggle: () => isVisible ? handleHide() : handleShow()
  }));

  // Calculate tooltip position
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let calculatedPosition = position;
    let top = 0;
    let left = 0;
    
    // Auto positioning logic
    if (position === 'auto') {
      // Prefer top, but check if tooltip fits
      if (triggerRect.top > tooltipRect.height + offset) {
        calculatedPosition = 'top';
      } else if (viewportHeight - triggerRect.bottom > tooltipRect.height + offset) {
        calculatedPosition = 'bottom';
      } else if (triggerRect.left > tooltipRect.width + offset) {
        calculatedPosition = 'left';
      } else if (viewportWidth - triggerRect.right > tooltipRect.width + offset) {
        calculatedPosition = 'right';
      } else {
        calculatedPosition = 'top'; // fallback
      }
    }
    
    // Calculate position based on chosen side
    switch (calculatedPosition) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - offset;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + offset;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - offset;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + offset;
        break;
    }
    
    // Adjust for viewport boundaries
    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltipRect.height > viewportHeight - 8) {
      top = viewportHeight - tooltipRect.height - 8;
    }
    
    setActualPosition(calculatedPosition as any);
    setTooltipStyles({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      maxWidth: `${maxWidth}px`
    });
    
    // Calculate arrow position
    if (arrow) {
      let arrowTop = '100%';
      let arrowLeft = '50%';
      let arrowTransform = 'translateX(-50%)';
      let arrowBorder = '';
      
      switch (calculatedPosition) {
        case 'top':
          arrowTop = '100%';
          arrowBorder = 'border-top-color: currentColor';
          break;
        case 'bottom':
          arrowTop = 'auto';
          arrowBorder = 'border-bottom-color: currentColor';
          break;
        case 'left':
          arrowLeft = '100%';
          arrowTop = '50%';
          arrowTransform = 'translateY(-50%)';
          arrowBorder = 'border-left-color: currentColor';
          break;
        case 'right':
          arrowLeft = 'auto';
          arrowTop = '50%';
          arrowTransform = 'translateY(-50%) rotate(180deg)';
          arrowBorder = 'border-right-color: currentColor';
          break;
      }
      
      setArrowStyles({
        position: 'absolute',
        top: arrowTop,
        left: arrowLeft,
        transform: arrowTransform,
        border: '4px solid transparent',
        ...arrowBorder ? { borderStyle: 'solid' } : {}
      });
    }
  }, [position, offset, maxWidth, arrow]);

  // Handle show/hide with delay
  const handleShow = useCallback(() => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    } else {
      setIsVisible(true);
    }
  }, [disabled, delay]);

  const handleHide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, duration);
    } else {
      setIsVisible(false);
    }
  }, [duration]);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    if (trigger === 'hover') handleShow();
  }, [trigger, handleShow]);

  const handleMouseLeave = useCallback(() => {
    if (trigger === 'hover') handleHide();
  }, [trigger, handleHide]);

  const handleClick = useCallback(() => {
    if (trigger === 'click') {
      if (isVisible) {
        handleHide();
      } else {
        handleShow();
      }
    } else if (trigger === 'hover' && hideOnClick) {
      handleHide();
    }
  }, [trigger, isVisible, handleShow, handleHide, hideOnClick]);

  const handleFocus = useCallback(() => {
    if (trigger === 'focus') handleShow();
  }, [trigger, handleShow]);

  const handleBlur = useCallback(() => {
    if (trigger === 'focus') handleHide();
  }, [trigger, handleHide]);

  const handleTouch = useCallback(() => {
    if (showOnTouch && trigger === 'hover') {
      if (isVisible) {
        handleHide();
      } else {
        handleShow();
      }
    }
  }, [showOnTouch, trigger, isVisible, handleShow, handleHide]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && hideOnEsc && isVisible) {
        handleHide();
      }
    };
    
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, hideOnEsc, handleHide]);

  // Recalculate position when tooltip becomes visible
  useEffect(() => {
    if (isVisible) {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        calculatePosition();
      });
      
      // Recalculate on window resize
      const handleResize = () => requestAnimationFrame(calculatePosition);
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize);
      };
    }
  }, [isVisible, calculatePosition]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (disabled) {
    return <>{children}</>;
  }

  const animationVariants = ANIMATION_VARIANTS[animationType];
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <>
      <div
        ref={triggerRef as React.RefObject<HTMLDivElement>}
        className={`inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onTouchStart={handleTouch}
        aria-label={ariaLabel}
        role="tooltip"
        tabIndex={trigger === 'focus' ? 0 : undefined}
      >
        {children}
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            className={`
              z-50 rounded-lg shadow-xl whitespace-normal break-words
              ${variantStyle} ${sizeStyle} ${tooltipClassName}
              ${interactive ? 'pointer-events-auto' : 'pointer-events-none'}
            `}
            style={tooltipStyles}
            variants={reducedMotion ? undefined : animationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: reducedMotion ? 0 : undefined
            }}
          >
            {content}
            
            {arrow && (
              <div
                ref={arrowRef}
                className={`w-0 h-0 border-4 border-transparent ${arrowClassName}`}
                style={arrowStyles}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

EnhancedTooltip.displayName = 'EnhancedTooltip';

// Pre-built tooltip variants
interface BaseTooltipProps {
  text: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  trigger?: 'hover' | 'click' | 'focus' | 'manual';
  delay?: number;
  duration?: number;
  disabled?: boolean;
  className?: string;
  tooltipClassName?: string;
  arrow?: boolean;
  arrowClassName?: string;
  offset?: number;
  maxWidth?: number;
  interactive?: boolean;
  hideOnClick?: boolean;
  hideOnEsc?: boolean;
  showOnTouch?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animationType?: 'fade' | 'scale' | 'slide' | 'bounce';
  'aria-label'?: string;
}

export function InfoTooltip({ text, children, ...props }: BaseTooltipProps) {
  return (
    <EnhancedTooltip
      content={text}
      variant="default"
      size="sm"
      animationType="fade"
      {...props}
    >
      {children || (
        <span className="inline-flex items-center justify-center w-4 h-4 text-xs text-white/60 border border-white/30 rounded-full cursor-help">
          ?
        </span>
      )}
    </EnhancedTooltip>
  );
}

export function SuccessTooltip({ text, children, ...props }: BaseTooltipProps) {
  return (
    <EnhancedTooltip
      content={text}
      variant="success"
      size="sm"
      animationType="scale"
      {...props}
    >
      {children || (
        <span className="inline-flex items-center justify-center w-4 h-4 text-xs text-white bg-green-500 rounded-full">
          ✓
        </span>
      )}
    </EnhancedTooltip>
  );
}

export function ErrorTooltip({ text, children, ...props }: BaseTooltipProps) {
  return (
    <EnhancedTooltip
      content={text}
      variant="error"
      size="sm"
      animationType="bounce"
      {...props}
    >
      {children || (
        <span className="inline-flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full">
          !
        </span>
      )}
    </EnhancedTooltip>
  );
}

// Hook for tooltip state management
export function useTooltip() {
  const [isVisible, setIsVisible] = useState(false);
  
  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);
  const toggle = useCallback(() => setIsVisible(prev => !prev), []);
  
  return {
    isVisible,
    show,
    hide,
    toggle
  };
}