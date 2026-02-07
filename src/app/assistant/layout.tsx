import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

/** 194 每頁 SEO meta；198 canonical */
export const metadata: Metadata = {
  title: 'AI 侍酒師 | Cheersin',
  description: '與 AI 侍酒師對話，獲得餐酒搭配、酒款推薦與品酒知識。隨時問、即時答。',
  alternates: { canonical: `${BASE}/assistant` },
  openGraph: {
    title: 'AI 侍酒師 | Cheersin',
    description: '隨時問酒、即時推薦',
    url: `${BASE}/assistant`,
  },
}

export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
