'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown,
  Sun,
  Moon,
  Contrast,
  Bell,
  User,
  Menu,
  X,
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useNavVisibility } from '@/contexts/NavVisibilityContext'
import { useSubscription } from '@/hooks/useSubscription'
import { useThrottle } from '@/hooks/useThrottle'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { BrandLogo } from '@/components/BrandLogo'
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
  const navVisibility = useNavVisibility()
  const hideForGame = pathname === '/games' && navVisibility?.hideForGame
  const { resolved, setTheme, theme, highContrast, setHighContrast, fontScale, setFontScale } = useTheme()
  const { tier } = useSubscription()
  const prefersReducedMotion = usePrefersReducedMotion()

  const [scrollY, setScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const notificationsRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileMenuFirstLinkRef = useRef<HTMLAnchorElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  useFocusTrap(isMobileMenuOpen, mobileMenuRef)

  /** N28：滾動閾值常數；P1：滾動後背景至少 0.92 不透明度，白字對比 ≥4.5:1 */
  const navOpacity = useMemo(
    () => Math.min(1, 0.4 + (scrollY / SCROLL_OPACITY_MAX_PX) * 0.6),
    [scrollY]
  )
  const navCompact = scrollY > SCROLL_COMPACT_PX
  const navBg = navCompact ? `rgba(26,10,46,${Math.max(0.92, navOpacity)})` : 'transparent'

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

  /** N12：通知點擊外關閉 — useCallback 穩定 */
  const handleNotificationOutside = useCallback((e: MouseEvent) => {
    if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
      setNotificationsOpen(false)
    }
  }, [])
  useEffect(() => {
    if (!notificationsOpen) return
    document.addEventListener('mousedown', handleNotificationOutside)
    return () => document.removeEventListener('mousedown', handleNotificationOutside)
  }, [notificationsOpen, handleNotificationOutside])

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
      <motion.nav
        className="fixed top-0 left-0 right-0 backdrop-blur-2xl print:hidden"
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
            <motion.div
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            >
              <BrandLogo variant="nav" href="/" />
            </motion.div>

            {/* N20：主題/高對比/字體 aria-pressed 與 state 一致 */}
            <div className="flex items-center gap-1" role="group" aria-label="顯示設定">
              <button
                onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
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

            {/* N21/N22：桌面導航區 role="navigation"、N01 aria-current="page" */}
            <div className="hidden md:flex items-center nav-item-gap" role="navigation" aria-label="主導航連結">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    className="games-focus-ring rounded-full"
                  >
                    <motion.div
                      className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[48px] flex items-center ${isActive ? 'text-primary-400 font-semibold' : 'text-white/60 hover:text-white'}`}
                      whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId={prefersReducedMotion ? undefined : 'nav-pill'}
                          className="absolute inset-0 bg-white/10 rounded-full"
                          transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </motion.div>
                  </Link>
                )
              })}
            </div>

            {/* 右側：訂閱狀態、通知、個人 */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href={tier === 'free' ? '/pricing' : '/subscription'}
                aria-label={tier === 'free' ? '升級 Pro 方案' : '訂閱管理'}
                className="nav-cta-ux icon-interact icon-glow games-focus-ring rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider games-touch-target justify-center"
              >
                <motion.span
                  className={tier === 'free' ? 'text-secondary-500 hover:text-secondary-400' : 'text-primary-400 hover:text-primary-300'}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                >
                  <Crown className="w-5 h-5" aria-hidden />
                  {tierLabel}
                </motion.span>
              </Link>
              <div className="h-6 w-px flex-shrink-0 bg-white/10" role="separator" aria-hidden />

              {/* N16/N24：通知下拉 max-height、overflow；空狀態 id */}
              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((v) => !v)}
                  className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors games-touch-target flex items-center justify-center games-focus-ring"
                  aria-label="站內通知"
                  aria-expanded={notificationsOpen}
                >
                  <Bell className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      className="absolute right-0 top-full mt-1 w-64 max-h-[70vh] overflow-auto rounded-xl bg-[#1a0a2e] border border-white/10 py-2 shadow-xl z-[60]"
                      role="menu"
                      aria-label="通知列表"
                      aria-describedby="nav-notifications-empty"
                      id="nav-notifications-panel"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}
                    >
                      <p id="nav-notifications-empty" className="px-4 py-2 text-white/50 text-sm">
                        尚無通知
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* UX_LAYOUT_200 #62：登入/註冊入口明顯 — 顯示「登入」文字 */}
              <Link
                href="/profile"
                aria-label="登入或個人頁面"
                className="icon-interact games-focus-ring rounded-full flex items-center gap-2 min-h-[48px]"
              >
                <motion.span
                  className="min-h-[48px] min-w-[48px] w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 p-[1px] shadow-glow-secondary hover:shadow-glow-secondary inline-flex items-center justify-center"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                >
                  <span className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" aria-hidden />
                  </span>
                </motion.span>
                <span className="text-sm font-medium text-white/90 hidden sm:inline">登入</span>
              </Link>
            </div>

            {/* N07/N29：行動選單按鈕 aria-controls、ref 供焦點回歸 */}
            <motion.button
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
                  <motion.div
                    key="close"
                    initial={prefersReducedMotion ? undefined : { rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={prefersReducedMotion ? undefined : { rotate: 90, opacity: 0 }}
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={prefersReducedMotion ? undefined : { rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={prefersReducedMotion ? undefined : { rotate: -90, opacity: 0 }}
                  >
                    <Menu className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* N21：底部導航 z-index、N18 safe-area、N01 aria-current */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#0a0a1a]/95 backdrop-blur-xl safe-area-pb print:hidden"
        style={{ zIndex: Z_NAV_BOTTOM }}
        aria-label="底部導航"
      >
        <div className="flex items-stretch justify-around">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 games-touch-target py-2 px-1 transition-colors games-focus-ring ${isActive ? 'text-primary-400' : 'text-white/60'}`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className={`w-6 h-6 shrink-0 ${isActive ? 'fill-primary-400/30' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] mt-0.5 truncate max-w-[4rem]">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* N15：行動選單 overlay 點擊關閉；N07 id；N19 順序與桌面一致 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            id={MOBILE_MENU_ID}
            className="fixed inset-0 md:hidden bg-[#1a0a2e]/90 backdrop-blur-xl"
            style={{ zIndex: Z_MOBILE_MENU }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: MOBILE_MENU_DURATION_MS / 1000, ease: 'easeOut' }}
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
              {NAV_ITEMS.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: MOBILE_MENU_DURATION_MS / 1000, ease: 'easeOut', delay: 0.05 + index * 0.05 }}
                >
                  <Link
                    ref={index === 0 ? mobileMenuFirstLinkRef : undefined}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-2xl font-display font-bold text-white games-focus-ring rounded-lg py-2 min-h-[48px]"
                  >
                    <item.icon className="w-8 h-8 text-white/50" />
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <div className="w-16 h-[1px] bg-white/10 my-4" aria-hidden />

              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: MOBILE_MENU_DURATION_MS / 1000, ease: 'easeOut', delay: 0.3 }}
              >
                <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
                  <button type="button" className="btn-primary min-h-[48px] games-focus-ring">
                    {CTA_UNLOCK_PRO}
                  </button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
