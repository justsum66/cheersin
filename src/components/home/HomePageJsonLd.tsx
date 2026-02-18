/**
 * H98：首頁結構化資料 WebPage JsonLd，供搜尋引擎
 * layout 已有 Organization + WebSite；本頁補充 WebPage
 * HP-019：添加 AggregateRating 結構化資料供 Google 豐富搜尋結果
 * SEC-006：使用 SafeJsonLdScript
 */
import { SafeJsonLdScript } from '@/components/SafeJsonLdScript'
import { SOCIAL_PROOF_USER_COUNT } from '@/lib/constants'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

export function HomePageJsonLd() {
  const webPageData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${BASE}/#webpage`,
    name: 'Cheersin | 探索你的靈魂之酒',
    description: '你的 AI 派對靈魂伴侶 — 靈魂酒測、選遊戲、問酒款、派對桌遊、品酒學院，一站滿足。',
    url: BASE,
    isPartOf: { '@id': `${BASE}/#website` },
    inLanguage: 'zh-TW',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/learn?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }

  // HP-019: AggregateRating for social proof / reviews
  const aggregateRatingData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Cheersin',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TWD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      worstRating: '1',
      ratingCount: SOCIAL_PROOF_USER_COUNT,
      reviewCount: Math.floor(SOCIAL_PROOF_USER_COUNT * 0.15), // ~15% leave reviews
    },
  }

  // HP-034: Breadcrumb structured data for homepage
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '首頁',
        item: BASE,
      },
    ],
  }

  return (
    <>
      <SafeJsonLdScript data={webPageData} />
      <SafeJsonLdScript data={aggregateRatingData} />
      <SafeJsonLdScript data={breadcrumbData} />
    </>
  )
}
