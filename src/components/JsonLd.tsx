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
        description: '你的 AI 派對靈魂伴侶 — 靈魂酒測、選遊戲、問酒款、派對遊戲。',
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE}/#website`,
        name: 'Cheersin 乾杯',
        url: BASE,
        description: '你的 AI 派對靈魂伴侶 — 測驗發現命定酒款，AI 幫你選遊戲與問酒，享受派對。',
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
