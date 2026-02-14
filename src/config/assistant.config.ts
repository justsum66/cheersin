/**
 * AST-31：Assistant 頁常數集中
 * 供 app/assistant/page、hooks、組件共用
 */

/** 133 對話歷史 localStorage key */
export const CHAT_HISTORY_KEY = 'cheersin_assistant_history'

/** 歷史訊息保留筆數（寫入時 slice(-N)） */
export const MAX_HISTORY_MESSAGES = 100

/** B1 Task 42：送 API 的上下文訊息上限，避免 token 爆掉 */
export const MAX_CONTEXT_MESSAGES = 32

/** 客戶端請求逾時（ms），逾時後 abort；與 API 端一致，由 NEXT_PUBLIC_CHAT_TIMEOUT_MS 注入，預設 30000 */
export const CHAT_TIMEOUT_MS = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_CHAT_TIMEOUT_MS
  ? parseInt(process.env.NEXT_PUBLIC_CHAT_TIMEOUT_MS, 10) || 30000
  : 30000

/** AST-04：儲存歷史防抖間隔（ms） */
export const HISTORY_SAVE_DEBOUNCE_MS = 1200

/** 輸入框字數上限（與 API MAX_USER_MESSAGE_LENGTH 對齊） */
export const MAX_INPUT_LENGTH = 2000

/** B1-46 圖片上傳 base64 大小上限（MB），與 Groq Vision 一致 */
export const MAX_IMAGE_MB = 4

/** 136 靈魂酒測結果 localStorage key */
export const QUIZ_RESULT_KEY = 'quiz-last-result'

/** 139 口味偏好 localStorage key */
export const TASTE_PREFERENCES_KEY = 'cheersin_taste_preferences'

/** 142 願望清單 localStorage key（與 profile 一致） */
export const WISHLIST_KEY = 'cheersin_wishlist'

/** 反饋記錄 localStorage key；保留筆數 */
export const FEEDBACK_STORAGE_KEY = 'cheersin_assistant_feedback'
export const MAX_FEEDBACK_ENTRIES = 100

/** AST-38：前端連續送出節流（ms），避免誤觸或腳本 */
export const SEND_THROTTLE_MS = 2000

/** AST-07：串流 delta 更新節流（ms），降低 React 重繪次數 */
export const STREAM_THROTTLE_MS = 80

/** AST-01：訊息數超過此值時啟用列表虛擬化（僅渲染可見區） */
export const VIRTUALIZE_MESSAGES_THRESHOLD = 30

/** AST-01：虛擬列表單一項目預估高度（px），用於 VariableSizeList */
export const VIRTUAL_MESSAGE_ESTIMATED_HEIGHT = 180
