/**
 * 學習 API 共用：需登入才可存取，未登入回傳 401
 */
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/get-current-user'
import { errorResponse } from '@/lib/api-response'
import { LEARN_ERROR, LEARN_MESSAGE } from '@/lib/api-error-codes'
import type { CurrentUser } from '@/lib/get-current-user'

export type RequireLearnAuthResult =
  | { ok: true; user: CurrentUser }
  | { ok: false; response: NextResponse }

/**
 * 取得當前用戶；未登入時回傳 401 回應，供學習相關 API 使用
 */
export async function requireLearnAuth(): Promise<RequireLearnAuthResult> {
  const user = await getCurrentUser()
  if (!user?.id) {
    return {
      ok: false,
      response: errorResponse(401, LEARN_ERROR.UNAUTHORIZED, { message: LEARN_MESSAGE.UNAUTHORIZED }),
    }
  }
  return { ok: true, user }
}
