'use client'

import { type ReactNode } from 'react'

/**
 * 133 PayPal 訂閱按鈕：封裝「建立訂閱並跳轉 PayPal」流程
 * 不依賴 PayPal JS SDK，使用既有 /api/subscription create-subscription
 */
export function PayPalButton({
  planId,
  planName,
  disabled = false,
  loading = false,
  onStart,
  onSuccess,
  onError,
  children,
  className = '',
}: {
  planId: string
  planName: string
  disabled?: boolean
  loading?: boolean
  onStart?: () => void
  onSuccess?: () => void
  onError?: (message: string) => void
  children?: ReactNode
  className?: string
}) {
  const handleClick = async () => {
    if (disabled || loading) return
    onStart?.()
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-subscription', planType: planId }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.approvalUrl) {
        onSuccess?.()
        window.location.href = data.approvalUrl
      } else {
        /** E25：503 時不重試，顯示服務暫不可用 */
        const msg = res.status === 503
          ? '訂閱服務暫不可用，請稍後再試或聯繫客服。'
          : (data.message || data.error || '訂閱建立失敗');
        onError?.(msg);
      }
    } catch (e) {
      onError?.((e as Error).message || '發生錯誤')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={className}
      aria-label={`以 PayPal 訂閱 ${planName}`}
    >
      {children ?? (loading ? '處理中…' : `以 PayPal 訂閱 ${planName}`)}
    </button>
  )
}
