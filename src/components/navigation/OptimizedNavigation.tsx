'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { m, AnimatePresence, useReducedMotion, LazyMotion, domAnimation } from 'framer-motion';
import { FixedSizeList } from 'react-window';
import {
  Crown,
  Sun,
  Moon,
  Contrast,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/I18nContext';
import { useNavVisibility } from '@/contexts/NavVisibilityContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useThrottle } from '@/hooks/useThrottle';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { BrandLogo } from '@/components/BrandLogo';
import { NotificationPanel } from '@/components/navigation/NotificationPanel';
import { ThemeTransitionOverlay } from '@/components/theme/ThemeTransitionOverlay';
import { UserMenu } from '@/components/navigation/UserMenu';
import {
  NAV_ITEMS,
  SCROLL_COMPACT_PX,
  SCROLL_OPACITY_MAX_PX,
  Z_NAV_TOP,
  Z_NAV_BOTTOM,
  Z_MOBILE_MENU,
  MOBILE_MENU_ID,
  MOBILE_MENU_DURATION_MS,
  getTierLabel,
  CTA_UNLOCK_PRO,
} from '@/constants/nav';

export interface OptimizedNavigationProps {
  /** Whether to hide navigation for games */
  hideForGame?: boolean;
  /** Custom className for navigation container */
  className?: string;
  /** Whether to enable compact mode on scroll */
  enableScrollCompact?: boolean;
  /** Custom scroll threshold for compact mode */
  compactThreshold?: number;
  /** Whether to enable smooth scrolling behavior */
  smoothScroll?: boolean;
  /** Custom animation duration */
  animationDuration?: number;
  /** Whether to enable keyboard shortcuts */
  enableShortcuts?: boolean;
  /** Custom mobile menu breakpoint */
  mobileBreakpoint?: number;
}

interface NavigationState {
  scrollY: number;
  isMobileMenuOpen: boolean;
  notificationsOpen: boolean;
  themeTransition: { target: 'dark' | 'light'; x: number; y: number } | null;
  isKeyboardFocused: boolean;
}

const INITIAL_STATE: NavigationState = {
  scrollY: 0,
  isMobileMenuOpen: false,
  notificationsOpen: false,
  themeTransition: null,
  isKeyboardFocused: false,
};

/** 
 * Task 20: Optimized Navigation Component
 * Performance improvements:
 * 1. Better state management with useReducer
 * 2. Optimized scroll handling with throttling
 * 3. Memoized calculations and derived state
 * 4. Efficient event handling and cleanup
 * 5. Reduced re-renders through proper memoization
 * 6. Better focus management
 * 7. Memory leak prevention
 */
export const OptimizedNavigation = React.memo(
  React.forwardRef<HTMLDivElement, OptimizedNavigationProps>(
    ({
      hideForGame: propHideForGame = false,
      className = '',
      enableScrollCompact = true,
      compactThreshold = SCROLL_COMPACT_PX,
      smoothScroll = true,
      animationDuration = 0.5,
      enableShortcuts = true,
      mobileBreakpoint = 768
    }, ref) => {
      const pathname = usePathname();
      const router = useRouter();
      const { t } = useTranslation();
      const navVisibility = useNavVisibility();
      const { resolved, setTheme, theme, highContrast, setHighContrast, fontScale, setFontScale } = useTheme();
      const { tier } = useSubscription();
      const prefersReducedMotion = usePrefersReducedMotion();
      
      // Refs
      const menuButtonRef = React.useRef<HTMLButtonElement>(null);
      const mobileMenuFirstLinkRef = React.useRef<HTMLAnchorElement>(null);
      const mobileMenuRef = React.useRef<HTMLDivElement>(null);
      const bottomNavRef = React.useRef<HTMLElement>(null);
      const keyboardScrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
      const isMounted = React.useRef(true);

      // State management with useReducer for better performance
      const [state, dispatch] = React.useReducer(
        (prevState: NavigationState, action: any): NavigationState => {
          switch (action.type) {
            case 'SET_SCROLL_Y':
              return { ...prevState, scrollY: action.payload };
            case 'TOGGLE_MOBILE_MENU':
              return { ...prevState, isMobileMenuOpen: !prevState.isMobileMenuOpen };
            case 'SET_MOBILE_MENU_OPEN':
              return { ...prevState, isMobileMenuOpen: action.payload };
            case 'TOGGLE_NOTIFICATIONS':
              return { ...prevState, notificationsOpen: !prevState.notificationsOpen };
            case 'SET_NOTIFICATIONS_OPEN':
              return { ...prevState, notificationsOpen: action.payload };
            case 'SET_THEME_TRANSITION':
              return { ...prevState, themeTransition: action.payload };
            case 'CLEAR_THEME_TRANSITION':
              return { ...prevState, themeTransition: null };
            case 'SET_KEYBOARD_FOCUSED':
              return { ...prevState, isKeyboardFocused: action.payload };
            default:
              return prevState;
          }
        },
        INITIAL_STATE
      );

      // Memoized derived values
      const hideForGame = React.useMemo(() => 
        propHideForGame || (pathname === '/games' && navVisibility?.hideForGame),
        [propHideForGame, pathname, navVisibility?.hideForGame]
      );

      const navOpacity = React.useMemo(() => 
        Math.min(1, 0.4 + (state.scrollY / SCROLL_OPACITY_MAX_PX) * 0.6),
        [state.scrollY]
      );

      const navCompact = React.useMemo(() => 
        enableScrollCompact && state.scrollY > compactThreshold,
        [enableScrollCompact, state.scrollY, compactThreshold]
      );

      const navBg = React.useMemo(() => 
        navCompact ? `rgba(15, 5, 24, ${Math.max(0.6, navOpacity)})` : 'transparent',
        [navCompact, navOpacity]
      );

      const tierLabel = React.useMemo(() => getTierLabel(tier), [tier]);

      // Throttled scroll handler
      const setScroll = React.useCallback((y: number) => {
        dispatch({ type: 'SET_SCROLL_Y', payload: y });
      }, []);

      const setScrollYThrottled = useThrottle(setScroll, 50);

      const handleScroll = React.useCallback(() => {
        setScrollYThrottled(window.scrollY);
      }, [setScrollYThrottled]);

      // Keyboard event handler
      const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (state.notificationsOpen) {
            dispatch({ type: 'SET_NOTIFICATIONS_OPEN', payload: false });
          }
          if (state.isMobileMenuOpen) {
            dispatch({ type: 'SET_MOBILE_MENU_OPEN', payload: false });
          }
          return;
        }

        // Keyboard shortcuts for navigation
        if (enableShortcuts && e.altKey && !e.ctrlKey && !e.metaKey) {
          const key = e.key.toUpperCase();
          const target = NAV_ITEMS.find(item => item.shortcutKey === key);
          if (target) {
            e.preventDefault();
            router.push(target.href);
          }
        }
      }, [state.notificationsOpen, state.isMobileMenuOpen, enableShortcuts, router]);

      // Focus management
      const handleMobileMenuToggle = React.useCallback(() => {
        dispatch({ type: 'TOGGLE_MOBILE_MENU' });
      }, []);

      const handleNotificationsToggle = React.useCallback(() => {
        dispatch({ type: 'TOGGLE_NOTIFICATIONS' });
      }, []);

      const handleThemeTransition = React.useCallback((target: 'dark' | 'light', x: number, y: number) => {
        if (prefersReducedMotion) {
          setTheme(target);
          return;
        }
        dispatch({ type: 'SET_THEME_TRANSITION', payload: { target, x, y } });
      }, [prefersReducedMotion, setTheme]);

      // Cleanup effects
      React.useEffect(() => {
        return () => {
          isMounted.current = false;
          if (keyboardScrollTimeoutRef.current) {
            clearTimeout(keyboardScrollTimeoutRef.current);
          }
        };
      }, []);

      // Scroll event listener
      React.useEffect(() => {
        if (typeof window === 'undefined') return;
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
      }, [handleScroll]);

      // Keyboard event listener
      React.useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }, [handleKeyDown]);

      // Mobile menu focus management
      React.useEffect(() => {
        if (state.isMobileMenuOpen) {
          // Small delay to ensure menu is rendered
          setTimeout(() => {
            mobileMenuFirstLinkRef.current?.focus();
          }, 50);
        } else {
          menuButtonRef.current?.focus({ preventScroll: true });
        }
      }, [state.isMobileMenuOpen]);

      // Keyboard input focus handling for mobile
      React.useEffect(() => {
        const onFocusIn = (e: FocusEvent) => {
          const target = e.target as HTMLElement;
          if (!target?.matches?.('input, textarea, select, [contenteditable="true"]')) return;
          if (typeof window === 'undefined' || window.innerWidth >= mobileBreakpoint || !bottomNavRef.current) return;
          
          if (keyboardScrollTimeoutRef.current) {
            clearTimeout(keyboardScrollTimeoutRef.current);
          }
          
          keyboardScrollTimeoutRef.current = setTimeout(() => {
            if (isMounted.current) {
              bottomNavRef.current?.scrollIntoView({ 
                block: 'end', 
                behavior: smoothScroll ? 'smooth' : 'auto' 
              });
            }
            keyboardScrollTimeoutRef.current = null;
          }, 400);
        };

        document.addEventListener('focusin', onFocusIn);
        return () => {
          document.removeEventListener('focusin', onFocusIn);
          if (keyboardScrollTimeoutRef.current) {
            clearTimeout(keyboardScrollTimeoutRef.current);
          }
        };
      }, [mobileBreakpoint, smoothScroll]);

      // Focus trap for mobile menu
      useFocusTrap(state.isMobileMenuOpen, mobileMenuRef);

      // Early return if navigation should be hidden
      if (hideForGame) return null;

      // Animation configuration
      const navTransition = React.useMemo(() => 
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: animationDuration, ease: 'easeOut' as const },
        [prefersReducedMotion, animationDuration]
      );

      // Theme transition handler
      const handleThemeTransitionComplete = React.useCallback((target: 'dark' | 'light') => {
        setTheme(target);
        dispatch({ type: 'CLEAR_THEME_TRANSITION' });
      }, [setTheme]);

      // Mobile menu item renderer for virtualization
      const MobileMenuItem = React.useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
        const item = NAV_ITEMS[index];
        const isActive = item.href === '/' 
          ? pathname === '/' 
          : pathname === item.href || pathname.startsWith(item.href + '/');
        
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
                ref={index === 0 ? mobileMenuFirstLinkRef : undefined}
                href={item.href}
                onClick={() => dispatch({ type: 'SET_MOBILE_MENU_OPEN', payload: false })}
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
        );
      }, [pathname, t, prefersReducedMotion, MOBILE_MENU_DURATION_MS, mobileMenuFirstLinkRef, dispatch]);

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
      ), [MobileMenuItem]);

      return (
        <div ref={ref} className={className}>
          {/* Theme transition overlay */}
          {state.themeTransition && (
            <ThemeTransitionOverlay
              targetTheme={state.themeTransition.target}
              origin={{ x: state.themeTransition.x, y: state.themeTransition.y }}
              onComplete={handleThemeTransitionComplete}
            />
          )}

          {/* Top Navigation */}
          <LazyMotion features={domAnimation}>
            <m.nav
              className="fixed top-0 left-0 right-0 backdrop-blur-3xl backdrop-saturate-150 print:hidden safe-area-pt"
              style={{
                zIndex: Z_NAV_TOP,
                paddingTop: navCompact ? 6 : 10,
                paddingBottom: navCompact ? 6 : 10,
                backgroundColor: navBg,
                borderBottom: navCompact ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.05)',
                transition: 'background-color 0.25s ease-out, border-color 0.25s ease-out, padding 0.25s ease-out',
              }}
              initial={{ y: prefersReducedMotion ? 0 : -100 }}
              animate={{ y: 0 }}
              transition={navTransition}
              aria-label={t('nav.mainNav')}
            >
              <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                  {/* Brand Logo */}
                  <m.div
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  >
                    <BrandLogo variant="nav" href="/" />
                  </m.div>

                  {/* Display Settings */}
                  <div className="flex items-center gap-1" role="group" aria-label={t('nav.displaySettings')}>
                    <button
                      onClick={(e) => handleThemeTransition(
                        resolved === 'dark' ? 'light' : 'dark',
                        e.clientX,
                        e.clientY
                      )}
                      className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors games-touch-target flex items-center justify-center games-focus-ring"
                      title={resolved === 'dark' ? t('nav.switchLight') : t('nav.switchDark')}
                      aria-label={resolved === 'dark' ? t('nav.switchLightMode') : t('nav.switchDarkMode')}
                      aria-pressed={resolved === 'light'}
                    >
                      {resolved === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    
                    <button
                      onClick={() => setHighContrast(!highContrast)}
                      className={`p-2 rounded-xl transition-colors games-touch-target flex items-center justify-center games-focus-ring ${
                        highContrast ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                      title={highContrast ? t('nav.highContrastOff') : t('nav.highContrastOn')}
                      aria-label={highContrast ? t('nav.highContrastOffMode') : t('nav.highContrastOnMode')}
                      aria-pressed={highContrast}
                    >
                      <Contrast className="w-5 h-5" />
                    </button>
                    
                    <div className="hidden sm:flex items-center rounded-xl bg-white/5 border border-white/10 overflow-hidden" role="radiogroup" aria-label={t('nav.fontSize')}>
                      {(['sm', 'md', 'lg'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setFontScale(s)}
                          className={`px-2.5 py-1.5 text-xs font-medium transition-colors min-w-[2rem] min-h-[48px] flex items-center justify-center games-focus-ring ${
                            fontScale === s ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
                          }`}
                          title={s === 'sm' ? '小字' : s === 'md' ? '標準' : '大字'}
                          aria-label={s === 'sm' ? '字體較小' : s === 'md' ? '字體標準' : '字體較大'}
                          aria-pressed={fontScale === s}
                        >
                          {s === 'sm' ? '小' : s === 'md' ? '中' : '大'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Navigation */}
                  <div className="hidden md:flex items-center nav-item-gap" role="navigation" aria-label={t('nav.mainNavLinks')}>
                    {NAV_ITEMS.map((item, index) => {
                      const label = t(`nav.${item.navKey}`);
                      const isActive = item.href === '/' 
                        ? pathname === '/' 
                        : pathname === item.href || pathname.startsWith(item.href + '/');
                      
                      const tooltipText = item.shortcutKey ? `${label} (Alt+${item.shortcutKey})` : label;

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
                              }).catch(() => {});
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
                      );
                    })}
                  </div>

                  {/* Right Side Actions */}
                  <div className="hidden md:flex items-center gap-4">
                    <Link
                      href={tier === 'free' ? '/pricing' : '/subscription'}
                      aria-label={tier === 'free' ? '升級 Pro 方案' : '訂閱管理'}
                      aria-current={(pathname === '/pricing' || pathname === '/subscription') ? 'page' : undefined}
                      className={`games-focus-ring flex items-center gap-2 text-xs font-bold uppercase tracking-wider games-touch-target justify-center transition-all relative overflow-hidden ${
                        tier === 'free'
                          ? 'bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700] bg-[length:200%_auto] text-[#1a0a2e] px-4 py-2 rounded-full shadow-[0_0_12px_rgba(255,215,0,0.4)] hover:shadow-[0_0_20px_rgba(255,215,0,0.6)] hover:scale-105 active:scale-95'
                          : 'nav-cta-ux icon-interact icon-glow rounded-lg text-primary-400 hover:text-primary-300'
                      }`}
                    >
                      <m.span
                        className="flex items-center gap-1.5 relative z-10"
                        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                      >
                        <Crown className={`w-4 h-4 ${tier === 'free' ? 'fill-[#1a0a2e]' : ''}`} aria-hidden />
                        {tierLabel}
                      </m.span>
                    </Link>
                    
                    <div className="h-6 w-px flex-shrink-0 bg-white/10" role="separator" aria-hidden />
                    
                    <NotificationPanel
                      notificationsOpen={state.notificationsOpen}
                      setNotificationsOpen={handleNotificationsToggle}
                      prefersReducedMotion={!!prefersReducedMotion}
                      hasUnread={false}
                    />
                    
                    <UserMenu />
                  </div>

                  {/* Mobile Menu Button */}
                  <m.button
                    ref={menuButtonRef}
                    className="md:hidden games-touch-target w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 games-focus-ring"
                    onClick={handleMobileMenuToggle}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                    aria-label={state.isMobileMenuOpen ? '關閉選單' : '開啟導航選單'}
                    aria-expanded={state.isMobileMenuOpen}
                    aria-controls={MOBILE_MENU_ID}
                  >
                    <AnimatePresence mode="wait">
                      {state.isMobileMenuOpen ? (
                        <m.div
                          key="close"
                          initial={prefersReducedMotion ? undefined : { rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={prefersReducedMotion ? undefined : { rotate: 90, opacity: 0 }}
                        >
                          <X className="w-5 h-5 text-white" />
                        </m.div>
                      ) : (
                        <m.div
                          key="menu"
                          initial={prefersReducedMotion ? undefined : { rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={prefersReducedMotion ? undefined : { rotate: -90, opacity: 0 }}
                        >
                          <Menu className="w-5 h-5 text-white" />
                        </m.div>
                      )}
                    </AnimatePresence>
                  </m.button>
                </div>
              </div>
            </m.nav>
          </LazyMotion>

          {/* Bottom Navigation for Mobile */}
          <nav
            ref={bottomNavRef}
            className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#0a0a1a]/80 backdrop-blur-2xl safe-area-pb print:hidden"
            style={{ zIndex: Z_NAV_BOTTOM }}
            aria-label={t('nav.bottomNav')}
          >
            <div className="flex items-stretch justify-around">
              {NAV_ITEMS.map((item) => {
                const label = t(`nav.${item.navKey}`);
                const isActive = item.href === '/' 
                  ? pathname === '/' 
                  : pathname === item.href || pathname.startsWith(item.href + '/');
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center justify-center flex-1 games-touch-target py-2 px-1 transition-colors games-focus-ring ${
                      isActive ? 'text-primary-400' : 'text-white/60'
                    }`}
                    aria-label={label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div
                      style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(167, 139, 250, 0.5))' } : undefined}
                    >
                      <item.icon 
                        className={`w-6 h-6 shrink-0 ${isActive ? 'fill-primary-400/30' : ''}`} 
                        strokeWidth={isActive ? 2.5 : 2} 
                      />
                    </div>
                    <span className="text-[10px] mt-0.5 truncate max-w-[4rem]">{label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Mobile Menu Overlay - P2 Virtualization Optimization */}
          <AnimatePresence>
            {state.isMobileMenuOpen && (
              <m.div
                ref={mobileMenuRef}
                id={MOBILE_MENU_ID}
                className="fixed inset-0 md:hidden bg-[#1a0a2e]/90 backdrop-blur-xl"
                style={{ zIndex: Z_MOBILE_MENU }}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: '-100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: '-100%' }}
                transition={prefersReducedMotion ? { duration: 0 } : { 
                  duration: MOBILE_MENU_DURATION_MS / 1000, 
                  ease: [0.32, 0.72, 0, 1] 
                }}
                onClick={() => dispatch({ type: 'SET_MOBILE_MENU_OPEN', payload: false })}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    dispatch({ type: 'SET_MOBILE_MENU_OPEN', payload: false });
                    setTimeout(() => menuButtonRef.current?.focus(), 0);
                  }
                }}
                role="dialog"
                aria-modal="true"
                aria-label={t('nav.navigationMenu')}
              >
                <div className="flex flex-col items-center justify-center h-full gap-8" onClick={(e) => e.stopPropagation()}>
                  {/* P2-001: Virtualized mobile menu for better performance with large item lists */}
                  {NAV_ITEMS.length > 5 ? (
                    <div className="w-full max-w-md px-4">
                      {VirtualizedMobileMenu}
                    </div>
                  ) : (
                    // Fallback to regular rendering for small lists
                    NAV_ITEMS.map((item, index) => {
                      const isActive = item.href === '/' 
                        ? pathname === '/' 
                        : pathname === item.href || pathname.startsWith(item.href + '/');
                      
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
                            ref={index === 0 ? mobileMenuFirstLinkRef : undefined}
                            href={item.href}
                            onClick={() => dispatch({ type: 'SET_MOBILE_MENU_OPEN', payload: false })}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex items-center gap-4 text-2xl font-display font-bold games-focus-ring rounded-lg py-2 min-h-[48px] ${
                              isActive ? 'text-primary-400' : 'text-white'
                            }`}
                          >
                            <item.icon className={`w-8 h-8 ${isActive ? 'text-primary-400/80' : 'text-white/50'}`} />
                            {t(`nav.${item.navKey}`)}
                          </Link>
                        </m.div>
                      );
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
                    <Link href="/pricing" onClick={() => dispatch({ type: 'SET_MOBILE_MENU_OPEN', payload: false })}>
                      <button type="button" className="btn-primary min-h-[48px] games-focus-ring">
                        {CTA_UNLOCK_PRO}
                      </button>
                    </Link>
                  </m.div>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
  )
);

OptimizedNavigation.displayName = 'OptimizedNavigation';

// Export default for backward compatibility
export default OptimizedNavigation;