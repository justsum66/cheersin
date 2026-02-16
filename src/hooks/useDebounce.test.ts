/**
 * P1-36: useDebounce hook tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce, useDebouncedCallback } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300))
    expect(result.current).toBe('hello')
  })

  it('does not update value before delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    )
    rerender({ value: 'b', delay: 300 })
    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current).toBe('a')
  })

  it('updates value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    )
    rerender({ value: 'b', delay: 300 })
    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current).toBe('b')
  })

  it('resets timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    )
    rerender({ value: 'b', delay: 300 })
    act(() => { vi.advanceTimersByTime(200) })
    rerender({ value: 'c', delay: 300 })
    act(() => { vi.advanceTimersByTime(200) })
    expect(result.current).toBe('a') // still 'a', not updated yet
    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current).toBe('c') // skipped 'b', settled on 'c'
  })
})

describe('useDebouncedCallback', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('calls function after delay', () => {
    const fn = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(fn, 200))
    act(() => { result.current('arg1') })
    expect(fn).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(200) })
    expect(fn).toHaveBeenCalledWith('arg1')
  })

  it('only calls once for rapid invocations', () => {
    const fn = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(fn, 200))
    act(() => {
      result.current('a')
      result.current('b')
      result.current('c')
    })
    act(() => { vi.advanceTimersByTime(200) })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('c')
  })

  it('cleans up timeout on unmount', () => {
    const fn = vi.fn()
    const { result, unmount } = renderHook(() => useDebouncedCallback(fn, 200))
    act(() => { result.current('test') })
    unmount()
    act(() => { vi.advanceTimersByTime(200) })
    expect(fn).not.toHaveBeenCalled()
  })
})
