/**
 * UX_LAYOUT_200 #163 #164：伺服器錯誤與限流/429 友善文案 — 單一來源供 API/前端使用
 * 任務 91：品牌聲調與錯誤文案 — 友善、簡短、不責怪用戶；ErrorFallback / EmptyState / 表單共用
 */

/** 伺服器錯誤（5xx）使用者可見文案 */
export const ERROR_SERVER_MESSAGE = '服務暫時無法處理您的請求，請稍後再試。若持續發生，請聯絡我們。'

/** 限流/429 使用者可見文案（可含 Retry-After 提示） */
export const ERROR_RATE_LIMIT_MESSAGE = '操作過於頻繁，請稍後再試。'

/** UX_LAYOUT_200 #100：網路錯誤時重試提示 */
export const ERROR_NETWORK_RETRY_MESSAGE = '網路連線異常，請檢查網路後再試一次。'

/** 任務 91：錯誤邊界 fallback 主標 — 友善、不責怪 */
export const ERROR_FALLBACK_TITLE = '載入時發生錯誤'

/** 頁級錯誤：測驗／學院專用主標與說明（DEDUP #7 統一錯誤版面） */
export const ERROR_PAGE_QUIZ_TITLE = '測驗載入失敗'
export const ERROR_PAGE_QUIZ_DESCRIPTION = '靈魂酒測暫時無法載入，請重試或返回首頁。'
export const ERROR_PAGE_LEARN_TITLE = '載入失敗'
export const ERROR_PAGE_LEARN_DESCRIPTION = '品酒學院暫時無法載入，請重試或返回首頁。'
export const ERROR_PAGE_GENERIC_TITLE = '出了點問題'
export const ERROR_PAGE_GENERIC_DESCRIPTION = '頁面暫時無法載入，請重新整理或從首頁開始。'

/** 任務 91：空狀態預設主標 — 目前沒有資料 */
export const EMPTY_STATE_NO_DATA_TITLE = '目前沒有資料'

/** 任務 91：空狀態預設說明 — 可選下一步 */
export const EMPTY_STATE_NO_DATA_DESCRIPTION = '稍後再試或返回首頁。'

/** UX_LAYOUT_200 #162：過期或錯誤 session 登出提示 */
export const SESSION_EXPIRED_MESSAGE = '登入已過期，請重新登入以繼續使用。'

/** 任務 66：API 錯誤碼對應友善文案；503 服務忙碌、500 通用錯誤 */
export const ERROR_503_MESSAGE = '服務忙碌中，請稍後再試。'
export const ERROR_500_MESSAGE = '發生錯誤，請稍後再試。'

/** 任務 91：表單通用錯誤區塊標題 — 請檢查以下欄位（不責怪） */
export const ERROR_FORM_HEADING = '請檢查以下欄位'

/** 任務 86：密碼強度指示（若有註冊/重設密碼頁）— 弱/中/強文案，不強制 */
export const PASSWORD_STRENGTH_WEAK = '弱'
export const PASSWORD_STRENGTH_MEDIUM = '中'
export const PASSWORD_STRENGTH_STRONG = '強'

/** 依 status 取得使用者可見錯誤文案 */
export function getUserErrorMessage(status: number, retryAfter?: number): string {
  if (status === 429) {
    if (retryAfter != null && retryAfter > 0) {
      return `操作過於頻繁，請約 ${retryAfter} 秒後再試。`
    }
    return ERROR_RATE_LIMIT_MESSAGE
  }
  if (status === 503) return ERROR_503_MESSAGE
  if (status >= 500) return ERROR_500_MESSAGE
  return ERROR_SERVER_MESSAGE
}
