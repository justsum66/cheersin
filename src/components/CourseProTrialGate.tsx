'use client'

import { useEffect, useState } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import {
  canAccessProCourse,
  canUseProTrial,
  incrementProTrialUsedThisMonth,
} from '@/lib/subscription'
import { UpgradeModal } from '@/components/UpgradeModal'

/**
 * 143 Pro 課程試用閘門：Free 用戶進入 Pro 課程時扣一次試用並顯示內容；無試用則顯示升級 Modal
 */
export function CourseProTrialGate({
  courseId,
  free,
  children,
}: {
  courseId: string
  free: boolean
  children: React.ReactNode
}) {
  const { tier } = useSubscription()
  const [checked, setChecked] = useState(false)
  const [allowed, setAllowed] = useState(true)

  useEffect(() => {
    if (free) {
      setAllowed(true)
      setChecked(true)
      return
    }
    if (canAccessProCourse(tier)) {
      setAllowed(true)
      setChecked(true)
      return
    }
    if (tier === 'free' && canUseProTrial(tier)) {
      incrementProTrialUsedThisMonth()
      setAllowed(true)
      setChecked(true)
      return
    }
    setAllowed(false)
    setChecked(true)
  }, [free, tier, courseId])

  const [showModal, setShowModal] = useState(false)

  if (!checked) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-white/50">
        載入中…
      </div>
    )
  }

  if (!allowed) {
    return (
      <>
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-8">
          <p className="text-white/70 text-center">
            本月 Pro 試用次數已用完，升級即可解鎖全部進階課程。
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium"
          >
            升級 Pro
          </button>
        </div>
        <UpgradeModal
          open={showModal}
          onClose={() => setShowModal(false)}
          requiredTier="premium"
          title="進階課程需 Pro 會員"
          description="本月試用次數已用完。升級 Pro 即可無限暢讀所有進階課程。"
        />
      </>
    )
  }

  return <>{children}</>
}
