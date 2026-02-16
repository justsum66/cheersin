'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import {
  Crown,
  Sun,
  Moon,
  Contrast,
  Menu,
  X,
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useTranslation } from '@/contexts/I18nContext'
import { useNavVisibility } from '@/contexts/NavVisibilityContext'
import { useSubscription } from '@/hooks/useSubscription'
import { useThrottle } from '@/hooks/useThrottle'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { BrandLogo } from '@/components/BrandLogo'
import { NotificationPanel } from '@/components/navigation/NotificationPanel'
import { ThemeTransitionOverlay } from '@/components/theme/ThemeTransitionOverlay'
import { UserMenu } from '@/components/navigation/UserMenu'
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
} from '@/constants/nav'

export default function Navigation() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const navVisibility = useNavVisibility()
  const hideForGame = pathname === '/games' && navVisibility?.hideForGame
  const { resolved, setTheme, theme, highContrast, setHighContrast, fontScale, setFontScale } = useTheme()
  const { tier } = useSubscription()
  const prefersReducedMotion = usePrefersReducedMotion()

  const [scrollY, setScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  /** R2-048：主題切換圓形擴散過渡 */
  const [themeTransition, setThemeTransition] = useState<{ target: 'dark' | 'light'; x: number; y: number } | null>(null)

  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileMenuFirstLinkRef = useRef<HTMLAnchorElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const bottomNavRef = useRef<HTMLElement>(null)
  useFocusTrap(isMobileMenuOpen, mobileMenuRef)

  /** UX-004：手機輸入框 focus 時，鍵盤彈起後將底部導航 scrollIntoView 保持可操作 */
  const keyboardScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (!target?.matches?.('input, textarea, select, [contenteditable="true"]')) return
      if (typeof window === 'undefined' || window.innerWidth >= 768 || !bottomNavRef.current) return
      if (keyboardScrollTimeoutRef.current) clearTimeout(keyboardScrollTimeoutRef.current)
      keyboardScrollTimeoutRef.current = setTimeout(() => {
        bottomNavRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
        keyboardScrollTimeoutRef.current = null
      }, 400)
    }
    document.addEventListener('focusin', onFocusIn)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      if (keyboardScrollTimeoutRef.current) clearTimeout(keyboardScrollTimeoutRef.current)
    }
  }, [])

  /** N28：滾動閾值常數；P1：滾動後背景至少 0.92 不透明度，白字對比 ≥4.5:1 */
  const navOpacity = useMemo(
    () => Math.min(1, 0.4 + (scrollY / SCROLL_OPACITY_MAX_PX) * 0.6),
    [scrollY]
  )
  const navCompact = scrollY > SCROLL_COMPACT_PX

  /* L80: 滾動後背景更深，確保對比度；配合 backdrop-blur-3xl */
  // Optimization Task 6: Premium Glassmorphism - lower opacity, higher blur
  const navBg = navCompact ? `rgba(15, 5, 24, ${Math.max(0.6, navOpacity)})` : 'transparent'

  /** N09：滾動 throttle 減少重繪 */
  const setScroll = useCallback((y: number) => setScrollY(y), [])
  const setScrollYThrottled = useThrottle(setScroll, 50)
  const handleScroll = useCallback(() => setScrollYThrottled(window.scrollY), [setScrollYThrottled])
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  /** N02/N30：Escape 關閉通知與行動選單 */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (notificationsOpen) setNotificationsOpen(false)
      if (isMobileMenuOpen) setIsMobileMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [notificationsOpen, isMobileMenuOpen])

  /** N03：行動選單開啟時焦點到第一個連結；關閉時回開關按鈕 */
  useEffect(() => {
    if (isMobileMenuOpen) {
      mobileMenuFirstLinkRef.current?.focus()
    } else {
      menuButtonRef.current?.focus({ preventScroll: true })
    }
  }, [isMobileMenuOpen])

  /** N14：訂閱狀態與方案文案常數 */
  const tierLabel = getTierLabel(tier)

  if (hideForGame) return null

  /** N05/N25：prefers-reduced-motion 時簡化動畫 */
  const navTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: 'easeOut' as const }

  /* L71：列印時隱藏導航，課程頁列印僅印主體 */
  return (
    <>
      {themeTransition != null && (
        <ThemeTransitionOverlay
          targetTheme={themeTransition.target}
          origin={{ x: themeTransition.x, y: themeTransition.y }}
          onComplete={(target) => {
            setTheme(target)
            setThemeTransition(null)
          }}
        />
      )}
      <m.nav
        className="fixed top-0 left-0 right-0 backdrop-blur-3xl print:hidden safe-area-pt"
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
        aria-label="主導航"
      >
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* N08 / UX_LAYOUT_200 #66：品牌區可點回首頁；單一 Link 由 BrandLogo 渲染，避免 <a> 巢狀 */}
            <m.div
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            >
              <BrandLogo variant="nav" href="/" />
            </m.div>

            {/* N20：主題/高對比/字體 aria-pressed 與 state 一致 */}
            <div className="flex items-center gap-1" role="group" aria-label="顯示設定">
              <button
                onClick={(e) => {
                  const target = resolved === 'dark' ? 'light' : 'dark'
                  if (prefersReducedMotion) {
                    setTheme(target)
                    return
                  }
                  setThemeTransition({ target, x: e.clientX, y: e.clientY })
                }}
                className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors games-touch-target flex items-center justify-center games-focus-ring"
                title={resolved === 'dark' ? '切換淺色' : '切換深色'}
                aria-label={resolved === 'dark' ? '切換淺色模式' : '切換深色模式'}
                aria-pressed={resolved === 'light'}
              >
                {resolved === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`p-2 rounded-xl transition-colors games-touch-target flex items-center justify-center games-focus-ring ${highContrast ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                title={highContrast ? '關閉高對比' : '開啟高對比'}
                aria-label={highContrast ? '關閉高對比模式' : '開啟高對比模式'}
                aria-pressed={highContrast}
              >
                <Contrast className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center rounded-xl bg-white/5 border border-white/10 overflow-hidden" role="radiogroup" aria-label="字體大小">
                {(['sm', 'md', 'lg'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFontScale(s)}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-colors min-w-[2rem] min-h-[48px] flex items-center justify-center games-focus-ring ${fontScale === s ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'}`}
                    title={s === 'sm' ? '小字' : s === 'md' ? '標準' : '大字'}
                    aria-label={s === 'sm' ? '字體較小' : s === 'md' ? '字體標準' : '字體較大'}
                    aria-pressed={fontScale === s}
                  >
                    {s === 'sm' ? '小' : s === 'md' ? '中' : '大'}
                  </button>
                ))}
              </div>
            </div>

            {/* N21/N22 / UX-013：桌面導航 role="navigation"、aria-current="page"、巢狀路由高亮；i18n t('nav.*') */}
            <div className="hidden md:flex items-center nav-item-gap" role="navigation" aria-label="主導航連結">
              {NAV_ITEMS.map((item) => {
                const label = t(`nav.${item.navKey}`)
                const isActive = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={label}
                    aria-current={isActive ? 'page' : undefined}
                    className="games-focus-ring rounded-full"
                  >
                    <m.div
                      className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[48px] flex items-center ${isActive ? 'text-primary-400 font-semibold' : 'text-white/60 hover:text-white'}`}
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
                      {/* R2-046：當前頁滑動底線指示器 */}
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
              })}
            </div>

            {/* 右側：訂閱狀態、通知、個人；UX-013 當前頁 aria-current */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href={tier === 'free' ? '/pricing' : '/subscription'}
                aria-label={tier === 'free' ? '升級 Pro 方案' : '訂閱管理'}
                aria-current={(pathname === '/pricing' || pathname === '/subscription') ? 'page' : undefined}
                className={`games-focus-ring flex items-center gap-2 text-xs font-bold uppercase tracking-wider games-touch-target justify-center transition-all relative overflow-hidden ${tier === 'free'
                  ? 'bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700] bg-[length:200%_auto] animate-shimmer text-[#1a0a2e] px-4 py-2 rounded-full shadow-[0_0_12px_rgba(255,215,0,0.4)] hover:shadow-[0_0_20px_rgba(255,215,0,0.6)] hover:scale-105 active:scale-95'
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
                {/* Shine effect overlay */}
                {tier === 'free' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 translate-x-[-200%] animate-[shine_3s_infinite]" />
                )}
              </Link>
              <div className="h-6 w-px flex-shrink-0 bg-white/10" role="separator" aria-hidden />

              {/* P1-099：通知中心 — 使用 NotificationPanel 組件 */}
              <NotificationPanel
                notificationsOpen={notificationsOpen}
                setNotificationsOpen={setNotificationsOpen}
                prefersReducedMotion={!!prefersReducedMotion}
                hasUnread={false}
              />

              {/* P1-057：用戶頭像與下拉選單（登入後：個人資料/設定/登出） */}
              <UserMenu />
            </div>

            {/* N07/N29：行動選單按鈕 aria-controls、ref 供焦點回歸 */}
            <m.button
              ref={menuButtonRef}
              className="md:hidden games-touch-target w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 games-focus-ring"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
              aria-label={isMobileMenuOpen ? '關閉選單' : '開啟導航選單'}
              aria-expanded={isMobileMenuOpen}
              aria-controls={MOBILE_MENU_ID}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
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

      {/* N21 / UX-013：底部導航 z-index、safe-area、aria-current、巢狀路由高亮；UX-004 ref 供鍵盤彈起時 scrollIntoView */}
      <nav
        ref={bottomNavRef}
        className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#0a0a1a]/80 backdrop-blur-2xl safe-area-pb print:hidden"
        style={{ zIndex: Z_NAV_BOTTOM }}
        aria-label="底部導航"
      >
        <div className="flex items-stretch justify-around">
          {NAV_ITEMS.map((item) => {
            const label = t(`nav.${item.navKey}`)
            const isActive = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 games-touch-target py-2 px-1 transition-colors games-focus-ring ${isActive ? 'text-primary-400' : 'text-white/60'}`}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <m.div
                  animate={isActive && !prefersReducedMotion ? { y: [0, -4, 0], scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(167, 139, 250, 0.5))' } : undefined}
                >
                  <item.icon className={`w-6 h-6 shrink-0 ${isActive ? 'fill-primary-400/30' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                </m.div>
                <span className="text-[10px] mt-0.5 truncate max-w-[4rem]">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav >

      {/* N15：行動選單 overlay 點擊關閉；N07 id；N19 順序與桌面一致 */}
      <AnimatePresence>
        {
          isMobileMenuOpen && (
            <m.div
              ref={mobileMenuRef}
              id={MOBILE_MENU_ID}
              className="fixed inset-0 md:hidden bg-[#1a0a2e]/90 backdrop-blur-xl"
              style={{ zIndex: Z_MOBILE_MENU }}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: '-100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: '-100%' }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: MOBILE_MENU_DURATION_MS / 1000, ease: [0.32, 0.72, 0, 1] }}
              onClick={() => setIsMobileMenuOpen(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsMobileMenuOpen(false)
                  setTimeout(() => menuButtonRef.current?.focus(), 0)
                }
              }}
              role="dialog"
              aria-modal="true"
              aria-label="導航選單"
            >
              <div className="flex flex-col items-center justify-center h-full gap-8" onClick={(e) => e.stopPropagation()}>
                {NAV_ITEMS.map((item, index) => {
                  const isActive = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <m.div
                      key={item.href}
                      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={prefersReducedMotion ? { duration: 0 } : { duration: MOBILE_MENU_DURATION_MS / 1000, ease: 'easeOut', delay: 0.05 + index * 0.05 }}
                    >
                      <Link
                        ref={index === 0 ? mobileMenuFirstLinkRef : undefined}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex items-center gap-4 text-2xl font-display font-bold games-focus-ring rounded-lg py-2 min-h-[48px] ${isActive ? 'text-primary-400' : 'text-white'}`}
                      >
                        <item.icon className={`w-8 h-8 ${isActive ? 'text-primary-400/80' : 'text-white/50'}`} />
                        {t(`nav.${item.navKey}`)}
                      </Link>
                    </m.div>
                  )
                })}

                <div className="w-16 h-[1px] bg-white/10 my-4" aria-hidden />

                <m.div
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: MOBILE_MENU_DURATION_MS / 1000, ease: 'easeOut', delay: 0.3 }}
                >
                  <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
                    <button type="button" className="btn-primary min-h-[48px] games-focus-ring">
                      {CTA_UNLOCK_PRO}
                    </button>
                  </Link>
                </m.div>
              </div>
            </m.div>
          )
        }
      </AnimatePresence >
    </>
  )
}
