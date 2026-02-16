/**
 * P2-403：AI 生成派對邀請函
 * POST body: { theme?: string, date?: string } → 回傳模板文字，供前端一鍵分享
 * P0-07: Zod 校驗 | P0-24: 限流
 */
import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'
import { GenerateInvitationPostBodySchema } from '@/lib/api-body-schemas'
import { zodParseBody } from '@/lib/parse-body'
import { isRateLimitedAsync, getClientIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  if (await isRateLimitedAsync(ip, 'generate_invitation')) {
    return errorResponse(429, 'RATE_LIMITED', { message: '請求過於頻繁，請稍後再試' })
  }

  const parsed = await zodParseBody(request, GenerateInvitationPostBodySchema, { defaultRaw: {} })
  if (!parsed.success) return parsed.response
  const { theme, date } = parsed.data

  const displayTheme = theme || '派對'
  const template = [
    `🎉 ${displayTheme} 邀請`,
    date ? `📅 ${date}` : null,
    '',
    '用 Cheersin 一起玩派對遊戲、選酒、乾杯！',
    'https://cheersin.com',
  ]
    .filter(Boolean)
    .join('\n')

  return NextResponse.json({ text: template, ok: true })
}
