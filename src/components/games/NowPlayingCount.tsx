'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'

/** 網紅優化 #6：即時互動數據 — 顯示「N 人正在玩」增加 FOMO */
const API_URL = '/api/stats/now-playing'
const POLL_MS = 30_000

export function NowPlayingCount() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const fetchCount = () => {
      fetch(API_URL)
        .then((r) => r.json())
        .then((data) => setCount(typeof data?.count === 'number' ? data.count : 0))
        .catch(() => setCount(0))
    }
    fetchCount()
    const t = setInterval(fetchCount, POLL_MS)
    return () => clearInterval(t)
  }, [])

  if (count === null) return null
  return (
    <div className="flex items-center gap-2 text-white/60 text-sm" role="status" aria-live="polite">
      <Users className="w-4 h-4 shrink-0" aria-hidden />
      <span>
        {count > 0 ? `${count} 人正在玩` : '快來開房玩'}
      </span>
    </div>
  )
}
