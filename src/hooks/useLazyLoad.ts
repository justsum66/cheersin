/**
 * P2-249：使用 Intersection Observer 實現懶加載
 * 用於非首屏圖片或組件，僅在進入視口時載入，無額外依賴
 */
import type { RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'

export interface UseLazyLoadOptions {
  /** 觸發載入的邊界（root 與 target 交集比例），0~1 */
  threshold?: number
  /** rootMargin，例如 "100px" 提前 100px 開始載入 */
  rootMargin?: string
  /** 是否禁用（例如 SSR 或已載入） */
  disabled?: boolean
}

/**
 * 當元素進入視口時設為 true，用於懶加載圖片或組件
 */
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: UseLazyLoadOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0.01, rootMargin = '50px', disabled = false } = options
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (disabled || isVisible) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [disabled, isVisible, threshold, rootMargin])

  return [ref, isVisible]
}
