import { NextRequest, NextResponse } from 'next/server';
import {
  PAYPAL_PLANS,
  PAYABLE_TIERS,
  PRICING_PLANS_DISPLAY,
  getPayPalPriceString,
  getPayPalPlanId,
  type PayableTier,
} from '@/config/pricing.config';
import { logApiError } from '@/lib/api-error-log';
import { getCurrentUser } from '@/lib/get-current-user';
import { createServerClient } from '@/lib/supabase-server';
import { errorResponse, serverErrorResponse } from '@/lib/api-response';
import { isRateLimited, getClientIp } from '@/lib/rate-limit';
import { SubscriptionPostBodySchema, MAX_SUBSCRIPTION_ID_LENGTH } from '@/lib/api-body-schemas';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const PAYPAL_API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

/** 取得 PayPal OAuth2 access token；失敗時拋出以便回傳 503 */
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = (await response.json()) as { access_token?: string; error_description?: string };
  if (!response.ok) {
    const msg = typeof data?.error_description === 'string' ? data.error_description : `HTTP ${response.status}`;
    throw new Error(`PAYPAL_AUTH_FAILED: ${msg}`);
  }
  if (!data?.access_token) {
    throw new Error('PAYPAL_AUTH_FAILED: No access_token in response');
  }
  return data.access_token;
}

/** E01：方案從 pricing.config 讀取，與定價頁一致 */
function getPlanForPayPal(planType: PayableTier) {
  const plan = PAYPAL_PLANS[planType];
  return {
    name: plan.name,
    description: plan.description,
    price: getPayPalPriceString(planType),
    currency: plan.currency,
    interval: plan.interval,
  };
}

/** D1/D2：PayPal 未設定時回傳 503，避免前端無限重試 */
function ensurePayPalConfig(): void {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PAYPAL_NOT_CONFIGURED')
  }
}

/** SEC-001：訂閱 API 限流，未認證高頻回傳 429；SEC-003 Zod 校驗 body */
export async function POST(request: NextRequest) {
  const startMs = Date.now();
  const requestId = request.headers.get('x-request-id') ?? undefined;
  const ip = getClientIp(request.headers);
  if (isRateLimited(ip, 'subscription')) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMITED', message: '操作過於頻繁，請稍後再試' } },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  try {
    ensurePayPalConfig()
    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      return errorResponse(400, 'Invalid JSON', { message: '請提供有效的 JSON body' })
    }
    const parsed = SubscriptionPostBodySchema.safeParse(raw)
    if (!parsed.success) {
      return errorResponse(400, 'Invalid body', { message: 'action 須為 create-subscription、capture-subscription 或 cancel-subscription' })
    }
    const { action, planType, subscriptionId } = parsed.data

    // P0-06：create / capture / cancel 須已登入
    const user = await getCurrentUser();
    if (!user && (action === 'create-subscription' || action === 'capture-subscription' || action === 'cancel-subscription')) {
      return errorResponse(401, 'Unauthorized', { message: '請先登入' });
    }

    const accessToken = await getAccessToken();

    if (action === 'create-subscription') {
      if (planType !== 'basic' && planType !== 'premium') {
        return errorResponse(400, 'Invalid plan type', { message: '方案須為 basic 或 premium' });
      }
      // P1-12 / P3-73：若 config 已有 plan_id 則直接建立 subscription，不重複建立 product/plan
      const planIdFromConfig = getPayPalPlanId(planType)

      let planId: string
      if (planIdFromConfig) {
        planId = planIdFromConfig
      } else {
        const plan = getPlanForPayPal(planType);
        const productResponse = await fetch(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: plan.name,
            description: plan.description,
            type: 'SERVICE',
            category: 'EDUCATIONAL_AND_TEXTBOOKS',
          }),
        });
        if (!productResponse.ok) {
          const errBody = (await productResponse.json()) as { message?: string };
          throw new Error(`PayPal product create failed: ${errBody?.message ?? productResponse.statusText}`);
        }
        const product = (await productResponse.json()) as { id: string };
        const billingPlanResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: product.id,
            name: plan.name,
            description: plan.description,
            billing_cycles: [
              {
                frequency: { interval_unit: plan.interval, interval_count: 1 },
                tenure_type: 'REGULAR',
                sequence: 1,
                total_cycles: 0,
                pricing_scheme: { fixed_price: { value: plan.price, currency_code: plan.currency } },
              },
            ],
            payment_preferences: { auto_bill_outstanding: true, payment_failure_threshold: 3 },
          }),
        });
        if (!billingPlanResponse.ok) {
          const errBody = (await billingPlanResponse.json()) as { message?: string };
          throw new Error(`PayPal plan create failed: ${errBody?.message ?? billingPlanResponse.statusText}`);
        }
        const billingPlan = (await billingPlanResponse.json()) as { id: string };
        planId = billingPlan.id;
      }

      // Create subscription（P0-06：傳 custom_id 供 Webhook 對應用戶）
      const subscriptionResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          custom_id: user!.id,
          application_context: {
            brand_name: 'Cheersin',
            locale: 'zh-TW',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'SUBSCRIBE_NOW',
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/success?planType=${encodeURIComponent(planType)}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/cancel`,
          },
        }),
      });

      if (!subscriptionResponse.ok) {
        const errBody = (await subscriptionResponse.json()) as { message?: string };
        throw new Error(`PayPal subscription create failed: ${errBody?.message ?? subscriptionResponse.statusText}`);
      }
      const subscription = (await subscriptionResponse.json()) as { id: string; links?: import('@/types/api-bodies').PayPalLink[] };
      
      return NextResponse.json({
        subscriptionId: subscription.id,
        approvalUrl: subscription.links?.find((l) => l.rel === 'approve')?.href,
      });
    }

    if (action === 'capture-subscription') {
      const subId = typeof subscriptionId === 'string' ? subscriptionId.trim().slice(0, MAX_SUBSCRIPTION_ID_LENGTH) : ''
      if (!subId) {
        return errorResponse(400, 'Missing subscriptionId', { message: 'capture-subscription 需提供 subscriptionId' })
      }
      // Get subscription details after user approves
      const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errBody = (await response.json()) as { message?: string };
        return errorResponse(400, 'PayPal subscription fetch failed', { message: errBody?.message ?? '無法取得訂閱狀態，請稍後再試' });
      }
      const subscription = (await response.json()) as { status?: string; billing_info?: { next_billing_time?: string }; start_time?: string; subscriber?: { payer_id?: string }; plan_id?: string };
      /** P3-54：回傳 current_period_end 供成功頁顯示「下次扣款日」 */
      const nextBilling = subscription.billing_info?.next_billing_time ?? subscription.start_time;
      const currentPeriodEnd = nextBilling
        ? (typeof nextBilling === 'string' ? nextBilling : new Date(nextBilling).toISOString()).slice(0, 10)
        : null
      return NextResponse.json({
        status: subscription.status,
        subscriberId: subscription.subscriber?.payer_id,
        planId: subscription.plan_id,
        startTime: subscription.start_time,
        current_period_end: currentPeriodEnd,
      });
    }

    if (action === 'cancel-subscription') {
      const subId = typeof subscriptionId === 'string' ? subscriptionId.trim().slice(0, MAX_SUBSCRIPTION_ID_LENGTH) : ''
      if (!subId) {
        return errorResponse(400, 'Missing subscriptionId', { message: 'cancel-subscription 需提供 subscriptionId' })
      }
      // P0-06：僅允許取消自己的訂閱
      const supabase = createServerClient();
      const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('paypal_subscription_id', subId)
        .maybeSingle();
      if (subError || !sub) {
        return errorResponse(404, 'Subscription not found', { message: '找不到該訂閱' });
      }
      if ((sub as { user_id: string }).user_id !== user!.id) { // DB row shape from .select('user_id')
        return errorResponse(401, 'Unauthorized', { message: '無法取消他人的訂閱' });
      }
      // Cancel subscription
      const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'User requested cancellation',
        }),
      });

      if (response.status === 204) {
        return NextResponse.json({ success: true, message: 'Subscription cancelled' });
      }
      
      return errorResponse(400, 'Failed to cancel subscription', { message: '取消訂閱失敗，請稍後再試' });
    }

    return errorResponse(400, 'Invalid action', { message: '不支援的 action' });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'PAYPAL_NOT_CONFIGURED') {
        logApiError('subscription', error, { action: 'config-check', isP0: true, requestId });
        return errorResponse(503, 'PayPal not configured', { message: '訂閱金流尚未設定，請稍後再試或聯繫客服。' });
      }
      if (error.message.startsWith('PAYPAL_AUTH_FAILED:')) {
        logApiError('subscription', error, { action: 'paypal-auth', isP0: true, requestId });
        return errorResponse(503, 'PayPal auth failed', { message: '訂閱服務暫時無法連線，請稍後再試或聯繫客服。' });
      }
    }
    const durationMs = Date.now() - startMs;
    logApiError('subscription', error, { isP0: true, requestId, durationMs });
    return serverErrorResponse(error);
  }
}

/** E01 / P3-41：GET 回傳方案與 pricing.config；P3-54/55：已登入時一併回傳當前訂閱 tier、current_period_end */
export async function GET() {
  const plans = PAYABLE_TIERS.map((tier) => {
    const plan = PAYPAL_PLANS[tier]
    const display = PRICING_PLANS_DISPLAY.find((p) => p.tier === tier)
    return {
      id: tier,
      name: plan.name,
      price: plan.priceMonthly,
      currency: plan.currency,
      interval: '月',
      features: display?.features ?? [],
      ...(display?.popular ? { popular: true } : {}),
    }
  })
  const user = await getCurrentUser()
  let subscription: { tier: string; current_period_end: string | null } | null = null
  if (user) {
    const { data: sub } = await createServerClient()
      .from('subscriptions')
      .select('plan_type, current_period_end')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (sub) {
      subscription = {
        tier: (sub as { plan_type: string }).plan_type ?? 'free',
        current_period_end: (sub as { current_period_end: string | null }).current_period_end
          ? new Date((sub as { current_period_end: string }).current_period_end).toISOString().slice(0, 10)
          : null,
      }
    }
  }
  return NextResponse.json({ plans, ...(subscription ? { subscription } : {}) })
}
