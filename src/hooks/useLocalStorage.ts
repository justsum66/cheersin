'use client'

import { usePersistentStorage } from './usePersistentStorage'

/**
 * F164 類型安全的 localStorage Hook
 * 支援 JSON 序列化、SSR 安全、同步更新
 * @deprecated Use usePersistentStorage instead
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Migrate to usePersistentStorage for backward compatibility
  const [stored, setValue, removeValue] = usePersistentStorage(key, initialValue, {
    storage: 'local',
    debounceMs: 0
  })
  
  return [stored, setValue, removeValue]
}
