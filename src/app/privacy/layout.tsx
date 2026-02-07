import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

export const metadata: Metadata = {
  title: '隱私政策 | Cheersin',
  description: 'Cheersin 隱私政策：資料收集、使用與保護，以及不向未成年行銷之承諾。',
  alternates: { canonical: `${BASE}/privacy` },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
