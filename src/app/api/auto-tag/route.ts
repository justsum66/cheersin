/**
 * P2-407：AI 自動標籤 — 依名稱/描述產生標籤，供酒款或課程使用
 * POST body: { type: 'wine' | 'course', name: string, description?: string }
 * 回傳: { tags: string[] }
 */
import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'
import { groq, GROQ_CHAT_MODEL } from '@/lib/groq'
import { GROQ_API_KEY, GROQ_AUTO_TAG_API_KEY, CHAT_TIMEOUT_MS } from '@/lib/env-config'

export async function POST(request: Request) {
  let type: string
  let name: string
  let description: string
  try {
    const body = await request.json()
    type = typeof body?.type === 'string' ? body.type : ''
    name = typeof body?.name === 'string' ? body.name.trim().slice(0, 500) : ''
    description = typeof body?.description === 'string' ? body.description.trim().slice(0, 2000) : ''
  } catch {
    return errorResponse(400, 'INVALID_JSON', { message: 'Invalid JSON' })
  }
  if (!type || !name || !['wine', 'course'].includes(type)) {
    return errorResponse(400, 'INVALID_BODY', { message: 'type must be wine or course, name required' })
  }
  const autoTagKey = GROQ_AUTO_TAG_API_KEY || GROQ_API_KEY
  if (!autoTagKey) {
    return errorResponse(503, 'SERVICE_NOT_CONFIGURED', { message: 'Auto-tag not configured' })
  }
  const client = GROQ_AUTO_TAG_API_KEY
    ? new Groq({ apiKey: GROQ_AUTO_TAG_API_KEY, timeout: CHAT_TIMEOUT_MS })
    : groq
  const prompt =
    type === 'wine'
      ? `根據以下酒款名稱與描述，輸出 3～8 個繁體中文標籤（產區、品種、風格、場合等），僅回傳 JSON 陣列字串，例如 ["紅酒","勃艮第","黑皮諾","聚餐"]。\n名稱：${name}\n描述：${description || '無'}`
      : `根據以下課程名稱與描述，輸出 3～8 個繁體中文標籤（主題、難度、類型等），僅回傳 JSON 陣列字串。\n名稱：${name}\n描述：${description || '無'}`
  try {
    const completion = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: GROQ_CHAT_MODEL,
      temperature: 0.3,
      max_tokens: 200,
    })
    const raw = completion.choices[0]?.message?.content?.trim() || '[]'
    const jsonStr = raw.replace(/^```\w*\n?|```$/g, '').trim()
    const parsed = JSON.parse(jsonStr)
    const tags = Array.isArray(parsed) ? parsed.filter((t) => typeof t === 'string').slice(0, 10) : []
    return NextResponse.json({ tags })
  } catch (e) {
    return errorResponse(500, 'TAG_GENERATION_FAILED', { message: e instanceof Error ? e.message : 'Tag generation failed' })
  }
}
