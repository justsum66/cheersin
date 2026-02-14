/**
 * P2-403：AI 生成派對邀請函（佔位 API）
 * POST body: { theme?: string, date?: string } → 回傳模板文字，供前端一鍵分享
 */
import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const theme = typeof body.theme === 'string' ? body.theme.trim() || '派對' : '派對'
    const date = typeof body.date === 'string' ? body.date.trim() : ''

    const template = [
      `🎉 ${theme} 邀請`,
      date ? `📅 ${date}` : null,
      '',
      '用 Cheersin 一起玩派對遊戲、選酒、乾杯！',
      'https://cheersin.com',
    ]
      .filter(Boolean)
      .join('\n')

    return NextResponse.json({ text: template, ok: true })
  } catch {
    return errorResponse(400, 'INVALID_REQUEST', { message: 'Invalid request' })
  }
}
