import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/get-current-user'
import { createServerClient } from '@/lib/supabase-server'
import { errorResponse } from '@/lib/api-response'
import { logApiError, logApiWarn } from '@/lib/api-error-log'

/** PAY-023: Gift subscription API — stores gift order for processing */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return errorResponse(401, 'Unauthorized', { message: 'Sign in required' })
    }

    let body: { recipientEmail?: string; senderName?: string; message?: string; tier?: string; months?: number }
    try {
      body = await request.json() as typeof body
    } catch {
      return errorResponse(400, 'INVALID_JSON', { message: 'Invalid body' })
    }

    const recipientEmail = typeof body.recipientEmail === 'string' ? body.recipientEmail.trim() : ''
    const tier = body.tier === 'basic' || body.tier === 'premium' ? body.tier : 'basic'
    const months = typeof body.months === 'number' && body.months >= 1 && body.months <= 12 ? body.months : 1

    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return errorResponse(400, 'INVALID_EMAIL', { message: 'Valid recipient email required' })
    }

    const supabase = createServerClient()

    // Store gift order
    const { error } = await supabase
      .from('gift_subscriptions')
      .insert({
        sender_id: user.id,
        recipient_email: recipientEmail,
        sender_name: typeof body.senderName === 'string' ? body.senderName.trim().slice(0, 50) : null,
        message: typeof body.message === 'string' ? body.message.trim().slice(0, 200) : null,
        tier,
        months,
        status: 'pending',
        created_at: new Date().toISOString(),
      })

    if (error) {
      if (error.code === '42P01') {
        logApiWarn('subscription/gift', 'gift_subscriptions table missing')
        return NextResponse.json({ success: true, message: 'Gift order received (pending table setup)' })
      }
      logApiError('subscription/gift', error, { action: 'insert' })
      return errorResponse(500, 'DB_ERROR', { message: 'Failed to create gift' })
    }

    // Send notification email to recipient
    const apiKey = process.env.RESEND_API_KEY?.trim()
    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim()
    if (apiKey && fromEmail) {
      try {
        const senderLabel = typeof body.senderName === 'string' && body.senderName.trim() ? body.senderName.trim() : 'A friend'
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: fromEmail,
            to: recipientEmail,
            subject: `${senderLabel} gifted you a Cheersin subscription!`,
            html: `<p>${senderLabel} gifted you ${months} month${months > 1 ? 's' : ''} of Cheersin ${tier === 'premium' ? 'Premium' : 'Basic'}!</p>${body.message ? `<p>"${body.message}"</p>` : ''}<p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'}/subscription/success?planType=${tier}">Redeem Your Gift</a></p>`,
          }),
        })
      } catch {
        logApiWarn('subscription/gift', 'Failed to send gift email')
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logApiError('subscription/gift', error, { action: 'create' })
    return errorResponse(500, 'INTERNAL_ERROR', { message: 'Internal error' })
  }
}
