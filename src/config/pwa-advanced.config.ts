/**
 * PWA-021: Splash screen configuration per platform.
 * PWA-026: Workbox build config placeholder (used at build time).
 * PWA-028: Offline course reading list.
 * PWA-030: iOS A2HS tutorial config.
 */

// ======== PWA-021: Platform splash screen config ========
export const SPLASH_SCREEN_CONFIG = {
  android: {
    backgroundColor: '#000000',
    iconPath: '/sizes/android_512.png',
    fadeOutDuration: 300,
  },
  ios: {
    // Apple Touch Startup Images are set via <link rel="apple-touch-startup-image">
    // These are handled in layout.tsx <head> section
    backgroundColor: '#000000',
    statusBarStyle: 'black-translucent' as const,
  },
  desktop: {
    backgroundColor: '#0a0a0f',
    iconPath: '/sizes/icon_512_gold.png',
  },
} as const

// ======== PWA-026: Workbox integration config ========
export const WORKBOX_CONFIG = {
  // When migrating from hand-written SW to Workbox:
  swDest: 'public/sw.js',
  globDirectory: '.next/static/',
  globPatterns: ['**/*.{js,css,woff2}'],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
      handler: 'NetworkFirst' as const,
      options: { cacheName: 'supabase-api', expiration: { maxEntries: 50 } },
    },
    {
      urlPattern: /\.(png|jpg|jpeg|webp|avif|svg)$/,
      handler: 'CacheFirst' as const,
      options: { cacheName: 'image-cache', expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 } },
    },
  ],
  skipWaiting: true,
  clientsClaim: true,
} as const

// ======== PWA-027: Install analytics events ========
export const PWA_ANALYTICS_EVENTS = {
  INSTALL_PROMPT_SHOWN: 'pwa_install_prompt_shown',
  INSTALL_PROMPT_ACCEPTED: 'pwa_install_prompt_accepted',
  INSTALL_PROMPT_DISMISSED: 'pwa_install_prompt_dismissed',
  APP_INSTALLED: 'pwa_app_installed',
  UPDATE_PROMPT_SHOWN: 'pwa_update_prompt_shown',
  UPDATE_ACCEPTED: 'pwa_update_accepted',
  UPDATE_DISMISSED: 'pwa_update_dismissed',
} as const

// ======== PWA-028: Courses available for offline reading ========
export const OFFLINE_COURSES = [
  { slug: 'wine-basics', name: '葡萄酒入門', estimatedSizeKB: 120 },
  { slug: 'tasting-101', name: '品飲入門', estimatedSizeKB: 95 },
  { slug: 'grape-varieties', name: '葡萄品種介紹', estimatedSizeKB: 150 },
] as const

/** SW cache URLs for offline courses */
export function getOfflineCourseUrls(): string[] {
  return OFFLINE_COURSES.map((c) => `/learn/${c.slug}`)
}

// ======== PWA-030: iOS Install Tutorial Steps ========
export const IOS_INSTALL_STEPS = [
  { step: 1, icon: '🔗', text: '點擊 Safari 底部的「分享」按鈕 (方框加箭頭圖示)' },
  { step: 2, icon: '➕', text: '向下滑動，找到並點擊「加入主畫面」' },
  { step: 3, icon: '✅', text: '點擊右上角「新增」確認安裝' },
  { step: 4, icon: '🏠', text: '返回主畫面，點擊 Cheersin 圖示即可開啟' },
] as const

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
}

export function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true
}
