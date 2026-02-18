import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Outfit, Inter, Noto_Sans_TC } from 'next/font/google'
import { LazyMotion, domAnimation } from 'framer-motion'
import './globals.css'
import '@/styles/base.css'
import '@/styles/shared.css'
import '@/styles/components.css'
import '@/styles/utilities.css'
import '@/styles/print.css'
import '@/components/games/games.css'
import { Toaster } from 'react-hot-toast'
import Navigation from '@/components/navigation/Navigation'
import { GameStickyFooter } from '@/components/games/GameStickyFooter'
import AuroraBackground from '@/components/AuroraBackground'
import { ScrollProgress } from '@/components/ui/ScrollProgress'
import { RouteChangeProgress } from '@/components/ui/RouteChangeProgress'
const BackToTop = dynamic(() => import('@/components/ui/BackToTop').then(m => m.BackToTop))
import { ClientProviders } from '@/components/providers/ClientProviders'
import { PageTransitionWrapper } from '@/components/ui/PageTransitionWrapper'
import { JsonLd } from '@/components/JsonLd'
const WebVitalsReporter = dynamic(() => import('@/components/WebVitalsReporter'))
import { WebVitalsTracker } from '@/components/performance/WebVitalsTracker'
import DeferredAnalytics from '@/components/DeferredAnalytics'
import { CacheManager } from '@/components/caching/CacheManager'
import NavHiddenEffect from '@/components/navigation/NavHiddenEffect'
import AgeGate from '@/components/AgeGate'
const CookieConsentBanner = dynamic(() => import('@/components/CookieConsentBanner'))
const ChatWidget = dynamic(() => import('@/components/ChatWidget').then(m => m.ChatWidget))
import ClientOnlyProviders from '@/components/providers/ClientOnlyProviders'
import MaintenanceBanner from '@/components/MaintenanceBanner'
import { OfflineBanner } from '@/components/OfflineBanner'
import ExpiryBanner from '@/components/ExpiryBanner'
import ErrorBoundaryBlock from '@/components/ErrorBoundaryBlock'
import ErrorFallback from '@/components/ErrorFallback'
import Loading from '@/app/loading'
import { TOAST_DURATION_SUCCESS, TOAST_DURATION_ERROR, TOAST_DURATION_DEFAULT } from '@/config/toast.config'
import { getRootMeta } from '@/lib/i18n/server-meta'
import { COOKIE_KEY } from '@/lib/i18n/config'
import type { Locale } from '@/lib/i18n/config'

/** 11 標題字體：Outfit 現代幾何無襯線（Party/Tech 感）；PERF-012：display: swap 避免 FOIT 阻塞 */
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '900'],
  preload: true,
  // Phase 1 Optimization: 字型子集化減少載入時間
  adjustFontFallback: false,
})

/** 12 內文字體：Inter + Noto Sans TC 確保中文 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
  // Phase 1 E1.5: 字型子集化優化
  preload: true,
  adjustFontFallback: false,
})
const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  variable: '--font-noto',
  display: 'swap',
  weight: ['400', '700'],
  // CJK 字型由 Google Fonts 自動按 unicode-range 分片載入；
  // 僅預載 latin subset，減少首屏阻塞；中文字元按需載入。
  // 只保留 400/700 兩個字重以大幅減少 CJK 字型下載量
  preload: true,
  adjustFontFallback: false,
})

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

const LOCALES: Locale[] = ['zh-TW', 'zh-CN', 'yue', 'en', 'ja', 'ko']
/** I18N-16：RTL 預留 — 未來若新增阿拉伯語等，加入此陣列即可讓 html[dir="rtl"] 生效 */
const RTL_LOCALES: Locale[] = []

/** I18N-17 / I18N-008：關鍵頁 meta 依 locale（cookie）切換 title/description/og；SEO、OG 一致。 */
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const localeRaw = cookieStore.get(COOKIE_KEY)?.value ?? 'zh-TW'
  const locale: Locale = LOCALES.includes(localeRaw as Locale) ? (localeRaw as Locale) : 'zh-TW'
  const meta = getRootMeta(locale)
  const ogLocale = locale === 'zh-TW' ? 'zh_TW' : locale === 'zh-CN' ? 'zh_CN' : locale === 'en' ? 'en_US' : locale
  return {
    title: { default: meta.title, template: '%s | Cheersin' },
    description: meta.description,
    keywords: ['AI 派對靈魂伴侶', '酒類教育', '品酒', 'AI侍酒師', '葡萄酒', '威士忌', '派對遊戲', 'Drinking Games', 'Icebreakers', '真心話大冒險', '台灣', 'Party App'],
    authors: [{ name: 'Cheersin Team', url: BASE }],
    metadataBase: new URL(BASE),
    alternates: { canonical: BASE },
    robots: { index: true, follow: true },
    icons: {
      icon: [
        { url: '/sizes/favicon_16.png', sizes: '16x16', type: 'image/png' },
        { url: '/sizes/favicon_32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [{ url: '/sizes/apple_touch_180.png', sizes: '180x180', type: 'image/png' }],
      shortcut: '/sizes/favicon.ico',
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      type: 'website',
      locale: ogLocale,
      url: BASE,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: meta.ogTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.ogTitle,
      description: meta.ogDescription,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: meta.ogTitle }],
    },
  }
}

/** A11y: 不限制 maximumScale，允許低視力用戶縮放（axe meta-viewport） */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const localeRaw = cookieStore.get(COOKIE_KEY)?.value ?? 'zh-TW'
  const locale: Locale = LOCALES.includes(localeRaw as Locale) ? (localeRaw as Locale) : 'zh-TW'
  const dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr'
  return (
    <html lang={locale} dir={dir} className={`${outfit.variable} ${inter.variable} ${notoSansTC.variable}`} suppressHydrationWarning>
      <head>
        {/* 26 preconnect 外部資源 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* HP-047: Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://wdegandlipgdvqhgmoai.supabase.co" crossOrigin="" />
        {/* 27 dns-prefetch 第三方服務 */}
        <link rel="dns-prefetch" href="https://wdegandlipgdvqhgmoai.supabase.co" />
        <link rel="dns-prefetch" href="https://api.groq.com" />
        <link rel="dns-prefetch" href="https://openrouter.ai" />
        <link rel="dns-prefetch" href="https://api.pinecone.io" />
        <link rel="dns-prefetch" href="https://www.paypal.com" />
        {/* P031: LCP optimization - preload critical hero image with fetchpriority */}
        <link rel="preload" href="/logo_monochrome_gold.png" as="image" fetchPriority="high" />
        {/* Task 1.01: Core Web Vitals Optimization - Preload critical fonts */}
        <>
          <link
            rel="preload"
            href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;900&display=swap"
            as="style"
            fetchPriority="high"
          />
          <link
            rel="preload"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap"
            as="style"
            fetchPriority="high"
          />
          <link
            rel="preload"
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&display=swap"
            as="style"
            fetchPriority="high"
          />
        </>
        {/* P031: dns-prefetch for Sentry (補充缺失的第三方 prefetch) */}
        <link rel="dns-prefetch" href="https://o4509427018883072.ingest.us.sentry.io" />
        {/* PWA 73–74：iOS 加入主畫面時全螢幕、狀態列樣式 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* PWA 75：format-detection 可選 — 避免電話/email 被自動連結 */}
        <meta name="format-detection" content="telephone=no, email=no" />
      </head>
      <body className="antialiased font-sans">
        <LazyMotion features={domAnimation}>
          <JsonLd />
          <ClientProviders>
          <AgeGate>
            <WebVitalsReporter />
            <WebVitalsTracker />
            <CacheManager />
            {/* P2-260：第三方分析由 DeferredAnalytics 延遲載入；若接入 GA 請用 next/script strategy="lazyOnload" */}
            <DeferredAnalytics />
            <NavHiddenEffect />
            {/* T21: Skip link 依 locale 顯示對應語言；A11Y-005：鍵盤可達、聚焦時可見 */}
            <a href="#main-content" className="skip-link" aria-label={locale === 'en' ? 'Skip to main content' : locale === 'ja' ? 'メインコンテンツへスキップ' : locale === 'ko' ? '본문으로 건너뛰기' : '跳至主內容'}>
              {locale === 'en' ? 'Skip to content' : locale === 'ja' ? 'コンテンツへ' : locale === 'ko' ? '본문으로' : '跳至主內容'}
            </a>
            <AuroraBackground />
            <MaintenanceBanner />
            <OfflineBanner />
            <Navigation />
            {/* 278 底部導航：手機留 pb + safe-area；277 觸控 48px；UX-08 全站 main 底部安全區 */}
            <main id="main-content" className="relative min-h-screen pt-[48px] main-content-pb md:pb-0" tabIndex={-1}>
              <RouteChangeProgress />
              <ScrollProgress />
              <ExpiryBanner />
              <ErrorBoundaryBlock blockName="頁面" fallback={<ErrorFallback />}>
                <Suspense fallback={<Loading />}>
                  <PageTransitionWrapper>{children}</PageTransitionWrapper>
                </Suspense>
              </ErrorBoundaryBlock>
            </main>
            <BackToTop />
            <ChatWidget />
            {/* NAV-021 / PWA-003/004: Client-only dynamic components */}
            <ClientOnlyProviders />
          </AgeGate>
          <CookieConsentBanner />
        </ClientProviders>
        <GameStickyFooter />
      </LazyMotion>
        {/* A-10 toast 不擋操作：container  pointer-events-none，toast 本體 pointer-events-auto */}
        {/* 任務 76：Toast z-index 低於 Modal（design-tokens modal 200），多則堆疊順序由 react-hot-toast 處理 */}
        {/* GameStickyFooter 和 Toast 在 LazyMotion 之外，因其與主互動解耦 */}
        <Toaster
          position="top-center"
          containerStyle={{ pointerEvents: 'none', zIndex: 150 }}
          toastOptions={{
            duration: TOAST_DURATION_DEFAULT,
            className: 'toast-enter-anim',
            style: {
              pointerEvents: 'auto',
              background: 'rgba(26, 10, 46, 0.7)',
              color: '#fff',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50px',
              padding: '8px 16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            },
            success: {
              duration: TOAST_DURATION_SUCCESS,
              iconTheme: { primary: '#047857', secondary: '#fff' },
              ariaProps: { role: 'status', 'aria-live': 'polite' },
            },
            error: {
              duration: TOAST_DURATION_ERROR,
              iconTheme: { primary: '#b91c1c', secondary: '#fff' },
              ariaProps: { role: 'alert', 'aria-live': 'assertive' },
            },
            /* P1-039：Toast 警告狀態 */
            custom: {
              iconTheme: { primary: '#c2410c', secondary: '#fff' },
              ariaProps: { role: 'status', 'aria-live': 'polite' },
            },
          }}
        />
        <GameStickyFooter />
      </body>
    </html>
  )
}
