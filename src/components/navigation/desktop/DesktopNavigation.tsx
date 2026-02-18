'use client'

import * as React from 'react'
import Link from 'next/link'
import { m } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/contexts/I18nContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { NAV_ITEMS } from '@/constants/nav'

interface DesktopNavigationProps {
  /** Custom className for navigation container */
  className?: string
}

/**
 * Task 1.1.1: Desktop Navigation Component
 * 懶載入的桌面導航組件，包含效能優化的導航項目渲染
 */
export function DesktopNavigation({ className = '' }: DesktopNavigationProps) {
  const pathname = usePathname()
  const { t } = useTranslation()
  const prefersReducedMotion = usePrefersReducedMotion()

  // Navigation item renderer with memoization
  const renderNavItem = React.useCallback((item: typeof NAV_ITEMS[0], index: number) => {
    const label = t(`nav.${item.navKey}`)
    const isActive = item.href === '/' 
      ? pathname === '/' 
      : pathname === item.href || pathname.startsWith(item.href + '/')
    
    const tooltipText = item.shortcutKey ? `${label} (Alt+${item.shortcutKey})` : label

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
        title={tooltipText}
        className="group games-focus-ring rounded-full"
        onClick={() => {
          // Analytics tracking
          try {
            fetch('/api/analytics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                name: 'nav_click', 
                value: 1, 
                navKey: item.navKey, 
                href: item.href 
              }),
            }).catch(() => {})
          } catch { /* noop */ }
        }}
      >
        <m.div
          className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[48px] flex items-center ${
            isActive ? 'text-primary-400 font-semibold' : 'text-white/60 hover:text-white'
          }`}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
        >
          {isActive && (
            <m.div
              layoutId={prefersReducedMotion ? undefined : 'nav-pill'}
              className="absolute inset-0 bg-white/10 rounded-full"
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{label}</span>
          {!isActive && (
            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-400/60 rounded-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
          )}
          {isActive && (
            <m.span
              layoutId={prefersReducedMotion ? undefined : 'nav-active-underline'}
              className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-400 rounded-full"
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </m.div>
      </Link>
    )
  }, [pathname, t, prefersReducedMotion])

  return (
    <div className={`hidden md:flex items-center nav-item-gap ${className}`} role="navigation" aria-label={t('nav.mainNavLinks')}>
      {NAV_ITEMS.map(renderNavItem)}
    </div>
  )
}