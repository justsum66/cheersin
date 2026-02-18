'use client';

import { Suspense, lazy } from 'react';
import { LoadingSpinner } from '@/config/loading.config';

const LazyLearnCourseContent = lazy(() => import('./LearnCourseContent').then(module => ({ default: module.LearnCourseContent })));

interface LazyLessonContentProps {
  courseId: string;
  title: string;
  description: string;
  learningObjectives?: string[];
  duration: string;
  free: boolean;
  chapters: any[]; // Using any for now as we don't have the exact type
}

export function LazyLessonContent({
  courseId,
  title,
  description,
  learningObjectives,
  duration,
  free,
  chapters
}: LazyLessonContentProps) {
  return (
    <Suspense 
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <LoadingSpinner className="w-8 h-8 text-primary-500" />
          <span className="ml-2 text-white/60">載入課程中...</span>
        </div>
      }
    >
      <LazyLearnCourseContent
        courseId={courseId}
        title={title}
        description={description}
        learningObjectives={learningObjectives}
        duration={duration}
        free={free}
        chapters={chapters}
      />
    </Suspense>
  );
}