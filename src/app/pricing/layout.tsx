import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

/** 194 每頁 SEO meta；198 canonical；EXPERT_60 P2：關鍵字與 OG */
export const metadata: Metadata = {
  title: '方案與定價 | Cheersin',
  description: '免費探索者、品鑑家、大師級方案，依需求解鎖 AI 侍酒師、進階課程與專屬活動。',
  keywords: ['Cheersin 定價', '品酒方案', 'AI 侍酒師訂閱', 'Pro 方案', '免費試用'],
  alternates: { canonical: `${BASE}/pricing` },
  openGraph: {
    title: '方案與定價 | Cheersin',
    description: '免費與 Pro 方案，依需求選擇。隨時取消、安全付款。',
    url: `${BASE}/pricing`,
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
