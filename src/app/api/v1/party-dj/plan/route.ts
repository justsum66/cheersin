import { z } from 'zod'
import { generatePartyPlan } from '@/lib/party-dj-plan'
import { successResponse, errorResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { plan } = await generatePartyPlan(body)
    return successResponse(plan)
  } catch (error) {
    logger.error('Party DJ v1 Error', { err: error instanceof Error ? error.message : String(error) })
    if (error instanceof z.ZodError) {
      return errorResponse(400, 'INVALID_INPUT', { message: '輸入參數錯誤' })
    }
    return errorResponse(500, 'INTERNAL_ERROR', { message: '生成計畫失敗' })
  }
}
