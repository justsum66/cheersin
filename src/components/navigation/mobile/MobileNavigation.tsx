'use client'

import * as React from 'react'
import Link from 'next/link'
import { m, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/contexts/I18nContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { FixedSizeList } from 'react-window'
import { X, Menu } from 'lucide-react'
import { NAV_ITEMS, MOBILE_MENU_ID, MOBILE_MENU_DURATION_MS } from '@/constants/nav'

interface MobileNavigationProps {
  /** Whether mobile menu is open */
  isOpen: boolean
  /** Callback to toggle menu state */
  onToggle: () => void
  /** Ref for the mobile menu button */
  menuButtonRef: React.RefObject<HTMLButtonElement>
  /** Ref for the first link in mobile menu */
  firstLinkRef: React.RefObject<HTMLAnchorElement>
  /** Ref for the mobile menu container */
  menuRef: React.RefObject<HTMLDivElement>
}

/**
 * Task 1.1.2: Mobile Navigation Component
 * 懶載入的行動導航組件，包含虛擬化選單和效能優化
 */
export function MobileNavigation({
  isOpen,
  onToggle,
  menuButtonRef,
  firstLinkRef,
  menuRef
}: MobileNavigationProps) {
  const pathname = usePathname()
  const { t } = useTranslation()
  const prefersReducedMotion = usePrefersReducedMotion()

  // Mobile menu item renderer for virtualization
  const MobileMenuItem = React.useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = NAV_ITEMS[index]
    const isActive = item.href === '/' 
      ? pathname === '/' 
      : pathname === item.href || pathname.startsWith(item.href + '/')
    
    return (
      <div style={style} className="flex justify-center">
        <m.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { 
            duration: MOBILE_MENU_DURATION_MS / 1000, 
            ease: 'easeOut', 
            delay: 0.05 + index * 0.05 
          }}
        >
          <Link
            ref={index === 0 ? firstLinkRef : undefined}
            href={item.href}
            onClick={onToggle}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-4 text-2xl font-display font-bold games-focus-ring rounded-lg py-2 min-h-[48px] ${
              isActive ? 'text-primary-400' : 'text-white'
            }`}
          >
            <item.icon className={`w-8 h-8 ${isActive ? 'text-primary-400/80' : 'text-white/50'}`} />
            {t(`nav.${item.navKey}`)}
          </Link>
        </m.div>
      </div>
    )
  }, [pathname, t, prefersReducedMotion, MOBILE_MENU_DURATION_MS, firstLinkRef, onToggle])

  // Virtualized mobile menu for better performance with large item lists
  const VirtualizedMobileMenu = React.useMemo(() => (
    <FixedSizeList
      height={400}
      itemCount={NAV_ITEMS.length}
      itemSize={80}
      width="100%"
    >
      {MobileMenuItem}
    </FixedSizeList>
  ), [MobileMenuItem])

  return (
    <>
      {/* Mobile Menu Button */}
      <m.button
        ref={menuButtonRef}
        className="md:hidden games-touch-target w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 games-focus-ring"
        onClick={onToggle}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
        aria-label={isOpen ? '關閉選單' : '開啟導航選單'}
        aria-expanded={isOpen}
        aria-controls={MOBILE_MENU_ID}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <m.div
              key="close"
              initial={prefersReducedMotion ? undefined : { rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5 text-white" />
            </m.div>
          ) : (
            <m.div
              key="menu"
              initial={prefersReducedMotion ? undefined : { rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-5 h-5 text-white" />
            </m.div>
          )}
        </AnimatePresence>
      </m.button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            ref={menuRef}
            id={MOBILE_MENU_ID}
            className="fixed inset-0 md:hidden bg-[#1a0a2e]/90 backdrop-blur-xl"
            style={{ zIndex: 40 }}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: '-100%' }}
            transition={prefersReducedMotion ? { duration: 0 } : { 
              duration: MOBILE_MENU_DURATION_MS / 1000, 
              ease: [0.32, 0.72, 0, 1] 
            }}
            onClick={onToggle}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onToggle()
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.navigationMenu')}
          >
            <div className="flex flex-col items-center justify-center h-full gap-8" onClick={(e) => e.stopPropagation()}>
              {/* Smart rendering strategy: virtualized for large lists, regular for small */}
              {NAV_ITEMS.length > 5 ? (
                <div className="w-full max-w-md px-4">
                  {VirtualizedMobileMenu}
                </div>
              ) : (
                NAV_ITEMS.map((item, index) => {
                  const isActive = item.href === '/' 
                    ? pathname === '/' 
                    : pathname === item.href || pathname.startsWith(item.href + '/')
                  
                  return (
                    <m.div
                      key={item.href}
                      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={prefersReducedMotion ? { duration: 0 } : { 
                        duration: MOBILE_MENU_DURATION_MS / 1000, 
                        ease: 'easeOut', 
                        delay: 0.05 + index * 0.05 
                      }}
                    >
                      <Link
                        ref={index === 0 ? firstLinkRef : undefined}
                        href={item.href}
                        onClick={onToggle}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex items-center gap-4 text-2xl font-display font-bold games-focus-ring rounded-lg py-2 min-h-[48px] ${
                          isActive ? 'text-primary-400' : 'text-white'
                        }`}
                      >
                        <item.icon className={`w-8 h-8 ${isActive ? 'text-primary-400/80' : 'text-white/50'}`} />
                        {t(`nav.${item.navKey}`)}
                      </Link>
                    </m.div>
                  )
                })
              )}

              <div className="w-16 h-[1px] bg-white/10 my-4" aria-hidden />

              <m.div
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { 
                  duration: MOBILE_MENU_DURATION_MS / 1000, 
                  ease: 'easeOut', 
                  delay: 0.3 
                }}
              >
                <Link href="/pricing" onClick={onToggle}>
                  <button type="button" className="btn-primary min-h-[48px] games-focus-ring">
                    解鎖完整功能
                  </button>
                </Link>
              </m.div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}