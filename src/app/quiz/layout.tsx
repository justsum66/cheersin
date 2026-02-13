import './quiz.css'
import type { Metadata } from 'next'
import ErrorBoundaryBlock from '@/components/ErrorBoundaryBlock'
import { QuizPageJsonLd } from '@/components/quiz/QuizPageJsonLd'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

/** E50：關鍵頁 meta title/description 優化 — 含品酒、酒關鍵字 */
export const metadata: Metadata = {
  title: '靈魂酒測 | Cheersin — 30 秒測出你的命定酒款',
  description: '品酒測驗：30 秒結合星座與感官偏好，取得個人化酒款分析與推薦。葡萄酒、威士忌、清酒、派對遊戲一站滿足。',
  keywords: ['靈魂酒測', '品酒測驗', '命定酒款', '葡萄酒推薦', 'Cheersin'],
  alternates: { canonical: `${BASE}/quiz` },
  openGraph: {
    title: '靈魂酒測 | Cheersin — 品酒測驗',
    description: '30 秒發現你的靈魂之酒',
    url: `${BASE}/quiz`,
  },
}

/** Quiz 頁 20 項優化 #9：Error Boundary 包覆，避免單點錯誤導致整頁白屏 */
export default function QuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <QuizPageJsonLd />
      <ErrorBoundaryBlock blockName="靈魂酒測">
        {children}
      </ErrorBoundaryBlock>
    </>
  )
}
