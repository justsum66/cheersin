/**
 * P2-349：Session 管理 — 取得目前 session 資訊供個人頁顯示；登出由客戶端 signOut 處理
 * GET：回傳目前使用者的 session（單一，供「目前登入裝置」顯示）
 */
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/get-current-user'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ sessions: [] })
  }
  return NextResponse.json({
    sessions: [{ id: user.id, current: true }],
  })
}
