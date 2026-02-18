import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/get-current-user'
import { createServerClient } from '@/lib/supabase-server'
import { errorResponse } from '@/lib/api-response'
import { logApiError, logApiWarn } from '@/lib/api-error-log'

/** PAY-027: Subscription pause API — pauses active subscription for 1-3 months */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return errorResponse(401, 'Unauthorized', { message: 'Sign in required' })
    }

    let body: { months?: number }
    try {
      body = await request.json() as typeof body
    } catch {
      return errorResponse(400, 'INVALID_JSON', { message: 'Invalid body' })
    }

    const months = typeof body.months === 'number' && body.months >= 1 && body.months <= 3 ? body.months : 1
    const supabase = createServerClient()

    // Find active subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, paypal_subscription_id, user_id, status, plan_type')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!sub) {
      return errorResponse(400, 'NO_ACTIVE_SUB', { message: 'No active subscription to pause' })
    }

    const resumeDate = new Date()
    resumeDate.setMonth(resumeDate.getMonth() + months)

    // Update subscription to paused status
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'paused',
        pause_resume_date: resumeDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id)

    if (updateError) {
      logApiError('subscription/pause', updateError, { action: 'update' })
      return errorResponse(500, 'DB_ERROR', { message: 'Failed to pause subscription' })
    }

    // Downgrade profile tier during pause
    await supabase
      .from('profiles')
      .update({ subscription_tier: 'free' })
      .eq('id', user.id)

    // Audit log
    try {
      await supabase.from('subscription_audit').insert({
        user_id: user.id,
        paypal_subscription_id: sub.paypal_subscription_id,
        old_status: 'active',
        new_status: 'paused',
        old_tier: sub.plan_type,
        new_tier: 'free',
        event_type: 'SUBSCRIPTION.PAUSED',
      })
    } catch {
      // Non-critical
    }

    logApiWarn('subscription/pause', `Paused for ${months} months, resume ${resumeDate.toISOString().slice(0, 10)}`)

    return NextResponse.json({
      success: true,
      resume_date: resumeDate.toISOString().slice(0, 10),
      months,
    })
  } catch (error) {
    logApiError('subscription/pause', error, { action: 'pause' })
    return errorResponse(500, 'INTERNAL_ERROR', { message: 'Internal error' })
  }
}
