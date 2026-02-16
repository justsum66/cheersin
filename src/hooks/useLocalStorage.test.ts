/**
 * P1-38: useLocalStorage hook tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

// Mock storage module
const mockStore = new Map<string, string>()
vi.mock('@/lib/storage', () => ({
  getItem: (key: string) => mockStore.get(key) ?? null,
  setItem: (key: string, value: string) => { mockStore.set(key, value) },
  removeItem: (key: string) => { mockStore.delete(key) },
  __store: mockStore,
}))

describe('useLocalStorage', () => {
  beforeEach(() => {
    mockStore.clear()
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
