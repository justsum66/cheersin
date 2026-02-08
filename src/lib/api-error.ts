/**
 * R2-019：統一 API 錯誤處理
 * AppError 類別與 handleApiError 輔助，供 API route 統一 try-catch 模式
 */
import { NextResponse } from 'next/server'
import { errorResponse, serverErrorResponse, type ErrorResponseBody } from './api-response'

/** 可拋出的應用錯誤，帶 HTTP 狀態與代碼 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message?: string
  ) {
    super(message ?? code)
    this.name = 'AppError'
  }
}

/**
 * 包裝 API handler：捕獲 AppError 回傳對應 status，其餘 500 + log
 * 用法：return handleApiError(async () => { ... return NextResponse.json(...) })()
 */
export async function handleApiError<T>(
  fn: () => Promise<NextResponse<T>>
): Promise<NextResponse<T> | NextResponse<ErrorResponseBody>> {
  try {
    return await fn()
  } catch (e) {
    if (e instanceof AppError) {
      return errorResponse(e.status, e.code, { message: e.message }) as NextResponse<ErrorResponseBody>
    }
    return serverErrorResponse(e) as NextResponse<ErrorResponseBody>
  }
}

/** R2-018：標準化 400 校驗失敗；若引入 zod 可改為 zodSchema.safeParse 後擲出此錯誤 */
export function validationError(message: string, code = 'VALIDATION_ERROR'): AppError {
  return new AppError(400, code, message)
}
