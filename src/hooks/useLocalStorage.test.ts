/**
 * P1-38: useLocalStorage hook tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock storage module - factory must not reference variables declared in module scope
vi.mock('@/lib/storage', () => {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) },
    __store: store,
  }
})

import { useLocalStorage } from './useLocalStorage'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockStore = (await import('@/lib/storage') as any).__store as Map<string, string>

describe('useLocalStorage', () => {
  beforeEach(() => {
    ;(mockStore as Map<string, string>).clear()
  })

  it('returns initial value when storage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('returns stored value after hydration', async () => {
    mockStore.set('test-key', JSON.stringify('stored-val'))
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    // After hydration effect runs
    await act(async () => {})
    expect(result.current[0]).toBe('stored-val')
  })

  it('provides a setValue function', () => {
    const { result } = renderHook(() => useLocalStorage('key', 0))
    expect(typeof result.current[1]).toBe('function')
  })

  it('provides a removeValue function', () => {
    const { result } = renderHook(() => useLocalStorage('key', 0))
    expect(typeof result.current[2]).toBe('function')
  })

  it('returns array of length 3', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'val'))
    expect(result.current).toHaveLength(3)
  })
})
