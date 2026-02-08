/**
 * P2-357：安全的文件上傳 — 白名單類型、大小限制、隨機檔名，防路徑遍歷與惡意檔
 * POST /api/upload：multipart/form-data，field name: file
 */
import { NextResponse } from 'next/server'
import { createServerClientOptional } from '@/lib/supabase-server'
import { randomUUID } from 'crypto'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const BUCKET = 'uploads'

export async function POST(request: Request) {
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
