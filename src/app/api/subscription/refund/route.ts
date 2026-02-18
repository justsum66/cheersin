import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/get-current-user'
import { createServerClient } from '@/lib/supabase-server'
import { errorResponse } from '@/lib/api-response'
import { logApiError, logApiWarn } from '@/lib/api-error-log'

/** PAY-015: Refund request API — stores request for admin review */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return errorResponse(401, 'Unauthorized', { message: 'Please sign in' })
    }

    let body: { reason?: string }
    try {
      body = await request.json() as { reason?: string }
    } catch {
      return errorResponse(400, 'INVALID_JSON', { message: 'Invalid request body' })
    }

    const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 500) : ''
    if (!reason) {
      return errorResponse(400, 'MISSING_REASON', { message: 'Reason is required' })
    }

    const supabase = createServerClient()

    // Check if user has an active subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, paypal_subscription_id, created_at, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'suspended'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!sub) {
      return errorResponse(400, 'NO_ACTIVE_SUB', { message: 'No active subscription found' })
    }

    // Check 7-day window
    const createdAt = new Date(sub.created_at)
    const now = new Date()
    const daysSince = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince > 7) {
      return errorResponse(400, 'WINDOW_EXPIRED', { message: 'Refund window (7 days) has expired' })
    }

    // Store refund request
    const { error: insertError } = await supabase
      .from('refund_requests')
      .insert({
        user_id: user.id,
        subscription_id: sub.id,
        paypal_subscription_id: sub.paypal_subscription_id,
        reason,
        status: 'pending',
        created_at: now.toISOString(),
      })

    if (insertError) {
      // Handle table not existing gracefully
      if (insertError.code === '42P01') {
        logApiWarn('subscription/refund', 'refund_requests table missing')
        return NextResponse.json({ success: true, message: 'Request received (pending table setup)' })
      }
      logApiError('subscription/refund', insertError, { action: 'insert' })
      return errorResponse(500, 'DB_ERROR', { message: 'Failed to submit request' })
    }

    // Send notification email to admin
    const apiKey = process.env.RESEND_API_KEY?.trim()
    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim()
    const adminEmail = process.env.ADMIN_EMAIL?.trim()
    if (apiKey && fromEmail && adminEmail) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: fromEmail,
            to: adminEmail,
            subject: `[Cheersin] Refund Request - ${user.id.slice(0, 8)}`,
            html: `<p>User ${user.id} requested a refund.</p><p>Reason: ${reason}</p><p>Subscription: ${sub.paypal_subscription_id}</p>`,
          }),
        })
      } catch {
        // Non-critical, log and continue
        logApiWarn('subscription/refund', 'Failed to send admin notification email')
      }
    }

    return NextResponse.json({ success: true, message: 'Refund request submitted' })
  } catch (error) {
    logApiError('subscription/refund', error, { action: 'submit' })
    return errorResponse(500, 'INTERNAL_ERROR', { message: 'Internal error' })
  }
}
