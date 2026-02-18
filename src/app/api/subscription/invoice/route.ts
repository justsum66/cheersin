import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/get-current-user'
import { createServerClient } from '@/lib/supabase-server'
import { errorResponse } from '@/lib/api-response'
import { logApiError } from '@/lib/api-error-log'

/** PAY-019: Invoice generation — returns HTML invoice for a specific payment */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return errorResponse(401, 'Unauthorized', { message: 'Sign in required' })
    }

    const paymentId = request.nextUrl.searchParams.get('id')
    if (!paymentId) {
      return errorResponse(400, 'MISSING_ID', { message: 'Payment ID required' })
    }

    const supabase = createServerClient()
    const { data: payment, error } = await supabase
      .from('payments')
      .select('id, amount, currency, status, paid_at, paypal_transaction_id, paypal_subscription_id')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (error || !payment) {
      return errorResponse(404, 'NOT_FOUND', { message: 'Payment not found' })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, display_name')
      .eq('id', user.id)
      .maybeSingle()

    const paidDate = new Date(payment.paid_at).toLocaleDateString('zh-TW', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
    const displayName = profile?.display_name || profile?.email || 'Cheersin User'

    const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="utf-8">
<title>Cheersin Invoice #${payment.id}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; color: #222; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f97316; padding-bottom: 16px; margin-bottom: 24px; }
  .brand { font-size: 24px; font-weight: bold; color: #f97316; }
  .invoice-num { color: #666; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin: 24px 0; }
  th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
  th { background: #f9f9f9; font-weight: 600; font-size: 13px; color: #555; }
  .total-row td { border-top: 2px solid #222; font-weight: bold; font-size: 16px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
<div class="header">
  <div class="brand">Cheersin</div>
  <div class="invoice-num">Invoice #${String(payment.id).slice(0, 8).toUpperCase()}<br>${paidDate}</div>
</div>
<p><strong>Bill to:</strong> ${displayName}</p>
<table>
  <thead><tr><th>Description</th><th>Transaction ID</th><th>Amount</th></tr></thead>
  <tbody>
    <tr>
      <td>Cheersin Subscription</td>
      <td style="font-size:12px;color:#666">${payment.paypal_transaction_id || '-'}</td>
      <td>${payment.currency} ${Number(payment.amount).toLocaleString()}</td>
    </tr>
  </tbody>
  <tfoot>
    <tr class="total-row">
      <td colspan="2">Total</td>
      <td>${payment.currency} ${Number(payment.amount).toLocaleString()}</td>
    </tr>
  </tfoot>
</table>
<p style="font-size:13px;color:#666">Status: <strong>${payment.status}</strong></p>
<div class="footer">
  <p>Cheersin &middot; cheersin.app</p>
  <p>Payment processed via PayPal. For questions, contact hello@cheersin.app</p>
</div>
</body>
</html>`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    logApiError('subscription/invoice', error, { action: 'generate' })
    return errorResponse(500, 'INTERNAL_ERROR', { message: 'Failed to generate invoice' })
  }
}
