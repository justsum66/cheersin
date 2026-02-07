/**
 * Toast 統一配置
 * 定義所有 toast 的樣式、持續時間與行為
 */

import type { ToastOptions } from 'react-hot-toast'

/**
 * 預設 Toast 配置
 */
export const DEFAULT_TOAST_OPTIONS: ToastOptions = {
  duration: 3000,
  position: 'bottom-center',
  style: {
    background: 'rgba(10, 10, 15, 0.95)',
    color: '#fff',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    padding: '12px 16px',
    fontSize: '14px',
    maxWidth: '90vw',
  },
  // 無障礙設定
  ariaProps: {
    role: 'status',
    'aria-live': 'polite',
  },
}

/**
 * 成功 Toast 配置
 */
export const SUCCESS_TOAST_OPTIONS: ToastOptions = {
  ...DEFAULT_TOAST_OPTIONS,
  duration: 3000,
  icon: '✅',
  style: {
    ...DEFAULT_TOAST_OPTIONS.style,
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
}

/**
 * 錯誤 Toast 配置
 */
export const ERROR_TOAST_OPTIONS: ToastOptions = {
  ...DEFAULT_TOAST_OPTIONS,
  duration: 4000,
  icon: '❌',
  style: {
    ...DEFAULT_TOAST_OPTIONS.style,
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
}

/**
 * 載入中 Toast 配置
 */
export const LOADING_TOAST_OPTIONS: ToastOptions = {
  ...DEFAULT_TOAST_OPTIONS,
  duration: Infinity,
  icon: '⏳',
}

/**
 * 警告 Toast 配置
 */
export const WARNING_TOAST_OPTIONS: ToastOptions = {
  ...DEFAULT_TOAST_OPTIONS,
  duration: 3500,
  icon: '⚠️',
  style: {
    ...DEFAULT_TOAST_OPTIONS.style,
    border: '1px solid rgba(251, 191, 36, 0.3)',
  },
}

/**
 * 資訊 Toast 配置
 */
export const INFO_TOAST_OPTIONS: ToastOptions = {
  ...DEFAULT_TOAST_OPTIONS,
  duration: 3000,
  icon: 'ℹ️',
  style: {
    ...DEFAULT_TOAST_OPTIONS.style,
    border: '1px solid rgba(59, 130, 246, 0.3)',
  },
}

/**
 * Toast 常用訊息
 */
export const TOAST_MESSAGES = {
  // 通用
  SUCCESS: '操作成功',
  ERROR: '操作失敗，請稍後再試',
  LOADING: '處理中...',
  
  // 複製
  COPY_SUCCESS: '已複製到剪貼簿',
  COPY_ERROR: '複製失敗',
  
  // 儲存
  SAVE_SUCCESS: '儲存成功',
  SAVE_ERROR: '儲存失敗',
  
  // 刪除
  DELETE_SUCCESS: '刪除成功',
  DELETE_ERROR: '刪除失敗',
  DELETE_CONFIRM: '確定要刪除嗎？',
  
  // 登入/註冊
  LOGIN_SUCCESS: '登入成功',
  LOGIN_ERROR: '登入失敗',
  LOGOUT_SUCCESS: '已登出',
  SIGNUP_SUCCESS: '註冊成功',
  SIGNUP_ERROR: '註冊失敗',
  
  // 網路
  NETWORK_ERROR: '網路連線異常',
  TIMEOUT_ERROR: '請求逾時，請稍後再試',
  
  // 權限
  PERMISSION_DENIED: '權限不足',
  SUBSCRIPTION_REQUIRED: '此功能需要升級訂閱',
  
  // 表單
  FORM_VALIDATION_ERROR: '請檢查表單內容',
  REQUIRED_FIELD: '請填寫必填欄位',
  
  // 願望清單
  WISHLIST_ADD_SUCCESS: '已加入願望清單',
  WISHLIST_REMOVE_SUCCESS: '已從願望清單移除',
  WISHLIST_ADD_ERROR: '加入願望清單失敗',
  
  // AI 對話
  AI_CHAT_ERROR: 'AI 回應失敗，請稍後再試',
  AI_RATE_LIMIT: '今日額度已用完，請升級或明天再試',
  
  // 遊戲
  GAME_START: '遊戲開始！',
  GAME_END: '遊戲結束',
  ROOM_CREATED: '房間已建立',
  ROOM_JOINED: '已加入房間',
  ROOM_LEFT: '已離開房間',
} as const

/**
 * Toast 訊息快捷導出（向後兼容）
 */
export const TOAST_COPY_SUCCESS = TOAST_MESSAGES.COPY_SUCCESS
export const TOAST_COPY_ERROR = TOAST_MESSAGES.COPY_ERROR

/**
 * Toast 持續時間配置
 */
export const TOAST_DURATION_DEFAULT = 3000
export const TOAST_DURATION_SUCCESS = 3000
export const TOAST_DURATION_ERROR = 4000
