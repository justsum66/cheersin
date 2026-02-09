import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

/** 94 證書 OG 預覽：分享證書連結時的預覽標題與描述 */
export const metadata: Metadata = {
  title: '課程完成證書 | Cheersin 品酒學院',
  description: '恭喜完成 Cheersin 品酒學院課程，取得專屬證書。葡萄酒、威士忌、清酒、精釀啤酒，從零開始學品酒。',
  openGraph: {
    title: '課程完成證書 | Cheersin 品酒學院',
    description: '恭喜完成 Cheersin 品酒學院課程，取得專屬證書。',
    type: 'website',
    locale: 'zh_TW',
    url: `${BASE}/learn/certificate`,
    images: [{ url: '/sizes/icon_512_gold.png', width: 512, height: 512, alt: 'Cheersin 沁飲 品酒學院證書' }],
  },
  twitter: {
    card: 'summary',
    title: '課程完成證書 | Cheersin 品酒學院',
    description: '恭喜完成 Cheersin 品酒學院課程。',
  },
}

export default function CertificateLayout({ children }: { children: React.ReactNode }) {
  return children
}
