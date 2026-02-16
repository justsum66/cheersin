/**
 * Phase 3 Task 3.06: Responsive Design Optimizer
 * Advanced responsive behavior for consistent cross-device experience
 */

import { useState, useEffect, useCallback } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'large-desktop'
export type Orientation = 'portrait' | 'landscape'

export interface DeviceInfo {
  type: DeviceType
  orientation: Orientation
  width: number
  height: number
  isTouchDevice: boolean
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  pixelRatio: number
  safeAreaInsets: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface ResponsiveConfig {
  /** Breakpoints for different device types */
  breakpoints?: {
    mobile: number
    tablet: number
    desktop: number
    largeDesktop: number
  }
  /** Enable safe area handling */
  safeAreaEnabled?: boolean
  /** Enable orientation change detection */
  orientationEnabled?: boolean
  /** Throttle resize events (ms) */
  throttleDelay?: number
}

const DEFAULT_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
  largeDesktop: 1920
}

export function useResponsiveDesign(config: ResponsiveConfig = {}): DeviceInfo {
  const {
    breakpoints = DEFAULT_BREAKPOINTS,
    safeAreaEnabled = true,
    orientationEnabled = true,
    throttleDelay = 100
  } = config

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'desktop',
    orientation: 'landscape',
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    isTouchDevice: typeof window !== 'undefined' ? 'ontouchstart' in window : false,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 }
  })

  // Throttled resize handler
  const getDeviceInfo = useCallback((): DeviceInfo => {
    if (typeof window === 'undefined') {
      return deviceInfo
    }

    const width = window.innerWidth
    const height = window.innerHeight
    const isTouchDevice = 'ontouchstart' in window
    const pixelRatio = window.devicePixelRatio || 1
    
    // Determine device type
    let type: DeviceType = 'desktop'
    if (width <= breakpoints.mobile) {
      type = 'mobile'
    } else if (width <= breakpoints.tablet) {
      type = 'tablet'
    } else if (width <= breakpoints.desktop) {
      type = 'desktop'
    } else {
      type = 'large-desktop'
    }

    // Determine orientation
    const orientation: Orientation = width > height ? 'landscape' : 'portrait'

    // Determine device categories
    const isMobile = type === 'mobile'
    const isTablet = type === 'tablet'
    const isDesktop = type === 'desktop' || type === 'large-desktop'

    // Get safe area insets
    let safeAreaInsets = { top: 0, right: 0, bottom: 0, left: 0 }
    if (safeAreaEnabled && typeof window !== 'undefined' && typeof window.CSS !== 'undefined' && window.CSS.supports && window.CSS.supports('padding: env(safe-area-inset-top)')) {
      try {
        const testElement = document.createElement('div')
        testElement.style.padding = 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)'
        document.body.appendChild(testElement)
        
        const computedStyle = window.getComputedStyle(testElement)
        safeAreaInsets = {
          top: parseInt(computedStyle.paddingTop) || 0,
          right: parseInt(computedStyle.paddingRight) || 0,
          bottom: parseInt(computedStyle.paddingBottom) || 0,
          left: parseInt(computedStyle.paddingLeft) || 0
        }
        
        document.body.removeChild(testElement)
      } catch (e) {
        // Fallback to default values
        safeAreaInsets = { 
          top: orientation === 'landscape' ? 0 : 20,
          right: 0,
          bottom: orientation === 'landscape' ? 0 : 20,
          left: 0
        }
      }
    }

    return {
      type,
      orientation,
      width,
      height,
      isTouchDevice,
      isMobile,
      isTablet,
      isDesktop,
      pixelRatio,
      safeAreaInsets
    }
  }, [breakpoints, safeAreaEnabled, deviceInfo])

  // Throttled resize handler
  useEffect(() => {
    if (typeof window === 'undefined') return

    let timeoutId: NodeJS.Timeout | null = null
    
    const handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(() => {
        setDeviceInfo(getDeviceInfo())
      }, throttleDelay)
    }

    // Initial setup
    setDeviceInfo(getDeviceInfo())
    
    // Add event listeners
    window.addEventListener('resize', handleResize)
    if (orientationEnabled) {
      window.addEventListener('orientationchange', handleResize)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      if (orientationEnabled) {
        window.removeEventListener('orientationchange', handleResize)
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [getDeviceInfo, throttleDelay, orientationEnabled])

  return deviceInfo
}

// Responsive utility hooks
export function useDeviceType(): DeviceType {
  const { type } = useResponsiveDesign()
  return type
}

export function useIsMobile(): boolean {
  const { isMobile } = useResponsiveDesign()
  return isMobile
}

export function useIsTablet(): boolean {
  const { isTablet } = useResponsiveDesign()
  return isTablet
}

export function useIsDesktop(): boolean {
  const { isDesktop } = useResponsiveDesign()
  return isDesktop
}

export function useOrientation(): Orientation {
  const { orientation } = useResponsiveDesign()
  return orientation
}

export function useSafeArea(): { top: number; right: number; bottom: number; left: number } {
  const { safeAreaInsets } = useResponsiveDesign({ safeAreaEnabled: true })
  return safeAreaInsets
}

// Responsive component helpers
export interface ResponsiveClassNames {
  mobile?: string
  tablet?: string
  desktop?: string
  'large-desktop'?: string
  portrait?: string
  landscape?: string
  touch?: string
  'no-touch'?: string
}

export function useResponsiveClasses(classNames: ResponsiveClassNames = {}): string {
  const deviceInfo = useResponsiveDesign()
  const classes: string[] = []

  // Device type classes
  if (classNames[deviceInfo.type]) {
    classes.push(classNames[deviceInfo.type]!)
  }

  // Orientation classes
  if (classNames[deviceInfo.orientation]) {
    classes.push(classNames[deviceInfo.orientation]!)
  }

  // Touch capability classes
  if (deviceInfo.isTouchDevice && classNames.touch) {
    classes.push(classNames.touch)
  }
  if (!deviceInfo.isTouchDevice && classNames['no-touch']) {
    classes.push(classNames['no-touch']!)
  }

  return classes.join(' ')
}

// Responsive style utilities
export interface ResponsiveStyles {
  mobile?: React.CSSProperties
  tablet?: React.CSSProperties
  desktop?: React.CSSProperties
  'large-desktop'?: React.CSSProperties
  portrait?: React.CSSProperties
  landscape?: React.CSSProperties
}

export function useResponsiveStyles(styles: ResponsiveStyles = {}): React.CSSProperties {
  const deviceInfo = useResponsiveDesign()
  const activeStyles: React.CSSProperties = {}

  // Apply base styles
  Object.assign(activeStyles, styles.desktop || {})

  // Override with device-specific styles
  if (deviceInfo.type === 'mobile' && styles.mobile) {
    Object.assign(activeStyles, styles.mobile)
  } else if (deviceInfo.type === 'tablet' && styles.tablet) {
    Object.assign(activeStyles, styles.tablet)
  } else if (deviceInfo.type === 'large-desktop' && styles['large-desktop']) {
    Object.assign(activeStyles, styles['large-desktop'])
  }

  // Apply orientation-specific styles
  if (deviceInfo.orientation === 'portrait' && styles.portrait) {
    Object.assign(activeStyles, styles.portrait)
  } else if (deviceInfo.orientation === 'landscape' && styles.landscape) {
    Object.assign(activeStyles, styles.landscape)
  }

  return activeStyles
}

// Responsive grid system
export interface GridConfig {
  columns: number
  gap?: number
  responsive?: boolean
}

export function useResponsiveGrid(config: GridConfig): {
  gridTemplateColumns: string
  gap: string
} {
  const { columns, gap = 16, responsive = true } = config
  const deviceInfo = useResponsiveDesign()

  let effectiveColumns = columns
  if (responsive) {
    if (deviceInfo.isMobile) {
      effectiveColumns = Math.min(columns, 2)
    } else if (deviceInfo.isTablet) {
      effectiveColumns = Math.min(columns, 3)
    }
  }

  return {
    gridTemplateColumns: `repeat(${effectiveColumns}, 1fr)`,
    gap: `${gap}px`
  }
}

// CSS custom properties for responsive design
export const responsiveCSSVariables = `
  :root {
    /* Device type detection */
    --device-mobile: 0;
    --device-tablet: 0;
    --device-desktop: 1;
    --device-large-desktop: 0;
    
    /* Orientation detection */
    --orientation-portrait: 0;
    --orientation-landscape: 1;
    
    /* Touch capability */
    --is-touch-device: 0;
    
    /* Safe area insets */
    --safe-area-top: 0px;
    --safe-area-right: 0px;
    --safe-area-bottom: 0px;
    --safe-area-left: 0px;
  }

  @media (max-width: 768px) {
    :root {
      --device-mobile: 1;
      --device-tablet: 0;
      --device-desktop: 0;
      --device-large-desktop: 0;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    :root {
      --device-mobile: 0;
      --device-tablet: 1;
      --device-desktop: 0;
      --device-large-desktop: 0;
    }
  }

  @media (min-width: 1025px) and (max-width: 1440px) {
    :root {
      --device-mobile: 0;
      --device-tablet: 0;
      --device-desktop: 1;
      --device-large-desktop: 0;
    }
  }

  @media (min-width: 1441px) {
    :root {
      --device-mobile: 0;
      --device-tablet: 0;
      --device-desktop: 0;
      --device-large-desktop: 1;
    }
  }

  @media (orientation: portrait) {
    :root {
      --orientation-portrait: 1;
      --orientation-landscape: 0;
    }
  }

  @media (hover: none) and (pointer: coarse) {
    :root {
      --is-touch-device: 1;
    }
  }

  /* Safe area support */
  @supports (padding: env(safe-area-inset-top)) {
    :root {
      --safe-area-top: env(safe-area-inset-top);
      --safe-area-right: env(safe-area-inset-right);
      --safe-area-bottom: env(safe-area-inset-bottom);
      --safe-area-left: env(safe-area-inset-left);
    }
  }
`

// Responsive utility component
export interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  mobileStyle?: React.CSSProperties
  tabletStyle?: React.CSSProperties
  desktopStyle?: React.CSSProperties
  responsiveClasses?: ResponsiveClassNames
}

export function ResponsiveContainer({
  children,
  className = '',
  style = {},
  mobileStyle = {},
  tabletStyle = {},
  desktopStyle = {},
  responsiveClasses = {}
}: ResponsiveContainerProps) {
  const deviceInfo = useResponsiveDesign()
  const responsiveClassesString = useResponsiveClasses(responsiveClasses)
  
  const combinedStyle = {
    ...style,
    ...(deviceInfo.isMobile ? mobileStyle : 
        deviceInfo.isTablet ? tabletStyle : 
        desktopStyle)
  }

  return (
    <div 
      className={`${className} ${responsiveClassesString}`.trim()}
      style={combinedStyle}
    >
      {children}
    </div>
  )
}