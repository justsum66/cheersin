/**
 * Quiz 頁 20 項優化 #7：靈魂酒測頁結構化資料 WebPage + Quiz，供 SEO 與預覽
 * SEC-006：使用 SafeJsonLdScript
 */
import { SafeJsonLdScript } from '@/components/SafeJsonLdScript'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

export function QuizPageJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${BASE}/quiz#webpage`,
        name: '靈魂酒測 | Cheersin — 30 秒測出你的命定酒款',
        description: '品酒測驗：30 秒結合星座與感官偏好，取得個人化酒款分析與推薦。',
        url: `${BASE}/quiz`,
        isPartOf: { '@id': `${BASE}/#website` },
        inLanguage: 'zh-TW',
      },
      {
        '@type': 'Quiz',
        name: '靈魂酒測',
        description: '約 30 秒測出你的命定酒款，結合星座與感官偏好。',
        numberOfQuestions: 18,
      },
    ],
  }
  return <SafeJsonLdScript data={data} />
}
