/**
 * Phase 3 Stage 2: usePersistentStorage Hook
 * Unified localStorage/sessionStorage management with type safety and validation
 */

import { useState, useEffect, useCallback, useRef } from 'react'

type StorageType = 'local' | 'session'

interface UsePersistentStorageOptions<T> {
  /** Storage type - localStorage or sessionStorage */
  storage?: StorageType
  /** Debounce delay for write operations (ms) */
  debounceMs?: number
  /** Validation function for incoming data */
  validate?: (value: unknown) => value is T
  /** Fallback value if validation fails */
  fallbackValue?: T
}

/**
 * Unified persistent storage hook that handles both localStorage and sessionStorage
 * with automatic serialization, validation, and error handling
 */
export function usePersistentStorage<T>(
  key: string,
  initialValue: T,
  options: UsePersistentStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    storage = 'local',
    debounceMs = 0,
    validate,
    fallbackValue = initialValue
  } = options

  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialValueRef = useRef(initialValue)

  // Get storage instance
  const getStorage = useCallback((): Storage | null => {
    if (typeof window === 'undefined') return null
    return storage === 'local' ? window.localStorage : window.sessionStorage
  }, [storage])

  // Safe storage operations
  const safeGetItem = useCallback((storageKey: string): string | null => {
    const storageInstance = getStorage()
    if (!storageInstance) return null
    try {
      return storageInstance.getItem(storageKey)
    } catch (error) {
      console.warn(`Failed to read from ${storage} storage:`, error)
      return null
    }
  }, [getStorage])

  const safeSetItem = useCallback((storageKey: string, value: string): void => {
    const storageInstance = getStorage()
    if (!storageInstance) return
    try {
      storageInstance.setItem(storageKey, value)
    } catch (error) {
      console.warn(`Failed to write to ${storage} storage:`, error)
    }
  }, [getStorage])

  const safeRemoveItem = useCallback((storageKey: string): void => {
    const storageInstance = getStorage()
    if (!storageInstance) return
    try {
      storageInstance.removeItem(storageKey)
    } catch (error) {
      console.warn(`Failed to remove from ${storage} storage:`, error)
    }
  }, [getStorage])

  // Hydration effect
  useEffect(() => {
    const rawValue = safeGetItem(key)
    if (rawValue !== null) {
      try {
        const parsed = JSON.parse(rawValue)
        
        // Validate if validator provided
        if (validate) {
          if (validate(parsed)) {
            setStoredValue(parsed)
          } else {
            console.warn(`Validation failed for key "${key}", using fallback value`)
            setStoredValue(fallbackValue)
            // Remove invalid data
            safeRemoveItem(key)
          }
        } else {
          setStoredValue(parsed)
        }
      } catch (error) {
        console.warn(`Failed to parse stored value for key "${key}":`, error)
        setStoredValue(fallbackValue)
      }
    }
    setIsHydrated(true)
  }, [key, validate, fallbackValue, safeGetItem, safeRemoveItem])

  // Debounced setter
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    if (!isHydrated) return

    setStoredValue(prev => {
      const nextValue = typeof value === 'function' 
        ? (value as (prev: T) => T)(prev) 
        : value

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Debounced write
      const write = () => {
        try {
          safeSetItem(key, JSON.stringify(nextValue))
        } catch (error) {
          console.warn(`Failed to serialize value for key "${key}":`, error)
        }
      }

      if (debounceMs > 0) {
        timeoutRef.current = setTimeout(write, debounceMs)
      } else {
        write()
      }

      return nextValue
    })
  }, [key, isHydrated, debounceMs, safeSetItem])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Remove value
  const removeValue = useCallback(() => {
    if (!isHydrated) return
    safeRemoveItem(key)
    setStoredValue(initialValueRef.current)
  }, [key, isHydrated, safeRemoveItem])

  return [storedValue, setValue, removeValue]
}

/**
 * Specialized hook for localStorage with common defaults
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: Omit<UsePersistentStorageOptions<T>, 'storage'> = {}
) {
  return usePersistentStorage(key, initialValue, {
    storage: 'local',
    ...options
  })
}

/**
 * Specialized hook for sessionStorage with common defaults
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options: Omit<UsePersistentStorageOptions<T>, 'storage'> = {}
) {
  return usePersistentStorage(key, initialValue, {
    storage: 'session',
    ...options
  })
}

/**
 * Hook for managing storage quotas and monitoring
 */
export function useStorageMonitor(storage: StorageType = 'local') {
  const [quotaInfo, setQuotaInfo] = useState({
    used: 0,
    remaining: 0,
    total: 0,
    isNearQuota: false
  })

  const updateQuotaInfo = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate()
        const used = estimate.usage || 0
        const total = estimate.quota || 0
        const remaining = total - used
        const isNearQuota = remaining < 1024 * 1024 // Less than 1MB remaining
        
        setQuotaInfo({
          used,
          remaining,
          total,
          isNearQuota
        })
      } catch (error) {
        console.warn('Failed to get storage estimate:', error)
      }
    }
  }, [])

  useEffect(() => {
    updateQuotaInfo()
  }, [updateQuotaInfo])

  return {
    ...quotaInfo,
    updateQuotaInfo
  }
}