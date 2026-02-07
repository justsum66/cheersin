import { NextResponse } from 'next/server'
import { serverErrorResponse } from '@/lib/api-response'

/** E44 / BE-46：站內通知預留 — GET 回傳空陣列，未來可接 Supabase；錯誤時統一 serverErrorResponse */
export async function GET() {
  try {
    // 未來：依 user session 查 notifications 表，回傳未讀列表
    return NextResponse.json({ notifications: [] })
  } catch (e) {
    return serverErrorResponse(e)
  }
}
