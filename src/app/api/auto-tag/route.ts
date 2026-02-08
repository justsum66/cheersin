/**
 * P2-407：AI 自動標籤 — 依名稱/描述產生標籤，供酒款或課程使用
 * POST body: { type: 'wine' | 'course', name: string, description?: string }
 * 回傳: { tags: string[] }
 */
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { GROQ_API_KEY } from '@/lib/env-config'

const groq = new Groq({ apiKey: GROQ_API_KEY || undefined })

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
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!type || !name || !['wine', 'course'].includes(type)) {
    return NextResponse.json({ error: 'type must be wine or course, name required' }, { status: 400 })
  }
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: 'Auto-tag not configured' }, { status: 503 })
  }
  const prompt =
    type === 'wine'
      ? `根據以下酒款名稱與描述，輸出 3～8 個繁體中文標籤（產區、品種、風格、場合等），僅回傳 JSON 陣列字串，例如 ["紅酒","勃艮第","黑皮諾","聚餐"]。\n名稱：${name}\n描述：${description || '無'}`
      : `根據以下課程名稱與描述，輸出 3～8 個繁體中文標籤（主題、難度、類型等），僅回傳 JSON 陣列字串。\n名稱：${name}\n描述：${description || '無'}`
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 200,
    })
    const raw = completion.choices[0]?.message?.content?.trim() || '[]'
    const jsonStr = raw.replace(/^```\w*\n?|```$/g, '').trim()
    const parsed = JSON.parse(jsonStr)
    const tags = Array.isArray(parsed) ? parsed.filter((t) => typeof t === 'string').slice(0, 10) : []
    return NextResponse.json({ tags })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Tag generation failed' }, { status: 500 })
  }
}
