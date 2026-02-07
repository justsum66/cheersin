import { NextRequest, NextResponse } from 'next/server'
import { createServerClientOptional } from '@/lib/supabase-server'
import { logApiError, logApiWarn } from '@/lib/api-error-log'
import { getTierFromPayPalPlanId } from '@/config/pricing.config'

// PayPal API base URL (use sandbox for testing)
const PAYPAL_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

/** PayPal webhook event payload (subset of fields we use)；id 用於冪等；T048 REFUNDED 用 billing_agreement_id */
interface PayPalWebhookEvent {
  id?: string
  event_type: string
  resource: {
    id?: string
    custom_id?: string
    plan_id?: string
    billing_info?: { next_billing_time?: string }
    billing_agreement_id?: string
    parent_payment?: string
    amount?: { total?: string; currency?: string }
    status_update_reason?: string
  }
}

/** E09：PayPal Webhook 簽名驗證與冪等 — 生產環境驗證簽名；event_id 冪等寫入 webhook_events */
async function verifyWebhookSignature(
  body: string,
  headers: Headers,
  requestId?: string | null
): Promise<boolean> {
  try {
    // Get PayPal access token
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64')

    const tokenResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    const { access_token } = await tokenResponse.json()

    // Verify the webhook signature
    const verifyResponse = await fetch(
      `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_algo: headers.get('paypal-auth-algo'),
          cert_url: headers.get('paypal-cert-url'),
          transmission_id: headers.get('paypal-transmission-id'),
          transmission_sig: headers.get('paypal-transmission-sig'),
          transmission_time: headers.get('paypal-transmission-time'),
          webhook_id: process.env.PAYPAL_WEBHOOK_ID,
          webhook_event: JSON.parse(body),
        }),
      }
    )

    const { verification_status } = await verifyResponse.json()
    return verification_status === 'SUCCESS'
  } catch (error) {
    logApiError('webhooks/paypal', error, { action: 'verify-signature', isP0: true, requestId })
    return false
  }
}

/** P3-60：寫入訂閱審計紀錄（subscription_audit 表需已建立） */
async function insertSubscriptionAudit(
  supabase: ReturnType<typeof createServerClientOptional>,
  row: { user_id?: string | null; paypal_subscription_id?: string | null; old_status?: string | null; new_status?: string | null; old_tier?: string | null; new_tier?: string | null; event_type: string }
) {
  if (!supabase) return
  await supabase.from('subscription_audit').insert({
    user_id: row.user_id ?? null,
    paypal_subscription_id: row.paypal_subscription_id ?? null,
    old_status: row.old_status ?? null,
    new_status: row.new_status ?? null,
    old_tier: row.old_tier ?? null,
    new_tier: row.new_tier ?? null,
    event_type: row.event_type,
  })
}

/** P3-65 / E88：若已設定 Resend，發送「扣款失敗，請更新付款方式」郵件 */
async function sendPaymentFailedEmailIfConfigured(
  supabase: Awaited<ReturnType<typeof createServerClientOptional>>,
  userId: string,
  requestId?: string | null
): Promise<void> {
  if (!supabase) return
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim()
  if (!apiKey || !fromEmail) return

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .maybeSingle()

    const to = profile?.email
    if (!to || typeof to !== 'string') return

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to,
        subject: '方案扣款失敗 — 請更新付款方式',
        html: '<p>您的方案扣款失敗，請至訂閱管理更新付款方式。</p><p><a href="https://cheersin.app/subscription">訂閱管理</a></p>',
      }),
    })

    if (!res.ok) {
      const msg = `Resend API ${res.status}: ${await res.text()}`
      logApiWarn('webhooks/paypal', msg, { action: 'payment-failed-email', requestId })
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    logApiWarn('webhooks/paypal', msg, { action: 'payment-failed-email', requestId })
  }
}

// Handle different PayPal events（D2：Supabase 未設定時僅記錄，仍回 200 避免 PayPal 重試）
async function handlePayPalEvent(event: PayPalWebhookEvent, requestId?: string | null) {
  const eventType = event.event_type
  const resource = event.resource
  const supabase = createServerClientOptional()
  if (!supabase) {
    logApiWarn('webhooks/paypal', 'Supabase not configured, skipping DB updates', { requestId })
    return
  }

  /** SEC-17：日誌不含 PII，僅記錄 event type */
  logApiWarn('webhooks/paypal', `Processing event: ${eventType}`, { action: eventType, requestId })

  switch (eventType) {
    // Subscription activated (new subscription)
    case 'BILLING.SUBSCRIPTION.ACTIVATED': {
      const subscriptionId = resource.id
      const customId = resource.custom_id // User ID we passed during creation
      const planType = getTierFromPayPalPlanId(resource.plan_id)

      // Update user subscription in database（與 DB 欄位一致：started_at, current_period_end）
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: customId,
          paypal_subscription_id: subscriptionId,
          plan_type: planType,
          status: 'active',
          started_at: new Date().toISOString(),
          current_period_end: resource.billing_info?.next_billing_time ?? null,
        })

      if (error) {
        logApiError('webhooks/paypal', error, { action: 'BILLING.SUBSCRIPTION.ACTIVATED', requestId })
        throw error
      }

      // Update user profile
      await supabase
        .from('profiles')
        .update({ subscription_tier: planType })
        .eq('id', customId)

      // P3-60：審計紀錄
      await insertSubscriptionAudit(supabase, { user_id: customId, paypal_subscription_id: subscriptionId, new_status: 'active', new_tier: planType, event_type: eventType })
      /** SEC-17：不記錄 user id，僅記錄 planType */
      logApiWarn('webhooks/paypal', 'Subscription activated', { action: planType, requestId })
      break
    }

    // Payment completed for subscription（P2-27：由 subscription 查 user_id 寫入 payments）
    case 'PAYMENT.SALE.COMPLETED': {
      const subscriptionId = resource.billing_agreement_id
      const amount = resource.amount?.total ?? '0'
      const currency = resource.amount?.currency ?? 'USD'

      let userId: string | null = null
      if (subscriptionId) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('paypal_subscription_id', subscriptionId)
          .maybeSingle()
        if (sub?.user_id) userId = sub.user_id
      }

      const { error } = await supabase
        .from('payments')
        .insert({
          paypal_subscription_id: subscriptionId,
          paypal_transaction_id: resource.id ?? '',
          amount: parseFloat(amount),
          currency,
          status: 'completed',
          paid_at: new Date().toISOString(),
          user_id: userId,
        })

      if (error) {
        logApiError('webhooks/paypal', error, { action: 'PAYMENT.SALE.COMPLETED', requestId })
      }
      /** SEC-17：不記錄 subscriptionId/userId，僅記錄幣別 */
      logApiWarn('webhooks/paypal', 'Payment completed', { action: currency, requestId })
      break
    }

    // Subscription cancelled
    case 'BILLING.SUBSCRIPTION.CANCELLED': {
      const subscriptionId = resource.id

      // P3-60：先取舊狀態再更新，並寫入審計
      const { data: subBefore } = await supabase
        .from('subscriptions')
        .select('user_id, status, plan_type')
        .eq('paypal_subscription_id', subscriptionId)
        .maybeSingle()

      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('paypal_subscription_id', subscriptionId)

      if (error) {
        logApiError('webhooks/paypal', error, { action: 'BILLING.SUBSCRIPTION.CANCELLED', requestId })
      }

      if (subBefore) {
        await supabase
          .from('profiles')
          .update({ subscription_tier: 'free' })
          .eq('id', subBefore.user_id)
        await insertSubscriptionAudit(supabase, {
          user_id: subBefore.user_id,
          paypal_subscription_id: subscriptionId,
          old_status: subBefore.status,
          new_status: 'cancelled',
          old_tier: subBefore.plan_type,
          new_tier: 'free',
          event_type: eventType,
        })
      }
      logApiWarn('webhooks/paypal', 'Subscription cancelled', { requestId })
      break
    }

    // Subscription suspended (payment failed)
    case 'BILLING.SUBSCRIPTION.SUSPENDED': {
      const subscriptionId = resource.id

      const { data: subBefore } = await supabase
        .from('subscriptions')
        .select('user_id, status, plan_type')
        .eq('paypal_subscription_id', subscriptionId)
        .maybeSingle()

      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'suspended' })
        .eq('paypal_subscription_id', subscriptionId)

      if (error) {
        logApiError('webhooks/paypal', error, { action: 'BILLING.SUBSCRIPTION.SUSPENDED', requestId })
      }
      if (subBefore) {
        await insertSubscriptionAudit(supabase, {
          user_id: subBefore.user_id,
          paypal_subscription_id: subscriptionId,
          old_status: subBefore.status,
          new_status: 'suspended',
          old_tier: subBefore.plan_type,
          new_tier: subBefore.plan_type,
          event_type: eventType,
        })
      }
      logApiWarn('webhooks/paypal', 'Subscription suspended', { requestId })
      break
    }

    // E88 / P3-65：Subscription payment failed — payment_failures + 站內通知 + 可選 Resend
    case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
      const subscriptionId = resource.id
      const reason = resource.status_update_reason || 'Payment failed'

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('paypal_subscription_id', subscriptionId)
        .maybeSingle()

      const userId = sub?.user_id ?? null

      const { error: pfError } = await supabase
        .from('payment_failures')
        .insert({
          paypal_subscription_id: subscriptionId,
          user_id: userId,
          failed_at: new Date().toISOString(),
          reason,
        })

      if (pfError) {
        logApiError('webhooks/paypal', pfError, { action: 'BILLING.SUBSCRIPTION.PAYMENT.FAILED', requestId })
      }

      if (userId) {
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'payment_failed',
            title: '方案扣款失敗',
            body: '您的方案扣款失敗，請至訂閱管理更新付款方式。',
          })

        if (notifError) {
          logApiError('webhooks/paypal', notifError, { action: 'notification_insert', requestId })
        }

        await sendPaymentFailedEmailIfConfigured(supabase, userId, requestId)
      }

      logApiWarn('webhooks/paypal', 'Payment failed for subscription', { requestId })
      break
    }

    // T048 P1：退款 — 爭議或退款時降級訂閱
    case 'PAYMENT.SALE.REFUNDED': {
      const subscriptionId = resource.billing_agreement_id ?? (resource as { parent_payment?: string }).parent_payment
      if (subscriptionId) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id, status, plan_type')
          .eq('paypal_subscription_id', subscriptionId)
          .maybeSingle()
        if (sub) {
          await supabase
            .from('subscriptions')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('paypal_subscription_id', subscriptionId)
          await supabase
            .from('profiles')
            .update({ subscription_tier: 'free' })
            .eq('id', sub.user_id)
          await insertSubscriptionAudit(supabase, {
            user_id: sub.user_id,
            paypal_subscription_id: subscriptionId,
            old_status: sub.status,
            new_status: 'cancelled',
            old_tier: sub.plan_type,
            new_tier: 'free',
            event_type: eventType,
          })
        }
      }
      logApiWarn('webhooks/paypal', 'Payment refunded, subscription cancelled', { requestId })
      break
    }

    // Subscription renewed
    case 'BILLING.SUBSCRIPTION.RENEWED': {
      const subscriptionId = resource.id

      const { data: subBefore } = await supabase
        .from('subscriptions')
        .select('user_id, status, plan_type')
        .eq('paypal_subscription_id', subscriptionId)
        .maybeSingle()

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_end: resource.billing_info?.next_billing_time ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('paypal_subscription_id', subscriptionId)

      if (error) {
        logApiError('webhooks/paypal', error, { action: 'BILLING.SUBSCRIPTION.RENEWED', requestId })
      }
      if (subBefore) {
        await insertSubscriptionAudit(supabase, {
          user_id: subBefore.user_id,
          paypal_subscription_id: subscriptionId,
          old_status: subBefore.status,
          new_status: 'active',
          old_tier: subBefore.plan_type,
          new_tier: subBefore.plan_type,
          event_type: eventType,
        })
      }
      logApiWarn('webhooks/paypal', 'Subscription renewed', { requestId })
      break
    }

    default:
      logApiWarn('webhooks/paypal', `Unhandled event type: ${eventType}`, { requestId })
  }
}

// Main webhook handler；EXPERT_60 P1：冪等 — 已處理 event_id 則 return 200 不重複寫入
export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? undefined
  const body = await request.text()
  const headers = request.headers

  try {
    // P0-05：生產環境強制驗證簽名，且 PAYPAL_WEBHOOK_ID 必填
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.PAYPAL_WEBHOOK_ID?.trim()) {
        logApiError('webhooks/paypal', new Error('PAYPAL_WEBHOOK_ID not set in production'), { isP0: true, requestId })
        return NextResponse.json(
          { error: 'Webhook not configured' },
          { status: 503 }
        )
      }
      const isValid = await verifyWebhookSignature(body, headers, requestId)
      if (!isValid) {
        logApiError('webhooks/paypal', new Error('Invalid webhook signature'), { code: 'invalid_signature', isP0: true, requestId })
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const event: PayPalWebhookEvent = JSON.parse(body)
    const eventId = event.id ?? null

    const supabase = createServerClientOptional()
    if (supabase && eventId) {
      // 冪等：若已處理過此 event_id 則直接 200，不重複寫入
      const { error: insertError } = await supabase
        .from('webhook_events')
        .insert({
          event_id: eventId,
          event_type: event.event_type,
          created_at: new Date().toISOString(),
        })

      if (insertError) {
        if (insertError.code === '23505') {
          logApiWarn('webhooks/paypal', 'Duplicate event_id, skipping', { code: '23505', requestId })
          return NextResponse.json({ received: true, duplicate: true }, { status: 200 })
        }
        if (insertError.code === '42P01') {
          logApiWarn('webhooks/paypal', 'webhook_events table missing', { code: '42P01', requestId })
        } else {
          logApiError('webhooks/paypal', new Error(insertError.message), { code: insertError.code, isP0: true, requestId })
          return NextResponse.json(
            { error: 'Idempotency check failed' },
            { status: 500 }
          )
        }
      }
    }

    await handlePayPalEvent(event, requestId)
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    logApiError('webhooks/paypal', error, { action: 'handle-event', isP0: true, requestId })
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    webhook: 'PayPal Subscription Webhook',
    timestamp: new Date().toISOString()
  })
}
