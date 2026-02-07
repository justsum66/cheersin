import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

/** 10 專家審查：登入頁 metadata */
export const metadata: Metadata = {
  title: '登入 | Cheersin',
  description: '登入以繼續你的品酒之旅，存取測驗結果與學習進度。',
  alternates: { canonical: `${BASE}/login` },
  openGraph: {
    title: '登入 | Cheersin',
    url: `${BASE}/login`,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
