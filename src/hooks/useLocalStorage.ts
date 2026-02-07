'use client'

import { useState, useCallback, useEffect } from 'react'
import { getItem, setItem, removeItem } from '@/lib/storage'

/**
 * F164 類型安全的 localStorage Hook
 * 支援 JSON 序列化、SSR 安全、同步更新
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [stored, setStored] = useState<T>(initialValue)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = getItem(key)
      if (raw != null) {
        const parsed = JSON.parse(raw) as T
        setStored(parsed)
      }
    } catch {
      /* ignore invalid JSON */
    }
    setHydrated(true)
  }, [key])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (!hydrated) return
      setStored((prev) => {
        const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value
        try {
          setItem(key, JSON.stringify(next))
        } catch {
          /* quota / private mode */
        }
        return next
      })
    },
    [key, hydrated]
  )

  const removeValue = useCallback(() => {
    if (!hydrated) return
    removeItem(key)
    setStored(initialValue)
  }, [key, initialValue, hydrated])

  return [stored, setValue, removeValue]
}
