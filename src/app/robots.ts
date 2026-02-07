import type { MetadataRoute } from 'next'

/** T080 P2：robots 限制敏感路徑，sitemap 僅公開頁；197 爬蟲規則 */
const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/subscription/success',
          '/subscription/cancel',
          '/auth/',
          '/profile',
          '/login',
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
