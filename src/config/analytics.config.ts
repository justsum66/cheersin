/**
 * Analytics 統一配置
 * 定義所有 analytics 事件類型與屬性
 */

export interface AnalyticsEvent {
  event: string
  properties?: Record<string, unknown>
}

/**
 * 頁面瀏覽事件
 */
export const PAGE_VIEW = (page: string): AnalyticsEvent => ({
  event: 'page_view',
  properties: { page, timestamp: Date.now() }
})

/**
 * 用戶註冊事件
 */
export const USER_SIGNUP = (method: string): AnalyticsEvent => ({
  event: 'user_signup',
  properties: { method, timestamp: Date.now() }
})

/**
 * 用戶登入事件
 */
export const USER_LOGIN = (method: string): AnalyticsEvent => ({
  event: 'user_login',
  properties: { method, timestamp: Date.now() }
})

/**
 * 訂閱升級事件
 */
export const SUBSCRIPTION_UPGRADE = (tier: string, plan: string): AnalyticsEvent => ({
  event: 'subscription_upgrade',
  properties: { tier, plan, timestamp: Date.now() }
})

/**
 * 測驗完成事件
 */
export const QUIZ_COMPLETE = (quizId: string, score: number): AnalyticsEvent => ({
  event: 'quiz_complete',
  properties: { quiz_id: quizId, score, timestamp: Date.now() }
})

/**
 * AI 對話事件
 */
export const AI_CHAT_MESSAGE = (messageLength: number, responseTime: number): AnalyticsEvent => ({
  event: 'ai_chat_message',
  properties: { message_length: messageLength, response_time_ms: responseTime, timestamp: Date.now() }
})

/**
 * 酒款搜尋事件
 */
export const WINE_SEARCH = (query: string, resultCount: number): AnalyticsEvent => ({
  event: 'wine_search',
  properties: { query: query.slice(0, 100), result_count: resultCount, timestamp: Date.now() }
})

/**
 * 酒款查看事件
 */
export const WINE_VIEW = (wineId: string, wineName: string): AnalyticsEvent => ({
  event: 'wine_view',
  properties: { wine_id: wineId, wine_name: wineName, timestamp: Date.now() }
})

/**
 * 願望清單新增事件
 */
export const WISHLIST_ADD = (wineId: string): AnalyticsEvent => ({
  event: 'wishlist_add',
  properties: { wine_id: wineId, timestamp: Date.now() }
})

/**
 * 購買連結點擊事件
 */
export const BUY_LINK_CLICK = (wineId: string, source: string): AnalyticsEvent => ({
  event: 'buy_link_click',
  properties: { wine_id: wineId, source, timestamp: Date.now() }
})

/**
 * 分享事件
 */
export const SHARE = (contentType: string, method: string): AnalyticsEvent => ({
  event: 'share',
  properties: { content_type: contentType, method, timestamp: Date.now() }
})

/**
 * 錯誤事件
 */
export const ERROR = (errorCode: string, errorMessage: string, context?: string): AnalyticsEvent => ({
  event: 'error',
  properties: { 
    error_code: errorCode, 
    error_message: errorMessage.slice(0, 200),
    context,
    timestamp: Date.now() 
  }
})

/**
 * 發送 analytics 事件（統一入口）
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return
  
  try {
    // 可以在這裡整合多個 analytics 服務
    // 例如：Google Analytics, Mixpanel, Amplitude 等
    
    // 發送到後端 API
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(() => {
      // 忽略錯誤，不阻塞用戶體驗
    })

    // 也可以發送到 Google Analytics（如果已設定）
    if (window.gtag) {
      window.gtag('event', event.event, event.properties)
    }
  } catch {
    // 忽略錯誤
  }
}

/**
 * 需持久化到資料庫的事件名稱集合
 * 用於 API route 判斷哪些事件需寫入 Supabase
 */
/** ANA.1：遊戲事件納入持久化 */
const PERSIST_EVENT_NAMES = new Set([
  'user_signup',
  'user_login',
  'subscription_upgrade',
  'quiz_complete',
  'wine_search',
  'wine_view',
  'buy_link_click',
  'share',
  'game_start',
  'game_end',
  'game_round',
  'game_rounds',
  'room_create',
  'room_join',
  'room_leave',
  'party_room_create',
  'party_room_join',
  'party_room_cheers',
  'party_room_select_game',
  /** AST-47：助理每輪結束（訊息數、vision/text/error） */
  'assistant_turn',
])

/**
 * 取得需持久化的事件名稱集合
 */
export function getPersistEventNames(): Set<string> {
  return PERSIST_EVENT_NAMES
}

// 擴展 Window 型別以支援 gtag
declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void
  }
}
