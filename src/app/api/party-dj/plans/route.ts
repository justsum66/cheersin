/**
 * Party DJ #12/#13：儲存編排方案、列出最近 3 筆
 * GET: 回傳該用戶最近 3 筆 party_dj_plans（需登入）
 * POST: body { payload } 儲存一筆方案（payload 含 phases、totalMin 等）
 */
import { NextResponse } from 'next/server'
import { createServerClientOptional } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/get-current-user'
import { z } from 'zod'

const PostBodySchema = z.object({
  payload: z.record(z.string(), z.unknown()).refine((p) => typeof (p as { phases?: unknown }).phases === 'object', { message: 'payload.phases required' }),
})

const MAX_PLANS = 3
const PAYLOAD_MAX_BYTES = 50_000

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServerClientOptional()
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  const { data, error } = await supabase
    .from('party_dj_plans')
    .select('id, payload, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(MAX_PLANS)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ plans: data ?? [] })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = PostBodySchema.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: 'payload.phases required', details: parsed.error.flatten() }, { status: 400 })
  const payload = parsed.data.payload
  if (JSON.stringify(payload).length > PAYLOAD_MAX_BYTES) return NextResponse.json({ error: 'Payload too large' }, { status: 400 })
  const supabase = createServerClientOptional()
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  const { data, error } = await supabase
    .from('party_dj_plans')
    .insert({ user_id: user.id, payload })
    .select('id, created_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data?.id, created_at: data?.created_at })
}
