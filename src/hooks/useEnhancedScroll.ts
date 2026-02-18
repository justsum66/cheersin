import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ScrollOptions {
  behavior?: 'auto' | 'smooth';
  block?: 'start' | 'center' | 'end' | 'nearest';
  inline?: 'start' | 'center' | 'end' | 'nearest';
}

interface ScrollPosition {
  x: number;
  y: number;
}

interface ScrollRestorationOptions {
  key?: string;
  restoreOnBack?: boolean;
  saveOnUnmount?: boolean;
  throttle?: number;
}

/**
 * Enhanced Scroll Management Hook
 * Features:
 * - Smooth scrolling with custom easing
 * - Scroll position restoration
 * - Scroll direction detection
 * - Scroll progress tracking
 * - Scroll event throttling
 * - Scroll locking
 */
export function useEnhancedScroll(options: ScrollRestorationOptions = {}) {
  const {
    key = 'default',
    restoreOnBack = true,
    saveOnUnmount = true,
    throttle = 100
  } = options;

  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({ x: 0, y: 0 });
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'left' | 'right' | 'none'>('none');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollPositionRef = useRef<ScrollPosition>({ x: 0, y: 0 });
  const scrollLockStyleRef = useRef<string | null>(null);

  // Get scrollable element
  const getScrollableElement = useCallback((element?: HTMLElement | string): HTMLElement => {
    if (typeof element === 'string') {
      return document.querySelector(element) || document.documentElement;
    }
    return element || document.documentElement;
  }, []);

  // Enhanced scroll to function
  const scrollTo = useCallback((
    target: HTMLElement | string | number | { top?: number; left?: number },
    options: ScrollOptions = {}
  ) => {
    const scrollableElement = getScrollableElement(typeof target === 'string' ? target : undefined);
    
    const defaultOptions: ScrollOptions = {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    };
    
    const scrollOptions = { ...defaultOptions, ...options };

    if (typeof target === 'number') {
      // Scroll to specific Y position
      scrollableElement.scrollTo({
        top: target,
        behavior: scrollOptions.behavior
      });
    } else if (typeof target === 'object' && 'top' in target) {
      // Scroll to coordinates
      scrollableElement.scrollTo({
        top: target.top,
        left: target.left,
        behavior: scrollOptions.behavior
      });
    } else if (typeof target === 'string' || target instanceof HTMLElement) {
      // Scroll to element
      const element = typeof target === 'string' 
        ? document.querySelector(target) as HTMLElement
        : target;
      
      if (element) {
        element.scrollIntoView({
          behavior: scrollOptions.behavior,
          block: scrollOptions.block,
          inline: scrollOptions.inline
        });
      }
    }
  }, [getScrollableElement]);

  // Scroll to top
  const scrollToTop = useCallback((options?: ScrollOptions) => {
    scrollTo(0, { ...options, behavior: options?.behavior || 'smooth' });
  }, [scrollTo]);

  // Scroll to bottom
  const scrollToBottom = useCallback((options?: ScrollOptions) => {
    const element = getScrollableElement();
    scrollTo(element.scrollHeight, { ...options, behavior: options?.behavior || 'smooth' });
  }, [scrollTo, getScrollableElement]);

  // Scroll lock management
  const lockScroll = useCallback(() => {
    if (isScrollLocked) return;
    
    const element = document.body;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    scrollLockStyleRef.current = element.style.cssText;
    
    element.style.overflow = 'hidden';
    element.style.paddingRight = `${scrollBarWidth}px`;
    
    setIsScrollLocked(true);
  }, [isScrollLocked]);

  const unlockScroll = useCallback(() => {
    if (!isScrollLocked) return;
    
    const element = document.body;
    
    if (scrollLockStyleRef.current !== null) {
      element.style.cssText = scrollLockStyleRef.current;
    } else {
      element.style.overflow = '';
      element.style.paddingRight = '';
    }
    
    scrollLockStyleRef.current = null;
    setIsScrollLocked(false);
  }, [isScrollLocked]);

  // Scroll restoration
  const saveScrollPosition = useCallback((storageKey: string = key) => {
    const position = {
      x: window.scrollX,
      y: window.scrollY
    };
    
    try {
      sessionStorage.setItem(`scroll-position-${storageKey}`, JSON.stringify(position));
    } catch (e) {
      // Handle storage errors
      console.warn('Failed to save scroll position:', e);
    }
  }, [key]);

  const restoreScrollPosition = useCallback((storageKey: string = key) => {
    try {
      const saved = sessionStorage.getItem(`scroll-position-${storageKey}`);
      if (saved) {
        const position = JSON.parse(saved) as ScrollPosition;
        window.scrollTo({
          left: position.x,
          top: position.y,
          behavior: 'auto'
        });
      }
    } catch (e) {
      // Handle parsing errors
      console.warn('Failed to restore scroll position:', e);
    }
  }, [key]);

  // Scroll progress calculation
  const calculateScrollProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    return documentHeight > 0 ? Math.min(100, (scrollTop / documentHeight) * 100) : 0;
  }, []);

  // Throttled scroll handler
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const currentX = window.scrollX;
      const currentY = window.scrollY;
      
      // Update scroll position
      setScrollPosition({ x: currentX, y: currentY });
      
      // Determine scroll direction
      const lastX = lastScrollPositionRef.current.x;
      const lastY = lastScrollPositionRef.current.y;
      
      let direction: 'up' | 'down' | 'left' | 'right' | 'none' = 'none';
      
      if (Math.abs(currentY - lastY) > Math.abs(currentX - lastX)) {
        direction = currentY > lastY ? 'down' : 'up';
      } else if (Math.abs(currentX - lastX) > 5) {
        direction = currentX > lastX ? 'right' : 'left';
      }
      
      setScrollDirection(direction);
      lastScrollPositionRef.current = { x: currentX, y: currentY };
      
      // Update scroll progress
      setScrollProgress(calculateScrollProgress());
      
      // Reset scrolling state after delay
      setIsScrolling(true);
      setTimeout(() => setIsScrolling(false), 150);
      
    }, throttle);
  }, [throttle, calculateScrollProgress]);

  // Setup scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Handle back/forward navigation
  useEffect(() => {
    if (!restoreOnBack) return;

    const handlePopState = () => {
      setTimeout(() => restoreScrollPosition(), 100);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [restoreOnBack, restoreScrollPosition]);

  // Save position on unmount
  useEffect(() => {
    return () => {
      if (saveOnUnmount) {
        saveScrollPosition();
      }
    };
  }, [saveOnUnmount, saveScrollPosition]);

  return {
    // Current state
    scrollPosition,
    scrollDirection,
    scrollProgress,
    isScrolling,
    isScrollLocked,
    
    // Actions
    scrollTo,
    scrollToTop,
    scrollToBottom,
    lockScroll,
    unlockScroll,
    saveScrollPosition,
    restoreScrollPosition,
    
    // Utilities
    getScrollableElement,
    calculateScrollProgress
  };
}

// Smooth scroll component
interface SmoothScrollProps {
  children: React.ReactNode;
  behavior?: 'auto' | 'smooth';
  duration?: number;
  easing?: string;
}

export function SmoothScroll({ 
  children, 
  behavior = 'smooth',
  duration = 500,
  easing = 'ease-in-out'
}: SmoothScrollProps) {
  useEffect(() => {
    // Apply smooth scroll styles to html element
    const style = document.createElement('style');
    const cssText = `
      html {
        scroll-behavior: ${behavior};
        ${behavior === 'smooth' ? `
          scroll-padding-top: env(safe-area-inset-top);
        ` : ''}
      }
    `;
    style.textContent = cssText;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [behavior]);

  return React.createElement(React.Fragment, null, children);
}

// Scroll indicator component
interface ScrollIndicatorProps {
  color?: string;
  height?: number;
  showPercentage?: boolean;
  className?: string;
}

export function ScrollIndicator({ 
  color = 'rgba(96, 165, 250, 0.8)',
  height = 4,
  showPercentage = false,
  className = ''
}: ScrollIndicatorProps) {
  const { scrollProgress } = useEnhancedScroll();
  
  return React.createElement(
    'div',
    { className: `fixed top-0 left-0 right-0 z-50 ${className}` },
    React.createElement('div', {
      className: 'h-full bg-white/20 transition-all duration-300',
      style: {
        width: `${scrollProgress}%`,
        height: `${height}px`,
        backgroundColor: color
      }
    }),
    showPercentage && React.createElement(
      'div',
      { className: 'absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-white/60' },
      `${Math.round(scrollProgress)}%`
    )
  );
}

// Scroll to top button
interface ScrollToTopButtonProps {
  threshold?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  offset?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ScrollToTopButton({ 
  threshold = 300,
  position = 'bottom-right',
  offset = 20,
  className = '',
  children
}: ScrollToTopButtonProps) {
  const { scrollPosition, scrollToTop } = useEnhancedScroll();
  const [isVisible, setIsVisible] = useState(false);
  
  const positionClasses = {
    'bottom-right': `bottom-${offset} right-${offset}`,
    'bottom-left': `bottom-${offset} left-${offset}`,
    'top-right': `top-${offset} right-${offset}`,
    'top-left': `top-${offset} left-${offset}`
  };
  
  useEffect(() => {
    setIsVisible(scrollPosition.y > threshold);
  }, [scrollPosition.y, threshold]);
  
  if (!isVisible) return null;
  
  return React.createElement(
    'button',
    {
      type: 'button',
      onClick: () => scrollToTop(),
      className: `
        fixed z-40 p-3 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg
        transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 
        focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[#0a0a1a]
        ${positionClasses[position]} ${className}
      `.trim(),
      'aria-label': '回到頂部'
    },
    children || React.createElement(
      'svg',
      {
        className: 'w-5 h-5',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M5 15l7-7 7 7'
      })
    )
  );
}