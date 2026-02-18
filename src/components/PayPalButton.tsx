'use client'

import { getErrorMessage } from '@/lib/api-response'
import { useState, type ReactNode } from 'react'

/** PAY-025: Loading skeleton for PayPal button */
function PayPalButtonSkeleton() {
  return (
    <div className="w-full min-h-[48px] rounded-xl bg-white/10 animate-pulse" aria-hidden />
  )
}

/** PAY-UX: Loading spinner component */
function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

/**
 * 133 PayPal 訂閱按鈕：封裝「建立訂閱並跳轉 PayPal」流程
 * 不依賴 PayPal JS SDK，使用既有 /api/subscription create-subscription
 * PAY-025: Added skeleton state while initializing
 * PAY-UX: Added loading spinner and better error handling
 */
export function PayPalButton({
  planId,
  planName,
  disabled = false,
  loading = false,
  showSkeleton = false,
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
  showSkeleton?: boolean
  onStart?: () => void
  onSuccess?: () => void
  onError?: (message: string) => void
  children?: ReactNode
  className?: string
}) {
  const [isProcessing, setIsProcessing] = useState(false)
  
  if (showSkeleton) return <PayPalButtonSkeleton />
  
  const handleClick = async () => {
    if (disabled || loading || isProcessing) return
    setIsProcessing(true)
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
        setIsProcessing(false)
        /** E25：503 時不重試，顯示服務暫不可用；429 顯示稍後再試 */
        let msg: string
        if (res.status === 503) {
          msg = '訂閱服務暫不可用，請稍後再試或聯繫客服。'
        } else if (res.status === 429) {
          msg = '請求過於頻繁，請稍後再試。'
        } else if (res.status === 401) {
          msg = '請先登入後再訂閱。'
        } else {
          msg = getErrorMessage(data) || '訂閱建立失敗，請重試或聯繫客服。'
        }
        onError?.(msg)
      }
    } catch (e) {
      setIsProcessing(false)
      onError?.((e as Error).message || '網路錯誤，請檢查連線後重試。')
    }
  }

  const isLoading = loading || isProcessing

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={className}
      aria-label={isLoading ? '處理中' : `以 PayPal 訂閱 ${planName}`}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <span className="inline-flex items-center justify-center">
          <LoadingSpinner />
          處理中…
        </span>
      ) : (
        children ?? `以 PayPal 訂閱 ${planName}`
      )}
    </button>
  )
}
