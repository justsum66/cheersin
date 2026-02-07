'use client'

import { useState } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import type { SubscriptionTier } from '@/lib/subscription'
import { UpgradeModal } from '@/components/UpgradeModal'

const TIER_ORDER: SubscriptionTier[] = ['free', 'basic', 'premium']

/** 142 功能閘門：requiredTier 以上才顯示 children，否則顯示升級按鈕並可開 Modal */
export function SubscriptionGate({
  requiredTier,
  children,
  fallback,
  fallbackLabel = '升級以解鎖',
}: {
  requiredTier: SubscriptionTier
  children: React.ReactNode
  fallback?: React.ReactNode
  fallbackLabel?: string
}) {
  const { tier } = useSubscription()
  const [showModal, setShowModal] = useState(false)
  const requiredIndex = TIER_ORDER.indexOf(requiredTier)
  const currentIndex = TIER_ORDER.indexOf(tier)
  const allowed = currentIndex >= requiredIndex

  if (allowed) return <>{children}</>

  if (fallback) return <>{fallback}</>

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="btn-primary text-sm min-h-[48px] min-w-[48px] games-focus-ring"
      >
        {fallbackLabel}
      </button>
      <UpgradeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        requiredTier={requiredTier}
      />
    </>
  )
}
