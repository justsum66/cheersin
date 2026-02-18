/**
 * CLEAN-030: Email template system.
 * Reusable HTML email builder for transactional emails sent via Resend.
 *
 * Usage:
 *   import { buildEmail, TEMPLATES } from '@/lib/email-templates'
 *   const html = buildEmail(TEMPLATES.WELCOME, { name: 'Paul' })
 */

const BRAND_COLOR = '#d4af37'
const BG_COLOR = '#0a0a0f'
const TEXT_COLOR = '#ffffff'
const MUTED_COLOR = '#9aa0a9'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cheersin.app'

/** Wraps content in branded email layout */
function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title></head>
<body style="margin:0;padding:0;background:${BG_COLOR};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:32px 16px;">
<tr><td style="text-align:center;padding-bottom:24px;">
  <img src="${BASE_URL}/logo_monochrome_gold.png" alt="Cheersin" width="48" height="48" style="display:inline-block;"/>
  <h1 style="color:${BRAND_COLOR};font-size:20px;margin:8px 0 0;">${title}</h1>
</td></tr>
<tr><td style="background:rgba(255,255,255,0.05);border-radius:16px;padding:24px;color:${TEXT_COLOR};font-size:15px;line-height:1.6;">
  ${bodyHtml}
</td></tr>
<tr><td style="text-align:center;padding-top:24px;color:${MUTED_COLOR};font-size:12px;">
  <p>Cheersin 沁飲 — 你的 AI 派對靈魂伴侶</p>
  <a href="${BASE_URL}" style="color:${BRAND_COLOR};text-decoration:none;">cheersin.app</a>
</td></tr>
</table>
</body>
</html>`
}

function btn(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;padding:12px 28px;background:${BRAND_COLOR};color:#000;font-weight:bold;border-radius:8px;text-decoration:none;margin:16px 0;">${text}</a>`
}

// ── Template Builders ──

export const TEMPLATES = {
  WELCOME: 'welcome',
  SUBSCRIPTION_CONFIRMED: 'subscription_confirmed',
  RENEWAL_REMINDER: 'renewal_reminder',
  PAYMENT_FAILED: 'payment_failed',
  GIFT_RECEIVED: 'gift_received',
  REFUND_PROCESSED: 'refund_processed',
  REENGAGEMENT: 'reengagement',
} as const

type TemplateKey = typeof TEMPLATES[keyof typeof TEMPLATES]

export function buildEmail(template: TemplateKey, vars: Record<string, string> = {}): string {
  switch (template) {
    case 'welcome':
      return layout('歡迎加入 Cheersin！', `
        <p>嗨 ${vars.name || '朋友'}，</p>
        <p>歡迎來到 Cheersin 沁飲！探索你的靈魂之酒，發現派對遊戲的無限可能。</p>
        ${btn('開始探索', `${BASE_URL}/quiz`)}
      `)

    case 'subscription_confirmed':
      return layout('訂閱成功', `
        <p>嗨 ${vars.name || ''}，</p>
        <p>你的 <strong>${vars.plan || 'Premium'}</strong> 方案已啟用！開始享受所有進階功能。</p>
        ${btn('探索進階功能', `${BASE_URL}/games`)}
      `)

    case 'renewal_reminder':
      return layout('續訂提醒', `
        <p>嗨 ${vars.name || ''}，</p>
        <p>你的訂閱將在 <strong>${vars.days || '3'}</strong> 天後自動續訂（${vars.amount || ''}）。</p>
        <p>如需變更方案，請前往訂閱管理頁面。</p>
        ${btn('管理訂閱', `${BASE_URL}/subscription/manage`)}
      `)

    case 'payment_failed':
      return layout('付款需要更新', `
        <p>嗨 ${vars.name || ''}，</p>
        <p>你最近的付款未成功。請在 <strong>${vars.graceDays || '3'}</strong> 天內更新付款方式以保留你的訂閱。</p>
        ${btn('更新付款方式', `${BASE_URL}/subscription/manage`)}
      `)

    case 'gift_received':
      return layout('你收到一份禮物訂閱！', `
        <p>嗨！</p>
        <p><strong>${vars.senderName || '朋友'}</strong> 送了你 Cheersin ${vars.plan || 'Premium'} 訂閱！</p>
        ${vars.message ? `<p style="font-style:italic;color:${MUTED_COLOR};">「${vars.message}」</p>` : ''}
        ${btn('啟用禮物', `${BASE_URL}/subscription/gift/redeem?code=${vars.code || ''}`)}
      `)

    case 'refund_processed':
      return layout('退款已處理', `
        <p>嗨 ${vars.name || ''}，</p>
        <p>你的退款 <strong>${vars.amount || ''}</strong> 已處理完成，款項將在 5-10 個工作天內退回。</p>
      `)

    case 'reengagement':
      return layout('我們想你了！', `
        <p>嗨 ${vars.name || ''}，</p>
        <p>好久沒見到你了！新增了許多有趣的派對遊戲和葡萄酒課程，快回來看看。</p>
        ${btn('回來看看', BASE_URL)}
      `)

    default:
      return layout('Cheersin 通知', `<p>${vars.body || ''}</p>`)
  }
}
