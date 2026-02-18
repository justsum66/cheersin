import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/get-current-user'
import { createServerClient } from '@/lib/supabase-server'
import { errorResponse } from '@/lib/api-response'
import { logApiError } from '@/lib/api-error-log'

/** PAY-010: Payment history API — returns user's payment records */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return errorResponse(401, 'Unauthorized', { message: 'Please sign in' })
    }

    const supabase = createServerClient()
    const { data: payments, error } = await supabase
      .from('payments')
      .select('id, amount, currency, status, paid_at, paypal_transaction_id')
      .eq('user_id', user.id)
      .order('paid_at', { ascending: false })
      .limit(50)

    if (error) {
      logApiError('subscription/payments', error, { action: 'list' })
      return errorResponse(500, 'DB_ERROR', { message: 'Failed to load payments' })
    }

    return NextResponse.json({ payments: payments ?? [] })
  } catch (error) {
    logApiError('subscription/payments', error, { action: 'list' })
    return errorResponse(500, 'INTERNAL_ERROR', { message: 'Internal error' })
  }
}
