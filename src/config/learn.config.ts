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

/** LEARN-031：課程版本號（手動維護，日後可從 CMS 取得） */
export const COURSE_VERSIONS: Record<string, string> = {
  'wine-basics': '2.1',
  'white-wine': '1.3',
  'whisky-101': '2.0',
  'sake-intro': '1.2',
  'craft-beer': '1.1',
  'cocktail-basics': '1.4',
  'champagne-sparkling': '1.1',
  'rum-basics': '1.0',
  'gin-basics': '1.0',
  'tequila-mezcal': '1.0',
  'wine-advanced': '1.5',
  'brandy-cognac': '1.0',
  'cocktail-classics': '1.2',
  'wine-pairing': '1.3',
  'sake-advanced': '1.1',
  'whisky-single-malt': '1.2',
  'natural-wine': '1.0',
  'low-abv': '1.0',
  'tasting-notes': '1.3',
  'home-bar': '1.1',
}

/** LEARN-034：課程作者 / 貢獻者資訊 */
export interface CourseAuthor {
  name: string
  role: string
  credential?: string
}

export const COURSE_AUTHORS: Record<string, CourseAuthor[]> = {
  'wine-basics': [
    { name: 'Cheersin 編輯部', role: '主編', credential: 'WSET L3' },
  ],
  'whisky-101': [
    { name: 'Cheersin 編輯部', role: '主編', credential: 'WSET L2 Spirits' },
  ],
  'cocktail-basics': [
    { name: 'Cheersin 編輯部', role: '主編' },
  ],
  'wine-advanced': [
    { name: 'Cheersin 編輯部', role: '主編', credential: 'WSET L3' },
  ],
  'sake-intro': [
    { name: 'Cheersin 編輯部', role: '主編', credential: 'SSI 唎酒師' },
  ],
}

/** LEARN-037：跨課程詞彙庫 localStorage 鍵名 */
export const LEARN_VOCABULARY_KEY = 'cheersin_learn_vocabulary'

/** LEARN-041：學習分析 localStorage 鍵名 */
export const LEARN_ANALYTICS_KEY = 'cheersin_learn_analytics'

/** LEARN-049：學習 XP localStorage 鍵名 */
export const LEARN_XP_KEY = 'cheersin_learn_xp'

/** LEARN-050：課程評分 localStorage 鍵名 */
export const LEARN_USER_RATINGS_KEY = 'cheersin_learn_user_ratings'
