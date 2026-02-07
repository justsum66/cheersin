import { ImageResponse } from 'next/og'
import { getCourse } from '@/lib/courses'

/** 199 課程頁 OG 圖：依 courseId 顯示課程標題 */
export const alt = '課程 | Cheersin 酒類學堂'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ courseId: string }>
}

export default async function LearnCourseOpenGraphImage({ params }: Props) {
  const { courseId } = await params
  const course = getCourse(courseId)
  const title = course?.title ?? '課程'
  const description = course?.description ?? 'Cheersin 酒類學堂'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          padding: 48,
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 16, textAlign: 'center' }}>{title}</div>
        <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: 900 }}>
          {description}
        </div>
        <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)', marginTop: 24 }}>Cheersin 酒類學堂</div>
      </div>
    ),
    { ...size }
  )
}
