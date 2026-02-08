/**
 * G196 自定義錯誤類
 * P2-322：區分用戶錯誤 (4xx) 與系統錯誤 (5xx)，便於處理與告警
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }

  /** 是否為用戶端錯誤 (4xx)，不需系統告警 */
  get isClientError(): boolean {
    const s = this.statusCode ?? 0
    return s >= 400 && s < 500
  }

  /** 是否為伺服器端錯誤 (5xx)，需記錄與告警 */
  get isServerError(): boolean {
    const s = this.statusCode ?? 0
    return s >= 500
  }
}

export class NetworkError extends AppError {
  constructor(message = '網路連線異常，請稍後再試') {
    super(message, 'NETWORK_ERROR', 0)
    this.name = 'NetworkError'
  }
}

export class AuthError extends AppError {
  constructor(message = '登入已過期，請重新登入', code = 'AUTH_ERROR') {
    super(message, code, 401)
    this.name = 'AuthError'
  }
}

export class RateLimitError extends AppError {
  constructor(message = '請求過於頻繁，請稍後再試') {
    super(message, 'RATE_LIMIT', 429)
    this.name = 'RateLimitError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(message, code, 400)
    this.name = 'ValidationError'
  }
}

/** P2-322：系統錯誤 (5xx)，用於後端邏輯錯誤、依賴失敗等，需告警 */
export class ServerError extends AppError {
  constructor(message: string, code = 'SERVER_ERROR', statusCode = 500) {
    super(message, code, statusCode)
    this.name = 'ServerError'
  }
}

/** 依 statusCode 判斷是否為 4xx（用戶錯誤） */
export function isClientError(statusCode: number): boolean {
  return statusCode >= 400 && statusCode < 500
}

/** 依 statusCode 判斷是否為 5xx（系統錯誤） */
export function isServerError(statusCode: number): boolean {
  return statusCode >= 500
}
