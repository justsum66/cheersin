'use client'

import { useState, useEffect } from 'react'

/** PWA.2：離線時顯示頂部橫幅，提醒用戶並提供重試（重新連線後自動隱藏） */
export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const setOnline = () => setIsOnline(true)
    const setOffline = () => setIsOnline(false)
    setIsOnline(navigator.onLine)
    window.addEventListener('online', setOnline)
    window.addEventListener('offline', setOffline)
    return () => {
      window.removeEventListener('online', setOnline)
      window.removeEventListener('offline', setOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[100] py-2 px-4 bg-amber-600/95 text-white text-center text-sm font-medium safe-area-pt"
    >
      目前離線，部分功能可能無法使用；連線恢復後將自動更新。
    </div>
  )
}
