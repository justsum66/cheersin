'use client'

/** UX_LAYOUT_200 #147 / UX-020：網路離線提示 — 離線時顯示橫幅、上線後隱藏；文案多語 */
import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'

const Z_INDEX = 45

export function OfflineBanner() {
  const { t } = useTranslation()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsOnline(navigator.onLine)
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-[45] bg-amber-600 text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium print:hidden"
      style={{ zIndex: Z_INDEX }}
    >
      <WifiOff className="w-5 h-5 shrink-0" aria-hidden />
      {t('common.offlineMessage')}
    </div>
  )
}
