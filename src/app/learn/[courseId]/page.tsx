/**
 * 151 動態課程頁：依 courseId 顯示章節與內容；153-154 進度寫入 cheersin_learn_progress；143 Pro 試用閘門
 * generateStaticParams 預渲染課程頁；revalidate 3600 實現 ISR
 * 任務 6：非首屏以 dynamic 載入，減少初始 bundle
 */
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getCourse, getCourseIds } from '@/lib/courses'
import ErrorBoundaryBlock from '@/components/ErrorBoundaryBlock'
import type { Metadata } from 'next'

const CoursePageClient = dynamic(
  () => import('@/components/learn/CoursePageClient').then((m) => ({ default: m.CoursePageClient })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-white/60 animate-pulse">載入課程中…</p>
      </div>
    ),
    ssr: true,
  }
)

/** ISR：每小時重新驗證課程內容 */
export const revalidate = 3600

interface PageProps {
  params: Promise<{ courseId: string }>
}

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

/** 預渲染所有課程頁面 */
export async function generateStaticParams() {
  const ids = getCourseIds()
  return ids.map((courseId) => ({ courseId }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params
  const course = getCourse(courseId)
  if (!course) return { title: '課程 | Cheersin' }
  return {
    title: `${course.title} | Cheersin 品酒學院`,
    description: course.description,
    alternates: { canonical: `${BASE}/learn/${courseId}` },
    openGraph: {
      title: `${course.title} | Cheersin`,
      description: course.description,
      url: `${BASE}/learn/${courseId}`,
    },
  }
}

/** 任務 78：課程頁 BreadcrumbList JSON-LD — 首頁 > 品酒學院 > 課程標題 */
function CourseBreadcrumbJsonLd({ courseId, title }: { courseId: string; title: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: BASE },
      { '@type': 'ListItem', position: 2, name: '品酒學院', item: `${BASE}/learn` },
      { '@type': 'ListItem', position: 3, name: title, item: `${BASE}/learn/${courseId}` },
    ],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

export default async function CoursePage({ params }: PageProps) {
  const { courseId } = await params
  const course = getCourse(courseId)
  if (!course) notFound()

  /* L70：課程內頁 ErrorBoundary 包章節區，防止單一章節錯誤導致全頁崩潰 */
  return (
    <>
      <CourseBreadcrumbJsonLd courseId={courseId} title={course.title} />
      <ErrorBoundaryBlock blockName="課程內容">
        <CoursePageClient
        courseId={courseId}
        free={course.free}
        title={course.title}
        description={course.description}
        duration={course.duration}
        chapters={course.chapters}
      />
      </ErrorBoundaryBlock>
    </>
  )
}
