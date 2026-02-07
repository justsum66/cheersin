import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

/** GAMES_500 #33：遊戲頁內嵌時需考量 X-Frame-Options 或 CSP frame-ancestors；若需允許被嵌入可於 middleware/headers 設 X-Frame-Options: ALLOWALL 或 Content-Security-Policy frame-ancestors。 */

/** GAMES_500 #1 #2 #32：預設 metadata 與 OG、canonical 一致；robots 允許索引 */
export const metadata: Metadata = {
  title: '派對遊樂場 | Cheersin — 你的 AI 派對靈魂伴侶',
  description: '你的 AI 派對靈魂伴侶：真心話大冒險、國王杯、轉盤、骰子等，多人同樂。懲罰可自訂、不飲酒也能玩。',
  keywords: ['AI 派對靈魂伴侶', '派對遊戲', '酒桌遊戲', '真心話', '國王杯', 'Cheersin'],
  alternates: { canonical: `${BASE}/games` },
  robots: { index: true, follow: true },
  openGraph: {
    title: '派對遊樂場 | Cheersin — 你的 AI 派對靈魂伴侶',
    description: '你的 AI 派對靈魂伴侶，多人同樂。懲罰可自訂、不飲酒也能玩。',
    url: `${BASE}/games`,
    images: [{ url: `${BASE}/icons/icon-512.png`, width: 512, height: 512, alt: 'Cheersin 派對遊樂場' }],
  },
}

/** GAMES_500 #5：結構化 breadcrumb（JSON-LD）供搜尋與無障礙 */
function GamesBreadcrumbJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: BASE },
      { '@type': 'ListItem', position: 2, name: '派對遊樂場', item: `${BASE}/games` },
    ],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

/** P1-065：遊戲頁 VideoGame 結構化數據 — 供搜尋引擎富媒體 */
function GamesVideoGameJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '派對遊樂場 | Cheersin',
    description: '真心話大冒險、國王杯、轉盤等酒桌派對遊戲。',
    url: `${BASE}/games`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        { '@type': 'VideoGame', name: '真心話大冒險' },
        { '@type': 'VideoGame', name: '國王杯' },
        { '@type': 'VideoGame', name: '我從來沒有' },
      ],
    },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

/** GAMES_500 #12：無 JS 時靜態 fallback 文案 */
function GamesNoscriptFallback() {
  return (
    <noscript>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a1a] p-6 text-center">
        <p className="text-white/90 text-lg">請啟用 JavaScript 以使用派對遊樂場。</p>
      </div>
    </noscript>
  )
}

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GamesBreadcrumbJsonLd />
      <GamesVideoGameJsonLd />
      <GamesNoscriptFallback />
      {children}
    </>
  )
}
