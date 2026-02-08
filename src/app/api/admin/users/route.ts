/**
 * P0-023：管理後台 — 用戶查找與訂閱狀態管理
 * GET: 依 email 或 user id 查詢 profile + subscriptions
 * PATCH: 更新用戶訂閱階級 (subscription_tier)
 */
import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { createServerClientOptional } from '@/lib/supabase-server'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'
import type { SubscriptionTier } from '@/lib/subscription'

function isAdmin(request: NextRequest): boolean {
  return isAdminRequest(
    request.headers.get('x-admin-secret'),
    process.env.ADMIN_SECRET,
    process.env.NODE_ENV === 'development'
  )
}

/** GET /api/admin/users?q=email@example.com 或 ?q=uuid */
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createServerClientOptional()
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    )
  }
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q) {
    return errorResponse(400, 'Missing query', { message: '請提供查詢參數 q（email 或 user id）' })
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q)
    let profile: { id: string; email: string | null; display_name: string | null; subscription_tier: string | null; created_at: string | null; updated_at: string | null } | null = null

    if (isUuid) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, subscription_tier, created_at, updated_at')
        .eq('id', q)
        .maybeSingle()
      if (error) throw error
      profile = data
    } else {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, subscription_tier, created_at, updated_at')
        .eq('email', q)
        .maybeSingle()
      if (error) throw error
      profile = data
    }

    if (!profile) {
      return NextResponse.json({ profile: null, subscriptions: [] }, { status: 200 })
    }

    const { data: subs, error: subsError } = await supabase
      .from('subscriptions')
      .select('id, plan_type, status, paypal_subscription_id, start_date, end_date, auto_renew, created_at')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (subsError) throw subsError

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        subscription_tier: profile.subscription_tier,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
      subscriptions: subs ?? [],
    })
  } catch (e) {
    logger.error('Admin users GET failed', { error: e instanceof Error ? e.message : 'Unknown', q })
    return serverErrorResponse(e)
  }
}

const VALID_TIERS: SubscriptionTier[] = ['free', 'basic', 'premium']

/** PATCH /api/admin/users — 更新用戶訂閱階級 */
export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createServerClientOptional()
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    )
  }

  let body: { userId: string; subscription_tier: SubscriptionTier }
  try {
    body = await request.json()
  } catch {
    return errorResponse(400, 'Invalid JSON', { message: '請提供有效的 JSON body' })
  }
  const { userId, subscription_tier } = body
  if (!userId || typeof userId !== 'string') {
    return errorResponse(400, 'Missing userId', { message: '請提供 userId' })
  }
  if (!VALID_TIERS.includes(subscription_tier)) {
    return errorResponse(400, 'Invalid tier', { message: 'subscription_tier 須為 free、basic 或 premium' })
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ subscription_tier, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('id, subscription_tier')
      .single()

    if (error) throw error
    if (!data) {
      return errorResponse(404, 'User not found', { message: '找不到該用戶' })
    }

    logger.info('Admin updated user tier', { userId, subscription_tier })
    return NextResponse.json({ success: true, profile: data })
  } catch (e) {
    logger.error('Admin users PATCH failed', { error: e instanceof Error ? e.message : 'Unknown', userId })
    return serverErrorResponse(e)
  }
}
