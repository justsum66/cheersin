import type { Metadata } from 'next'
import { LEARN_COURSE_COUNT } from '@/lib/learn-constants'
import { SafeJsonLdScript } from '@/components/SafeJsonLdScript'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

/** 194 每頁 SEO meta；198 canonical；hydration 與 page 一致 */
export const metadata: Metadata = {
  title: '品酒學院 | Cheersin',
  description: `${LEARN_COURSE_COUNT} 門課程，葡萄酒、威士忌、清酒、啤酒、調酒入門到專家。5 分鐘快懂、WSET·CMS·MW 認證對應。`,
  alternates: { canonical: `${BASE}/learn` },
  openGraph: {
    title: '品酒學院 | Cheersin',
    description: '從零開始學品酒',
    url: `${BASE}/learn`,
  },
}

/** 任務 78：BreadcrumbList JSON-LD 供搜尋與無障礙；學院首頁為 首頁 > 品酒學院 */
function LearnBreadcrumbJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: BASE },
      { '@type': 'ListItem', position: 2, name: '品酒學院', item: `${BASE}/learn` },
    ],
  }
  return <SafeJsonLdScript data={jsonLd} />
}

/** 97 鍵盤導覽：skip link 跳至主要內容 */
export default function LearnLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <LearnBreadcrumbJsonLd />
      <a href="#learn-main" className="skip-link" aria-label="跳至主要內容">
        跳至主要內容
      </a>
      {children}
    </>
  )
}
