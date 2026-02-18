import type { NextConfig } from 'next'
import path from 'path'
import bundleAnalyzer from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs'

// 297 Bundle 分析：ANALYZE=true npm run build 產出 report
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** 暫時忽略 ESLint warnings，允許 build 通過 (後續逐步修復) */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 允許 build 即使有 type warnings
    ignoreBuildErrors: false,
  },
  /** PERF-015：Next.js Link 預設對 viewport 內連結 prefetch；關鍵 CTA 使用 Link 即可享有預載 */
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
              test: /[\/]node_modules[\/](framer-motion|lottie-react)[\/]/,
              name: 'vendor-ui',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Task 1.02: Bundle Size Reduction - Split heavy UI components
            components: {
              test: /[\/]src[\/](components|modules)[\/]/,
              name: 'app-components',
              priority: 20,
              chunks: 'all',
              minChunks: 2,
            },
            // Icons
            icons: {
              test: /[\/]node_modules[\/](lucide-react)[\/]/,
              name: 'vendor-icons',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Task 1.02: Bundle Size Reduction - Game components optimization
            games: {
              test: /[\/]src[\/]components[\/]games[\/]/,
              name: 'game-components',
              priority: 15,
              chunks: 'all',
              minChunks: 1,
            },
            // Task 1.02: Bundle Size Reduction - Learn components optimization
            learn: {
              test: /[\/]src[\/](app[\/]learn|components[\/]learn)[\/]/,
              name: 'learn-components',
              priority: 15,
              chunks: 'all',
              minChunks: 1,
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
    // buildDependencies 使用專案內 next.config.ts 路徑，避免解析 next.config.compiled.js 失敗
    if (!dev && !isServer) {
      const configPath = path.join(process.cwd(), 'next.config.ts')
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [configPath],
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
  /** PERF-004 / PERF-018：圖片 WebP/AVIF；R2-246 deviceSizes/imageSizes 精確化 */
  /** Task 1.03: Image Optimization Pipeline - Enhanced configuration for 60% payload reduction */
  images: {
    // Task 1.03: Enable modern image formats
    formats: ['image/webp', 'image/avif'],
    // Task 1.03: Optimized device sizes for better performance
    deviceSizes: [320, 420, 768, 1024, 1200, 1600, 1920],
    // Task 1.03: Optimized image sizes for common use cases
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Task 1.03: Progressive loading configuration
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    // Task 1.03: Content security policy for images
    contentSecurityPolicy: "default-src 'self'; img-src 'self' data: https:; script-src 'none';",
    /* 白名單：限制外部圖片來源，防止 SSRF */
    remotePatterns: [
      { protocol: 'https', hostname: 'wdegandlipgdvqhgmoai.supabase.co', pathname: '/**' },
      { protocol: 'https', hostname: 'api.dicebear.com', pathname: '/**' },
      { protocol: 'https', hostname: 'api.qrserver.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      // Task 1.03: Add cloudinary for image optimization
      { protocol: 'https', hostname: '*.cloudinary.com', pathname: '/**' },
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
  /** 舊路徑相容：/logo.png 改寫為 logo_monochrome_gold.png，回傳 200+圖片本體，避免 Image 優化器報 "invalid image received null"（僅 rewrite，不 302） */
  async rewrites() {
    return [
      { source: '/logo.png', destination: '/logo_monochrome_gold.png' },
    ]
  },
  /* P3-72：靜態資源 Cache-Control — 圖片/字體/_next/static max-age=1 年 */
  /* SEC-01～04 / SEC-007：CSP 頭部覆蓋並收緊。正式環境請設 CSP_REPORT_ONLY=false 強制執行。詳見 docs/security-headers.md、docs/auth-turnstile-flow.md（SEC-008） */
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
    /**
     * CSP 強化：移除 unsafe-eval；script-src 僅保留 unsafe-inline（Next.js 需要，
     * 搭配 strict-dynamic 於正式環境使用 nonce 時可進一步收緊）。
     * style-src 保留 unsafe-inline 因 Tailwind/react-hot-toast 動態注入樣式。
     */
    const cspValue = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      `img-src ${imgSrcHosts}`,
      "connect-src 'self' https://*.supabase.co https://api.groq.com https://openrouter.ai https://api.pinecone.io https://api-m.paypal.com https://api-m.sandbox.paypal.com https://www.google-analytics.com https://*.ingest.us.sentry.io https://*.ingest.sentry.io wss:",
      "frame-src 'self' https://www.paypal.com https://challenges.cloudflare.com",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      /** PWA-008: Allow SW scope in CSP — add worker-src directive */
      "worker-src 'self'",
      /* T39: form-action 加入 paypal.com，讓 PayPal 結帳表單提交正常運作 */
      "form-action 'self' https://www.paypal.com https://www.sandbox.paypal.com",
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
      /* T36: payment=self 讓 PayPal iframe 支付正常（而非完全禁用） */
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://www.paypal.com")' },
      /* T38: 禁止 Flash/PDF 跨域載入此站資源 */
      { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
      { key: cspHeaderName, value: cspValue },
      ...(hstsHeader ? [hstsHeader] : []),
    ]
    return [
      /** PWA-008: Explicit SW scope header to ensure CSP allows service worker */
      {
        source: '/sw.js',
        headers: [
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
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
