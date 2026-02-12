/**
 * P2-357 / SEC-012：安全的文件上傳 — 白名單 MIME、大小限制強制、隨機檔名，防路徑遍歷與惡意檔
 * SEC-001：上傳 API 限流，高頻回傳 429
 * POST /api/upload：multipart/form-data，field name: file
 * 僅允許 image/jpeg、image/png、image/webp，單檔最大 5MB
 */
import { NextResponse } from 'next/server'
import { createServerClientOptional } from '@/lib/supabase-server'
import { isRateLimited, getClientIp } from '@/lib/rate-limit'
import { randomUUID } from 'crypto'

/** SEC-012：白名單 MIME，禁止執行檔與任意類型 */
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
/** SEC-012：單檔大小上限 5MB */
const MAX_BYTES = 5 * 1024 * 1024
const BUCKET = 'uploads'

export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  if (isRateLimited(ip, 'upload')) {
    return NextResponse.json(
      { error: 'Too many uploads, please try again later' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Missing or invalid file field' }, {
        status: 400,
        headers: { 'X-Content-Type-Options': 'nosniff' },
      })
    }
    const blob = file as Blob
    const type = blob.type?.toLowerCase()
    if (!type || !ALLOWED_TYPES.has(type)) {
      return NextResponse.json({ error: 'Only image/jpeg, image/png, image/webp are allowed' }, { status: 400 })
    }
    const size = blob.size
    if (size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }
    const ext = type === 'image/jpeg' ? 'jpg' : type === 'image/png' ? 'png' : 'webp'
    const randomName = `${randomUUID()}.${ext}`

    const supabase = createServerClientOptional()
    if (supabase) {
      const buf = Buffer.from(await blob.arrayBuffer())
      const { data, error } = await supabase.storage.from(BUCKET).upload(randomName, buf, {
        contentType: type,
        upsert: false,
      })
      if (error) {
        if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
          return NextResponse.json(
            { error: 'Upload not configured (bucket missing)' },
            { status: 503 }
          )
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
      return NextResponse.json({ url: urlData.publicUrl, path: data.path }, {
        headers: { 'X-Content-Type-Options': 'nosniff' },
      })
    }
    return NextResponse.json(
      { error: 'Upload not configured' },
      { status: 503 }
    )
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
