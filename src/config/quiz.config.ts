/**
 * Quiz 頁 20 項優化 #1 #2 #18：Intro 文案與時間可配置、儲存鍵與常數集中
 * 便於 A/B、在地化與維護
 */

/** Intro 區塊文案 */
export const QUIZ_INTRO = {
  title: '靈魂酒測',
  titleHighlight: '酒測',
  subtitle: '約 30 秒測出你的命定酒款，結合星座與感官偏好。',
  /** 完成時間說明（輔助／aria-hidden） */
  timeNote: '完成時間依作答速度約 20–40 秒',
  disclaimer: '隨時可離開，結果僅供參考',
  ctaLabel: '開始檢測',
  ctaAriaLabel: '開始靈魂酒測',
} as const

/** localStorage 鍵名 */
export const QUIZ_STORAGE_KEY = 'quiz-progress'
export const QUIZ_LAST_RESULT_KEY = 'quiz-last-result'
export const QUIZ_HISTORY_KEY = 'cheersin_quiz_history'

/** 測驗歷史最多保留筆數 */
export const QUIZ_HISTORY_MAX = 20
