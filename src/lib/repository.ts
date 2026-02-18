/**
 * CLEAN-022: Supabase Repository Pattern.
 * Typed query helpers for common data access operations.
 * Reduces raw Supabase client calls scattered across API routes.
 */

import { createServerClient } from '@/lib/supabase-server'

// ── User Profile Queries ──
export async function getUserProfile(userId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw new Error(`Profile fetch failed: ${error.message}`)
  return data
}

export async function updateUserProfile(userId: string, updates: Record<string, unknown>) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw new Error(`Profile update failed: ${error.message}`)
  return data
}

// ── Subscription Queries ──
export async function getUserSubscription(userId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(`Subscription fetch failed: ${error.message}`)
  return data
}

// ── Payment History Queries ──
export async function getPaymentHistory(userId: string, limit = 20) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`Payments fetch failed: ${error.message}`)
  return data ?? []
}

// ── Course Progress Queries ──
export async function getCourseProgress(userId: string, courseSlug?: string) {
  const supabase = await createServerClient()
  let query = supabase
    .from('course_progress')
    .select('*')
    .eq('user_id', userId)
  if (courseSlug) query = query.eq('course_slug', courseSlug)
  const { data, error } = await query
  if (error) throw new Error(`Course progress fetch failed: ${error.message}`)
  return data ?? []
}

export async function upsertCourseProgress(
  userId: string,
  courseSlug: string,
  chapterIndex: number,
  completed: boolean,
) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('course_progress')
    .upsert(
      { user_id: userId, course_slug: courseSlug, chapter_index: chapterIndex, completed, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,course_slug,chapter_index' },
    )
  if (error) throw new Error(`Course progress upsert failed: ${error.message}`)
}

// ── Analytics / Audit Log ──
export async function insertAuditLog(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>,
) {
  const supabase = await createServerClient()
  await supabase
    .from('audit_log')
    .insert({ user_id: userId, action, metadata, created_at: new Date().toISOString() })
    .then(({ error }: { error: any }) => {
      if (error) console.warn('[AuditLog] insert failed:', error.message)
    })
}
