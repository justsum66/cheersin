import type { MetadataRoute } from 'next'

/** 200 PWA Manifest：安裝到主螢幕 */
const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cheersin 沁飲 | 探索你的靈魂之酒',
    short_name: '沁飲 Cheersin',
    description: '你的 AI 派對靈魂伴侶 — 靈魂酒測、選遊戲、問酒款、派對遊戲，一站滿足。',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#0a0a0f',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'zh-TW',
    /** PWA-9/10：192 與 512 必備；Next 型別僅接受單一 purpose，故各尺寸分兩筆 any + maskable */
    icons: [
      { src: '/sizes/android_192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/sizes/android_192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/sizes/android_512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/sizes/android_512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/sizes/favicon_16.png', sizes: '16x16', type: 'image/png' },
      { src: '/sizes/favicon_32.png', sizes: '32x32', type: 'image/png' },
      { src: '/sizes/icon_256_gold.png', sizes: '256x256', type: 'image/png' },
      { src: '/sizes/icon_512_gold.png', sizes: '512x512', type: 'image/png' },
      // PWA-017: Monochrome icon for Android themed shortcuts
      { src: '/sizes/icon_512_gold.png', sizes: '512x512', type: 'image/png', purpose: 'monochrome' },
    ],
    /** PWA Screenshots：安裝預覽圖（行動裝置與桌面） */
    screenshots: [
      {
        src: `${BASE}/sizes/og_image_1200x630.png`,
        sizes: '1200x630',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Cheersin 沁飲 首頁'
      },
      {
        src: `${BASE}/sizes/og_image_1200x630.png`,
        sizes: '1200x630',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Cheersin 沁飲 桌面版'
      }
    ],
    categories: ['entertainment', 'lifestyle'],
    /** PWA-12：偏好以 PWA 安裝，不優先推原生 app */
    prefer_related_applications: false,
    /** PWA 16–20：shortcuts 安裝後長按圖標可快速進入 */
    shortcuts: [
      { name: '靈魂酒測', short_name: '測驗', url: '/quiz', description: '發現你的靈魂之酒' },
      { name: 'AI 侍酒師', short_name: '助理', url: '/assistant', description: '問酒、推薦' },
      { name: '派對遊樂場', short_name: '遊戲', url: '/games', description: '派對桌遊' },
    ],
  } as any
}
