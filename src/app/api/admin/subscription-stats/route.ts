import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/get-current-user'
import { createServerClient } from '@/lib/supabase-server'
import { errorResponse } from '@/lib/api-response'
import { logApiError } from '@/lib/api-error-log'

/** PAY-014: Admin subscription stats API — MRR, churn, LTV data */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return errorResponse(401, 'Unauthorized', { message: 'Sign in required' })
    }

    // Simple admin check via profiles.role or env-based admin list
    const adminIds = (process.env.ADMIN_USER_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean)
    if (!adminIds.includes(user.id)) {
      return errorResponse(403, 'Forbidden', { message: 'Admin access required' })
    }

    const supabase = createServerClient()
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Active subscriptions count
    const { count: totalActive } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Cancelled count
    const { count: totalCancelled } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled')

    // Suspended count
    const { count: totalSuspended } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'suspended')

    // New subscriptions in last 30 days
    const { count: newSubs30d } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('created_at', thirtyDaysAgo)

    // Churn in last 30 days
    const { count: churnCount30d } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled')
      .gte('updated_at', thirtyDaysAgo)

    // Revenue in last 30 days
    const { data: revenueData } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('paid_at', thirtyDaysAgo)

    const revenue30d = (revenueData ?? []).reduce((sum, p) => sum + (p.amount ?? 0), 0)

    // MRR = sum of active subscription monthly prices
    const { data: activeSubs } = await supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('status', 'active')

    let mrr = 0
    for (const sub of activeSubs ?? []) {
      if (sub.plan_type === 'basic') mrr += 99
      else if (sub.plan_type === 'premium') mrr += 199
    }

    // Pending refund requests
    let refundRequestsPending = 0
    try {
      const { count } = await supabase
        .from('refund_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      refundRequestsPending = count ?? 0
    } catch {
      // Table may not exist yet
    }

    return NextResponse.json({
      total_active: totalActive ?? 0,
      total_cancelled: totalCancelled ?? 0,
      total_suspended: totalSuspended ?? 0,
      mrr,
      churn_count_30d: churnCount30d ?? 0,
      new_subs_30d: newSubs30d ?? 0,
      revenue_30d: revenue30d,
      refund_requests_pending: refundRequestsPending,
    })
  } catch (error) {
    logApiError('admin/subscription-stats', error, { action: 'get-stats' })
    return errorResponse(500, 'INTERNAL_ERROR', { message: 'Failed to load stats' })
  }
}
