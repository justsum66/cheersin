import { useState, useCallback } from 'react'

/**
 * DEDUP #8：FAQ 手風琴共用邏輯 — 單一展開索引，回傳當前索引與切換函數
 * 供 HomeFAQAccordion、pricing FAQ 等使用，避免重複 openIndex/setOpenIndex 邏輯
 */
export function useAccordion(initialIndex: number | null = null): [number | null, (index: number) => void] {
  const [openIndex, setOpenIndex] = useState<number | null>(initialIndex)
  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }, [])
  return [openIndex, toggle]
}
