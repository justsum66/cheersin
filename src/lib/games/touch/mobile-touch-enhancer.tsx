/**
 * Phase 3 Task 3.06: Mobile Touch Interaction Enhancer
 * Advanced touch handling for better mobile gaming experience
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { TouchEvent, MouseEvent } from 'react'

export interface TouchInteractionConfig {
  /** Minimum touch duration for long press (ms) */
  longPressDuration?: number
  /** Maximum time between taps for double tap (ms) */
  doubleTapTimeout?: number
  /** Minimum distance for swipe detection (px) */
  swipeThreshold?: number
  /** Minimum velocity for swipe detection (px/ms) */
  swipeVelocityThreshold?: number
  /** Enable haptic feedback */
  hapticEnabled?: boolean
  /** Enable visual feedback */
  visualFeedback?: boolean
}

export interface TouchEventHandlers {
  onTap?: (event: TouchEvent | MouseEvent) => void
  onDoubleTap?: (event: TouchEvent | MouseEvent) => void
  onLongPress?: (event: TouchEvent | MouseEvent) => void
  onSwipeLeft?: (event: TouchEvent | MouseEvent) => void
  onSwipeRight?: (event: TouchEvent | MouseEvent) => void
  onSwipeUp?: (event: TouchEvent | MouseEvent) => void
  onSwipeDown?: (event: TouchEvent | MouseEvent) => void
  onTouchStart?: (event: TouchEvent | MouseEvent) => void
  onTouchEnd?: (event: TouchEvent | MouseEvent) => void
  onTouchMove?: (event: TouchEvent | MouseEvent) => void
}

export interface TouchInteractionState {
  isPressed: boolean
  isLongPressed: boolean
  touchStartTime: number | null
  lastTapTime: number | null
  startX: number | null
  startY: number | null
  currentX: number | null
  currentY: number | null
}

export function useTouchInteraction(
  config: TouchInteractionConfig = {},
  handlers: TouchEventHandlers = {}
): TouchInteractionState {
  const {
    longPressDuration = 500,
    doubleTapTimeout = 300,
    swipeThreshold = 50,
    swipeVelocityThreshold = 0.5,
    hapticEnabled = true,
    visualFeedback = true
  } = config

  const [state, setState] = useState<TouchInteractionState>({
    isPressed: false,
    isLongPressed: false,
    touchStartTime: null,
    lastTapTime: null,
    startX: null,
    startY: null,
    currentX: null,
    currentY: null
  })

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const doubleTapTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Haptic feedback helper
  const triggerHaptic = useCallback((pattern: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!hapticEnabled || typeof navigator === 'undefined') return
    
    if ('vibrate' in navigator) {
      const durations = {
        light: [10],
        medium: [20],
        heavy: [30]
      }
      navigator.vibrate(durations[pattern])
    }
  }, [hapticEnabled])

  // Visual feedback helper
  const triggerVisualFeedback = useCallback((element: HTMLElement | null) => {
    if (!visualFeedback || !element) return
    
    element.classList.add('touch-feedback-active')
    setTimeout(() => {
      element.classList.remove('touch-feedback-active')
    }, 150)
  }, [visualFeedback])

  // Touch start handler
  const handleTouchStart = useCallback((event: TouchEvent | MouseEvent) => {
    const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY
    const element = event.currentTarget as HTMLElement

    setState(prev => ({
      ...prev,
      isPressed: true,
      isLongPressed: false,
      touchStartTime: Date.now(),
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY
    }))

    // Trigger haptic feedback
    triggerHaptic('light')
    triggerVisualFeedback(element)

    // Start long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
    
    longPressTimerRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isLongPressed: true }))
      handlers.onLongPress?.(event)
      triggerHaptic('heavy')
    }, longPressDuration)

    handlers.onTouchStart?.(event)
  }, [longPressDuration, handlers, triggerHaptic, triggerVisualFeedback])

  // Touch move handler
  const handleTouchMove = useCallback((event: TouchEvent | MouseEvent) => {
    const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY

    setState(prev => ({
      ...prev,
      currentX: clientX,
      currentY: clientY
    }))

    handlers.onTouchMove?.(event)
  }, [handlers])

  // Touch end handler
  const handleTouchEnd = useCallback((event: TouchEvent | MouseEvent) => {
    const element = event.currentTarget as HTMLElement
    const now = Date.now()
    
    setState(prev => {
      // Clear timers
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

      // Check for tap
      if (prev.isPressed && prev.touchStartTime) {
        const touchDuration = now - prev.touchStartTime
        
        // Check for double tap
        const isDoubleTap = prev.lastTapTime && 
          (now - prev.lastTapTime) < doubleTapTimeout && 
          touchDuration < 200

        if (isDoubleTap) {
          if (doubleTapTimerRef.current) {
            clearTimeout(doubleTapTimerRef.current)
            doubleTapTimerRef.current = null
          }
          handlers.onDoubleTap?.(event)
          triggerHaptic('medium')
          return {
            ...prev,
            isPressed: false,
            isLongPressed: false,
            lastTapTime: null
          }
        }

        // Check for single tap (only if not long press and quick tap)
        if (!prev.isLongPressed && touchDuration < 200) {
          // Set double tap timer
          if (doubleTapTimerRef.current) {
            clearTimeout(doubleTapTimerRef.current)
          }
          
          doubleTapTimerRef.current = setTimeout(() => {
            handlers.onTap?.(event)
            triggerHaptic('light')
          }, doubleTapTimeout)
        }

        // Check for swipe
        if (prev.startX !== null && prev.startY !== null && prev.currentX !== null && prev.currentY !== null) {
          const deltaX = prev.currentX - prev.startX
          const deltaY = prev.currentY - prev.startY
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
          const duration = now - prev.touchStartTime
          const velocity = distance / duration

          if (distance > swipeThreshold && velocity > swipeVelocityThreshold) {
            const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI
            
            if (angle > -45 && angle <= 45) {
              handlers.onSwipeRight?.(event)
            } else if (angle > 45 && angle <= 135) {
              handlers.onSwipeDown?.(event)
            } else if (angle > 135 || angle <= -135) {
              handlers.onSwipeLeft?.(event)
            } else {
              handlers.onSwipeUp?.(event)
            }
            
            triggerHaptic('medium')
          }
        }
      }

      return {
        ...prev,
        isPressed: false,
        isLongPressed: false,
        lastTapTime: now,
        startX: null,
        startY: null,
        currentX: null,
        currentY: null
      }
    })

    handlers.onTouchEnd?.(event)
  }, [doubleTapTimeout, swipeThreshold, swipeVelocityThreshold, handlers, triggerHaptic])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
      if (doubleTapTimerRef.current) {
        clearTimeout(doubleTapTimerRef.current)
      }
    }
  }, [])

  return state
}

// Enhanced touchable component
export interface TouchableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  config?: TouchInteractionConfig
  handlers?: TouchEventHandlers
  className?: string
  disabled?: boolean
}

export function Touchable({
  children,
  config = {},
  handlers = {},
  className = '',
  disabled = false,
  ...props
}: TouchableProps) {
  const touchState = useTouchInteraction(config, handlers)
  
  const touchHandlers = disabled ? {} : {
    onTouchStart: handlers.onTouchStart,
    onTouchMove: handlers.onTouchMove,
    onTouchEnd: handlers.onTouchEnd,
    onMouseDown: handlers.onTouchStart,
    onMouseMove: handlers.onTouchMove,
    onMouseUp: handlers.onTouchEnd,
    onMouseLeave: handlers.onTouchEnd
  }

  return (
    <div
      className={`touchable-wrapper ${className} ${touchState.isPressed ? 'is-pressed' : ''} ${touchState.isLongPressed ? 'is-long-pressed' : ''}`}
      {...touchHandlers}
      {...props}
    >
      {children}
    </div>
  )
}

// CSS for touch feedback
export const touchFeedbackStyles = `
  .touchable-wrapper {
    touch-action: manipulation;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    position: relative;
    cursor: pointer;
  }
  
  .touchable-wrapper.is-pressed {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  .touchable-wrapper.is-long-pressed {
    transform: scale(0.95);
    filter: brightness(0.9);
  }
  
  .touch-feedback-active {
    position: relative;
  }
  
  .touch-feedback-active::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: inherit;
    animation: touchRipple 0.3s ease-out;
    pointer-events: none;
  }
  
  @keyframes touchRipple {
    0% {
      opacity: 0.5;
      transform: scale(0.8);
    }
    100% {
      opacity: 0;
      transform: scale(1.2);
    }
  }
  
  /* Mobile-specific optimizations */
  @media (hover: none) and (pointer: coarse) {
    .touchable-wrapper {
      min-height: 44px;
      min-width: 44px;
    }
    
    .touchable-wrapper.is-pressed {
      transform: scale(0.96);
    }
    
    .touchable-wrapper.is-long-pressed {
      transform: scale(0.92);
    }
  }
`