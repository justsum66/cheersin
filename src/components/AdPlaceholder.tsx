'use client'

import { useSubscription } from '@/hooks/useSubscription'
import { hasNoAds } from '@/lib/subscription'

/**
 * 148 去廣告：Basic 以上不顯示廣告區塊
 * 將廣告或贊助內容包在此組件內，僅 Free 用戶會看到
 */
export function AdPlaceholder({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const { tier } = useSubscription()
  if (hasNoAds(tier)) return null
  return <div className={className}>{children}</div>
}
