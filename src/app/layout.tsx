import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { Playfair_Display, Inter, Noto_Sans_TC } from 'next/font/google'
import './globals.css'
import '@/components/games/games.css'
import { Toaster } from 'react-hot-toast'
import Navigation from '@/components/navigation/Navigation'
import AuroraBackground from '@/components/AuroraBackground'
import ScrollProgress from '@/components/ui/ScrollProgress'
import { RouteChangeProgress } from '@/components/ui/RouteChangeProgress'
import { BackToTop } from '@/components/ui/BackToTop'
import { ClientProviders } from '@/components/providers/ClientProviders'
import { PageTransition } from '@/components/ui/PageTransition'
import { JsonLd } from '@/components/JsonLd'
import WebVitalsReporter from '@/components/WebVitalsReporter'
import DeferredAnalytics from '@/components/DeferredAnalytics'
import NavHiddenEffect from '@/components/navigation/NavHiddenEffect'
import AgeGate from '@/components/AgeGate'
import CookieConsentBanner from '@/components/CookieConsentBanner'
import { ChatWidget } from '@/components/ChatWidget'
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

/** 11 標題字體：Playfair Display 高級感；PERF-012：display: swap 避免 FOIT 阻塞 */
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  // Phase 1 E1.5: 字型子集化優化 - 預載常用字元範圍
  preload: true,
})

/** 12 內文字體：Inter + Noto Sans TC 確保中文 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
  // Phase 1 E1.5: 字型子集化優化
  preload: true,
})
const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  variable: '--font-noto',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
  // Phase 1 E1.5: 字型子集化優化 - 保持 latin 子集但優化預載
  preload: true,
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
    keywords: ['AI 派對靈魂伴侶', '酒類教育', '品酒', 'AI侍酒師', '葡萄酒', '威士忌', '派對遊戲', '台灣'],
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
    <html lang={locale} dir={dir} className={`${playfair.variable} ${inter.variable} ${notoSansTC.variable}`} suppressHydrationWarning>
      <head>
        {/* 26 preconnect 外部資源 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* 27 dns-prefetch 第三方服務 */}
        <link rel="dns-prefetch" href="https://wdegandlipgdvqhgmoai.supabase.co" />
        <link rel="dns-prefetch" href="https://api.groq.com" />
        <link rel="dns-prefetch" href="https://openrouter.ai" />
        <link rel="dns-prefetch" href="https://api.pinecone.io" />
        {/* P031: LCP optimization - preload critical hero image with fetchpriority */}
        <link rel="preload" href="/logo_monochrome_gold.png" as="image" fetchPriority="high" />
        {/* Phase 1 E1.2: Preload critical fonts for LCP */}
        <link
          rel="preload"
          href="/_next/static/media/playfair-display-latin-400-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* P031: Preconnect to critical origins */}
        <link rel="preconnect" href="https://wdegandlipgdvqhgmoai.supabase.co" crossOrigin="anonymous" />
        {/* PWA 73–74：iOS 加入主畫面時全螢幕、狀態列樣式 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* PWA 75：format-detection 可選 — 避免電話/email 被自動連結 */}
        <meta name="format-detection" content="telephone=no, email=no" />
      </head>
      <body className="antialiased font-sans">
        <JsonLd />
        <ClientProviders>
          <AgeGate>
            <WebVitalsReporter />
            {/* P2-260：第三方分析由 DeferredAnalytics 延遲載入；若接入 GA 請用 next/script strategy="lazyOnload" */}
        <DeferredAnalytics />
            <NavHiddenEffect />
            {/* A11Y-005：Skip link 鍵盤可達、聚焦時可見，跳至主內容 */}
            <a href="#main-content" className="skip-link" aria-label="跳至主內容">
              跳至主內容
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
                  <PageTransition>{children}</PageTransition>
                </Suspense>
              </ErrorBoundaryBlock>
            </main>
            <BackToTop />
            <ChatWidget />
          </AgeGate>
          <CookieConsentBanner />
        </ClientProviders>
        {/* A-10 toast 不擋操作：container  pointer-events-none，toast 本體 pointer-events-auto */}
        {/* 任務 76：Toast z-index 低於 Modal（design-tokens modal 200），多則堆疊順序由 react-hot-toast 處理 */}
        <Toaster
          position="top-center"
          containerStyle={{ pointerEvents: 'none', zIndex: 150 }}
          toastOptions={{
            duration: TOAST_DURATION_DEFAULT,
            className: 'toast-enter-anim',
            style: {
              pointerEvents: 'auto',
              background: 'rgba(26, 10, 46, 0.95)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              boxShadow: '0 4px 24px -2px rgba(139, 0, 0, 0.12), 0 0 0 1px rgba(212, 175, 55, 0.08)',
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
      </body>
    </html>
  )
}
