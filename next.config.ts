import type { NextConfig } from 'next'
import path from 'path'
import bundleAnalyzer from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs'

// 297 Bundle 分析：ANALYZE=true npm run build 產出 report
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** 多 lockfile 時明確指定 app 根目錄，消除 workspace root 推測警告 */
  outputFileTracingRoot: path.join(process.cwd()),
  /* webpack watchOptions.ignored 僅支援字串 glob，不可用 function */
  webpack: (config, { dev, isServer }) => {
    if (config.optimization) {
      config.optimization.moduleIds = 'deterministic'
      
      // P008: Vendor chunks optimization for stable dependencies
      if (!dev && !isServer) {
        config.optimization.splitChunks = {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // React core bundle
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'vendor-react',
              priority: 40,
              reuseExistingChunk: true,
            },
            // Next.js framework
            next: {
              test: /[\\/]node_modules[\\/]next[\\/]/,
              name: 'vendor-next',
              priority: 35,
              reuseExistingChunk: true,
            },
            // Supabase & Auth
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'vendor-supabase',
              priority: 30,
              reuseExistingChunk: true,
            },
            // UI libraries (framer-motion, lottie)
            ui: {
              test: /[\\/]node_modules[\\/](framer-motion|lottie-react)[\\/]/,
              name: 'vendor-ui',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Icons
            icons: {
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              name: 'vendor-icons',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Other vendors
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor-other',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        }
      }
    }
    
    // P007: Persistent cache for production builds - 30% faster rebuilds
    // cacheDirectory 必須為絕對路徑（Windows/Webpack 5 要求）
    if (!dev && !isServer) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: path.join(process.cwd(), '.next', 'cache', 'webpack'),
      }
    }
    
    if (dev) {
      /* watchOptions.ignored 必須全為字串；Next 會合併，故只覆寫 ignored 為全字串陣列 */
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**', '**/.next/**', '**/.git/**', '**/dist/**', '**/coverage/**',
          '**/DumpStack.log.tmp', '**/hiberfil.sys', '**/pagefile.sys', '**/swapfile.sys',
          'C:\\DumpStack.log.tmp', 'C:\\hiberfil.sys', 'C:\\pagefile.sys', 'C:\\swapfile.sys',
        ].filter(Boolean),
      }
      config.cache = { type: 'memory' }
    }
    return config
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    /* 白名單：限制外部圖片來源，防止 SSRF */
    remotePatterns: [
      { protocol: 'https', hostname: 'wdegandlipgdvqhgmoai.supabase.co', pathname: '/**' },
      { protocol: 'https', hostname: 'api.dicebear.com', pathname: '/**' },
      { protocol: 'https', hostname: 'api.qrserver.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
    ],
    dangerouslyAllowSVG: true,
  },
  /** P2-314：Server Actions 請求體大小限制，防止過大 payload 耗盡資源 */
  /** P2-314：Server Actions 請求體大小限制，防止過大 payload */
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
    /* PPR 需 next@canary；穩定版暫不啟用。啟用後可實現 <100ms TTFB */
    /* 28 modulepreload 關鍵 chunks；減少 framer-motion / motion-dom 載入錯誤 */
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  /* P3-72：靜態資源 Cache-Control — 圖片/字體/_next/static max-age=1 年 */
  /* SEC-01～04：全站安全標頭 — 先匹配靜態再匹配全站，確保皆有 security + 靜態有 cache */
  async headers() {
    /** P0-019 / SEC-18：CSP 防 XSS。預設 report-only；正式上線設 CSP_REPORT_ONLY=false 強制執行。 */
    const cspReportOnly = process.env.CSP_REPORT_ONLY !== 'false'
    const cspHeaderName = cspReportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy'
    /* SEC-18 優化：img-src 白名單化防 SSRF；*.supabase.co 涵蓋各專案 Storage */
    const imgSrcHosts = [
      "'self'", "data:", "blob:",
      "https://*.supabase.co",
      "https://api.dicebear.com",
      "https://api.qrserver.com",
      "https://lh3.googleusercontent.com",
    ].join(' ')
    const cspValue = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      `img-src ${imgSrcHosts}`,
      "connect-src 'self' https://*.supabase.co https://api.groq.com https://openrouter.ai https://api.pinecone.io https://api-m.paypal.com https://api-m.sandbox.paypal.com https://www.google-analytics.com https://*.ingest.us.sentry.io https://*.ingest.sentry.io wss:",
      "frame-src 'self' https://www.paypal.com",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
    /** SEC-21：生產環境 HSTS，強制 HTTPS；max-age=1 年、includeSubDomains、preload */
    const hstsHeader =
      process.env.NODE_ENV === 'production'
        ? { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }
        : null
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
      { key: cspHeaderName, value: cspValue },
      ...(hstsHeader ? [hstsHeader] : []),
    ]
    return [
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2|ttf|otf)',
        headers: [
          ...securityHeaders,
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          ...securityHeaders,
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

const configWithAnalyzer = withBundleAnalyzer(nextConfig)

export default withSentryConfig(configWithAnalyzer, {
  org: process.env.SENTRY_ORG ?? 'prowine',
  project: process.env.SENTRY_PROJECT ?? 'javascript-nextjs',
  silent: !process.env.CI,
})
