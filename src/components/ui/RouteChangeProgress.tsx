'use client'

/** P1-062：頁面跳轉時頂部加載進度條（NProgress 風格） */
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function RouteChangeProgress() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    setVisible(true)
    setPercent(0)
    const t1 = setTimeout(() => setPercent(70), 50)
    const t2 = setTimeout(() => setPercent(90), 200)
    const t3 = setTimeout(() => {
      setPercent(100)
      setTimeout(() => {
        setVisible(false)
        setPercent(0)
      }, 200)
    }, 400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-primary-500 transition-[width] duration-150 ease-out"
      style={{ width: `${percent}%` }}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="頁面載入中"
    />
  )
}
