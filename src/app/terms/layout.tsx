import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

export const metadata: Metadata = {
  title: '服務條款 | Cheersin',
  description: 'Cheersin 服務條款：使用規範、訂閱與取消、退款政策、免責聲明與爭議解決。',
  alternates: { canonical: `${BASE}/terms` },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
