import type { MetadataRoute } from 'next'

/** 200 PWA Manifest：安裝到主螢幕 */
const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cheersin 乾杯 | 探索你的靈魂之酒',
    short_name: 'Cheersin',
    description: '透過有趣的測驗發現最適合你的酒款，與AI侍酒師互動，享受派對遊戲。',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#0a0a0f',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'zh-TW',
    /** PWA-9/10：192 與 512 必備；Next 型別僅接受單一 purpose，故各尺寸分兩筆 any + maskable */
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      // 額外尺寸以提升相容性
      { src: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { src: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { src: '/logo.png', sizes: '144x144', type: 'image/png' },
      { src: '/logo.png', sizes: '384x384', type: 'image/png' },
    ],
    /** PWA Screenshots：安裝預覽圖（行動裝置與桌面） */
    screenshots: [
      {
        src: `${BASE}/logo.png`,
        sizes: '512x512',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Cheersin 首頁'
      },
      {
        src: `${BASE}/logo.png`,
        sizes: '512x512',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Cheersin 桌面版'
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
  }
}
