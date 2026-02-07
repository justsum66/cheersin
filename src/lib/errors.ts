/**
 * G196 自定義錯誤類
 * 便於區分錯誤類型與 i18n
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
