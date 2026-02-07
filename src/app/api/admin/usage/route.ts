/**
 * GET: API 使用分析（99）— 每日呼叫量、成功率、平均延遲、依模型統計
 * 保護：x-admin-secret 常數時間比較（P0-04）或 NODE_ENV=development
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUsageStatsWithSupabase } from '@/lib/api-usage'
import { isAdminRequest } from '@/lib/admin-auth'
import { serverErrorResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'

function isAdmin(request: NextRequest): boolean {
  return isAdminRequest(
    request.headers.get('x-admin-secret'),
    process.env.ADMIN_SECRET,
    process.env.NODE_ENV === 'development'
  )
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const stats = await getUsageStatsWithSupabase()
    return NextResponse.json(stats)
  } catch (e) {
    logger.error('Usage GET failed', { error: e instanceof Error ? e.message : 'Unknown' })
    return serverErrorResponse(e)
  }
}
