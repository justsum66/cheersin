'use client'

/** UX_LAYOUT_200 #106：數字輸入不依賴 scroll 改變值 — 防止滾輪誤觸改變 number input */
import { useCallback } from 'react'

export function usePreventNumberScroll() {
  return useCallback((e: React.WheelEvent<HTMLInputElement>) => {
    if ((e.target as HTMLInputElement).type === 'number') {
      (e.target as HTMLInputElement).blur()
    }
  }, [])
}

/** 用於 number input 的 onWheel：在 focus 時阻止滾輪改變值 */
export function preventNumberScrollOnWheel(e: React.WheelEvent<HTMLInputElement>) {
  const el = e.currentTarget
  if (el.type === 'number') {
    e.preventDefault()
  }
}
