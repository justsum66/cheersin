// LearnCourseContent.ts - 定義學習課程相關的類型

export interface Chapter {
  id: number;
  title: string;
  description: string;
  duration: string;
  content: string;
  quizzes: ChapterQuizItem[];
  order: number;
  isCompleted?: boolean;
  isLocked?: boolean;
}

export interface ChapterQuizItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  correctIndex: number;
  explanation: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  isCompleted?: boolean;
}

export interface CourseProgress {
  courseId: string;
  chapterId: string;
  completedQuizzes: string[];
  notes: string[];
  lastAccessed: Date;
}