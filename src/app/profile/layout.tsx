import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

/** 10 專家審查：個人主頁 metadata */
export const metadata: Metadata = {
  title: '個人主頁 | Cheersin',
  description: '查看你的品酒檔案、測驗結果與學習進度。',
  alternates: { canonical: `${BASE}/profile` },
  openGraph: {
    title: '個人主頁 | Cheersin',
    description: '品酒檔案與學習進度',
    url: `${BASE}/profile`,
  },
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
