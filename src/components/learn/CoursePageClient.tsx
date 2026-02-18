'use client'

import { useState, useEffect } from 'react';
import { CourseProTrialGate } from '@/components/CourseProTrialGate'
import { LazyLessonContent } from './LazyLessonContent'
import { CourseDiscussions } from './ui/CourseDiscussions'
import type { Chapter } from '@/lib/courses'

interface CoursePageClientProps {
  courseId: string
  free: boolean
  title: string
  description: string
  learningObjectives?: string[]
  duration: string
  chapters: Chapter[]
}

export function CoursePageClient({ courseId, free, title, description, learningObjectives, duration, chapters }: CoursePageClientProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Implement lazy loading strategy - defer rendering until component is needed
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 100); // Small delay to allow initial render of critical content

    return () => clearTimeout(timer);
  }, []);

  return (
    <CourseProTrialGate courseId={courseId} free={free}>
      {shouldRender ? (
        <LazyLessonContent
          courseId={courseId}
          title={title}
          description={description}
          learningObjectives={learningObjectives}
          duration={duration}
          free={free}
          chapters={chapters}
        />
      ) : (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-400 rounded-full animate-spin"></div>
          <span className="ml-2 text-white/60">載入課程中...</span>
        </div>
      )}
      <CourseDiscussions courseId={courseId} />
    </CourseProTrialGate>
  )
}
