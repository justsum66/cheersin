import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Playfair_Display, Inter, Noto_Sans_TC } from 'next/font/google'
import './globals.css'
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

/** 11 標題字體：Playfair Display 高級感 */
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

/** T021 P2：meta 說明目標客群（成人/酒類），搜尋即知、不誤導為兒童產品 */
export const metadata: Metadata = {
  title: 'Cheersin | 探索你的靈魂之酒',
  description: 'Cheersin — 你的 AI 派對靈魂伴侶。靈魂酒測發現命定酒款、AI 幫你選遊戲與問酒、派對桌遊同樂、品酒學院從零學起。測驗免費，一站滿足。未滿18歲請勿飲酒。',
  keywords: ['AI 派對靈魂伴侶', '酒類教育', '品酒', 'AI侍酒師', '葡萄酒', '威士忌', '派對遊戲', '台灣'],
  authors: [{ name: 'Cheersin Team' }],
  metadataBase: new URL(BASE),
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
  openGraph: {
    title: 'Cheersin | 探索你的靈魂之酒',
    description: '你的 AI 派對靈魂伴侶 — 靈魂酒測、選遊戲、問酒款、派對桌遊、品酒學院，一站滿足。',
    type: 'website',
    locale: 'zh_TW',
    url: BASE,
    /** T009 P2：分享預覽 — 動態 opengraph-image.tsx 產出 1200×630；metadataBase 會解析為絕對 URL */
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Cheersin 探索你的靈魂之酒' }],
  },
  /** E66 P2：Twitter 卡片與分享預覽一致，含圖片 */
  twitter: {
    card: 'summary_large_image',
    title: 'Cheersin | 探索你的靈魂之酒',
    description: '你的 AI 派對靈魂伴侶 — 靈魂酒測、選遊戲、問酒款、派對桌遊、品酒學院，一站滿足。',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Cheersin 探索你的靈魂之酒' }],
  },
}

/** A11y: 不限制 maximumScale，允許低視力用戶縮放（axe meta-viewport） */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" className={`${playfair.variable} ${inter.variable} ${notoSansTC.variable}`} suppressHydrationWarning>
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
        <link rel="preload" href="/logo.png" as="image" fetchPriority="high" />
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
            {/* 128 Skip to content；AUDIT #22 確認首頁可跳至 #main-content 或主內容 */}
            <a href="#main-content" className="skip-link">
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
