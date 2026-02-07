/**
 * H98：首頁結構化資料 WebPage JsonLd，供搜尋引擎
 * layout 已有 Organization + WebSite；本頁補充 WebPage
 */
const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

export function HomePageJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${BASE}/#webpage`,
    name: 'Cheersin | 探索你的靈魂之酒',
    description: '成人品酒與派對遊戲平台：靈魂酒測、AI 侍酒師、派對桌遊、品酒學院，一站滿足。',
    url: BASE,
    isPartOf: { '@id': `${BASE}/#website` },
    inLanguage: 'zh-TW',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/learn?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
