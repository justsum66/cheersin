import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

/** 10 專家審查：訂閱頁 metadata（子頁 success/cancel 可各自覆寫） */
export const metadata: Metadata = {
  title: '訂閱 | Cheersin',
  description: '升級品酒體驗，解鎖 AI 侍酒師、進階課程與專屬活動。',
  alternates: { canonical: `${BASE}/subscription` },
  openGraph: {
    title: '訂閱 | Cheersin',
    url: `${BASE}/subscription`,
  },
}

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
