import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

/** 194 每頁 SEO meta；198 canonical；AST-48 og:image */
export const metadata: Metadata = {
  title: 'AI 侍酒師 | Cheersin',
  description: '與 AI 侍酒師對話，獲得餐酒搭配、酒款推薦與品酒知識。隨時問、即時答。',
  alternates: { canonical: `${BASE}/assistant` },
  openGraph: {
    title: 'AI 侍酒師 | Cheersin',
    description: '隨時問酒、即時推薦',
    url: `${BASE}/assistant`,
    images: [{ url: `${BASE}/sizes/icon_128_gold.png`, width: 128, height: 128, alt: 'Cheersin AI 侍酒師' }],
  },
}

/** AST-48：結構化資料 SoftwareApplication，利於搜尋與摘要 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Cheersin AI 侍酒師',
  applicationCategory: 'LifestyleApplication',
  description: '與 AI 侍酒師對話，獲得餐酒搭配、酒款推薦與品酒知識。隨時問、即時答。',
  url: `${BASE}/assistant`,
  author: { '@type': 'Organization', name: 'Cheersin' },
}

export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
