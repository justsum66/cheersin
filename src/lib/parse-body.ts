/**
 * 共用 API 請求 body 解析：避免各 route 重複 request.json().catch + safeParse + errorResponse
 * 供 POST/PATCH 等需要 JSON body 的 route 使用
 */
import type { z } from 'zod'
import { errorResponse } from './api-response'

/**
 * 解析 request body 為 JSON；解析失敗回傳 null（不拋錯）
 */
export async function parseJsonBody(request: Request): Promise<unknown | null> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

export type ZodParseBodySuccess<T> = { success: true; data: T }
export type ZodParseBodyFailure = { success: false; response: ReturnType<typeof errorResponse> }

/**
 * 解析 JSON body 並以 Zod schema 驗證；失敗時回傳可直接 return 的 errorResponse
 * @param request 請求
 * @param schema Zod schema（如 RecommendPostBodySchema）
 * @param options.invalidJsonCode 無效 JSON 時的 code，預設 INVALID_JSON
 * @param options.invalidJsonMessage 無效 JSON 時的使用者訊息
 * @param options.invalidBodyCode 驗證失敗時的 code，預設 INVALID_BODY
 * @param options.invalidBodyMessage 驗證失敗時的使用者訊息
 * @param options.defaultRaw 當 body 無法解析為 JSON 時使用的預設值（如 {}），未設則回傳 INVALID_JSON
 */
export async function zodParseBody<T>(
  request: Request,
  schema: z.ZodType<T>,
  options?: {
    invalidJsonCode?: string
    invalidJsonMessage?: string
    invalidBodyCode?: string
    invalidBodyMessage?: string
    defaultRaw?: unknown
  }
): Promise<ZodParseBodySuccess<T> | ZodParseBodyFailure> {
  let raw = await parseJsonBody(request)
  if (raw === null && options?.defaultRaw !== undefined) {
    raw = options.defaultRaw
  }
  if (raw === null) {
    return {
      success: false,
      response: errorResponse(400, options?.invalidJsonCode ?? 'INVALID_JSON', {
        message: options?.invalidJsonMessage ?? '請求 body 必須為有效 JSON',
      }),
    }
  }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      response: errorResponse(400, options?.invalidBodyCode ?? 'INVALID_BODY', {
        message: options?.invalidBodyMessage ?? '請求參數格式錯誤',
      }),
    }
  }
  return { success: true, data: parsed.data }
}
