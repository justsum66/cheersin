// Main barrel export for learn components
// This file provides backward compatibility for existing imports

// Main course content component
export { LearnCourseContent } from './LearnCourseContent'
export type { Chapter, ChapterQuizItem } from './LearnCourseContent'

// Page wrapper
export { CoursePageClient } from './CoursePageClient'

// UI components
export * from './ui'

// Interactive maps
export * from './maps'

// Data components (glossaries, examples, databases, guides)
export * from './data'

// Section components
export * from './sections'

// Hooks (will be populated as hooks are extracted)
export * from './hooks'
