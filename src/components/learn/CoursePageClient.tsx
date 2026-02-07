'use client'

import { CourseProTrialGate } from '@/components/CourseProTrialGate'
import { LearnCourseContent } from '@/components/learn/LearnCourseContent'
import type { Chapter } from '@/lib/courses'

/** 直接 import 避免 webpack requireModule/call chunk 載入錯誤 */

interface CoursePageClientProps {
  courseId: string
  free: boolean
  title: string
  description: string
  duration: string
  chapters: Chapter[]
}

export function CoursePageClient({ courseId, free, title, description, duration, chapters }: CoursePageClientProps) {
  return (
    <CourseProTrialGate courseId={courseId} free={free}>
      <LearnCourseContent
        courseId={courseId}
        title={title}
        description={description}
        duration={duration}
        free={free}
        chapters={chapters}
      />
    </CourseProTrialGate>
  )
}
