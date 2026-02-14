/**
 * 136–140 訂閱生命週期：升降級、取消挽留、發票 PDF、優惠碼、到期 Email
 * 需：PayPal API（plan change / cancel）、後端儲存、郵件服務（Resend）
 */

import { logger } from './logger'
import { createServerClientOptional } from './supabase-server'

export type SubscriptionLifecycleEvent =
  | 'upgraded'
  | 'downgraded'
  | 'cancelled'
  | 'cancel_retention_offered'
  | 'invoice_ready'
  | 'promo_applied'
  | 'expiring_soon'
  | 'expired'

/** 升降級：PayPal 換 plan 後由 webhook 更新 DB；此處僅型別與說明 */
export interface UpgradeDowngradePayload {
  userId: string
  previousPlan: string
  newPlan: string
  paypalSubscriptionId: string
}

/** 取消挽留：使用者點取消時可彈窗挽留，或排程發送挽留 Email */
export interface CancelRetentionPayload {
  userId: string
  planType: string
  cancelAtPeriodEnd: boolean
  offerDiscountPercent?: number
}

/** 發票 PDF：PayPal 或 Stripe 提供 invoice URL；可轉 PDF 或僅連結 */
export interface InvoicePayload {
  userId: string
  invoiceId: string
  pdfUrl?: string
  amount: string
  currency: string
}

/** 優惠碼：驗證與套用（Supabase promo_codes 表） */
export interface PromoCodePayload {
  code: string
  userId?: string
  planId?: string
}

/** 到期前 N 天發送提醒 Email */
export interface ExpiryEmailPayload {
  userId: string
  email: string
  tier: string
  expiresAt: string
  daysLeft: number
}

const RESEND_API_URL = 'https://api.resend.com/emails'

/** 發送到期提醒：RESEND_API_KEY 設定時用 Resend API，否則僅 log */
export async function sendExpiryReminder(payload: ExpiryEmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Cheersin <onboarding@resend.dev>'

  const subject = `您的 Pro 會員將在 ${payload.daysLeft} 天後到期`
  const html = `
    <p>您好，</p>
    <p>您的 Cheersin ${payload.tier} 方案將於 <strong>${payload.expiresAt}</strong> 到期（剩餘 ${payload.daysLeft} 天）。</p>
    <p>續訂後可繼續享有進階課程、更多 AI 對話與遊戲人數。</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'}/pricing">立即續訂</a></p>
    <p>Cheersin 團隊</p>
  `

  if (!apiKey) {
    logger.info('[subscription-lifecycle] sendExpiryReminder skip (no RESEND_API_KEY)', { userId: payload.userId, daysLeft: payload.daysLeft })
    return true
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [payload.email],
        subject,
        html,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      logger.error('[subscription-lifecycle] Resend error', { status: res.status, err })
      return false
    }
    return true
  } catch (e) {
    logger.error('[subscription-lifecycle] sendExpiryReminder failed', { err: e instanceof Error ? e.message : String(e) })
    return false
  }
}

/** 驗證優惠碼：查 Supabase promo_codes，有效則回傳 discountPercent / planId */
export async function validatePromoCode(
  code: string
): Promise<{ valid: boolean; discountPercent?: number; planId?: string }> {
  if (!code || code.trim().length === 0) return { valid: false }

  const supabase = createServerClientOptional()
  if (!supabase) {
    logger.warn('[subscription-lifecycle] validatePromoCode: Supabase not configured')
    return { valid: false }
  }

  try {
    const normalized = code.trim().toUpperCase()
    const { data: row, error } = await supabase
      .from('promo_codes')
      .select('discount_percent, plan_id, valid_until, max_uses, used_count')
      .eq('code', normalized)
      .single()

    if (error || !row) return { valid: false }
    const now = new Date().toISOString()
    if (row.valid_until && row.valid_until < now) return { valid: false }
    if (row.max_uses != null && (row.used_count ?? 0) >= row.max_uses) return { valid: false }

    return {
      valid: true,
      discountPercent: row.discount_percent ?? 0,
      planId: row.plan_id ?? undefined,
    }
  } catch {
    return { valid: false }
  }
}

/** 優惠碼使用後增加 used_count（成功結帳時呼叫） */
export async function incrementPromoCodeUsage(code: string): Promise<void> {
  const supabase = createServerClientOptional()
  if (!supabase) return
  try {
    const normalized = code.trim().toUpperCase()
    const { data: row } = await supabase.from('promo_codes').select('used_count').eq('code', normalized).single()
    if (!row) return
    const next = (row.used_count ?? 0) + 1
    await supabase.from('promo_codes').update({ used_count: next }).eq('code', normalized)
  } catch {
    /* ignore */
  }
}

