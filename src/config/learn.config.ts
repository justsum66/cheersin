/**
 * 品酒學院通用配置
 * 包含：進度儲存鍵、測驗門檻、常量等
 */

/** 課程進度 localStorage 鍵名 */
export const LEARN_PROGRESS_KEY = 'cheersin_learn_progress'

/** 章節測驗通過紀錄 localStorage 鍵名；key: courseId -> chapterId -> true */
export const LEARN_QUIZ_PASSED_KEY = 'cheersin_learn_quiz_passed'

/** R2-377：章節測驗通過門檻為 80%（至少 ceil(length*0.8) 題正確） */
export const CHAPTER_QUIZ_PASS_THRESHOLD = 0.8
