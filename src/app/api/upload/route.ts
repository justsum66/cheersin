/**
 * P2-357 / SEC-012：安全的文件上傳 — 白名單 MIME、大小限制強制、隨機檔名，防路徑遍歷與惡意檔
 * SEC-001：上傳 API 限流，高頻回傳 429
 * POST /api/upload：multipart/form-data，field name: file
 * 僅允許 image/jpeg、image/png、image/webp，單檔最大 5MB
 */
import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'
import { createServerClientOptional } from '@/lib/supabase-server'
import { isRateLimitedAsync, getClientIp } from '@/lib/rate-limit'
import { validateImageUpload } from '@/lib/validate-image-upload'
import { randomUUID } from 'crypto'

const BUCKET = 'uploads'

export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  if (await isRateLimitedAsync(ip, 'upload')) {
    const res = errorResponse(429, 'RATE_LIMITED', { message: 'Too many uploads, please try again later' })
    res.headers.set('Retry-After', '60')
    return res
  }
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file || typeof file === 'string') {
      return errorResponse(400, 'INVALID_FILE_FIELD', { message: 'Missing or invalid file field' })
    }
    const blob = file as Blob
    const validation = validateImageUpload(blob)
    if (!validation.ok) {
      return errorResponse(validation.status, validation.code, { message: validation.message })
    }
    const type = blob.type?.toLowerCase()
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
          return errorResponse(503, 'SERVICE_NOT_CONFIGURED', { message: 'Upload not configured (bucket missing)' })
        }
        return errorResponse(500, 'UPLOAD_FAILED', { message: error.message })
      }
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
      return NextResponse.json({ url: urlData.publicUrl, path: data.path }, {
        headers: { 'X-Content-Type-Options': 'nosniff' },
      })
    }
    return errorResponse(503, 'SERVICE_NOT_CONFIGURED', { message: 'Upload not configured' })
  } catch (e) {
    return errorResponse(500, 'UPLOAD_FAILED', { message: e instanceof Error ? e.message : 'Upload failed' })
  }
}
