/**
 * 195 JSON-LD 結構化資料：Organization + WebSite，供搜尋引擎
 */
const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

export function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${BASE}/#organization`,
        name: 'Cheersin',
        url: BASE,
        description: '探索你的靈魂之酒，品酒測驗、AI 侍酒師與派對遊戲。',
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE}/#website`,
        name: 'Cheersin 乾杯',
        url: BASE,
        description: '透過有趣的測驗發現最適合你的酒款，與 AI 侍酒師互動，享受派對遊戲。',
        publisher: { '@id': `${BASE}/#organization` },
        inLanguage: 'zh-TW',
      },
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
