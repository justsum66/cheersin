'use client';

import React, { Suspense } from 'react';
import { LoadingSpinner } from '@/config/loading.config';

const LazyCourseList = React.lazy(() => import('./CourseList').then(mod => ({ default: mod.CourseList })));

export default function CourseListLoader() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><LoadingSpinner /></div>}>
      <LazyCourseList />
    </Suspense>
  );
}