/**
 * P1-37: useThrottle hook tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useThrottle } from './useThrottle'

describe('useThrottle', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('calls function immediately on first invocation', () => {
    const fn = vi.fn()
    const { result } = renderHook(() => useThrottle(fn, 500))
    act(() => { result.current() })
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('throttles subsequent calls within interval', () => {
    const fn = vi.fn()
    const { result } = renderHook(() => useThrottle(fn, 500))
    act(() => {
      result.current()
      result.current()
      result.current()
    })
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('executes trailing call after interval', () => {
    const fn = vi.fn()
    const { result } = renderHook(() => useThrottle(fn, 500))
    act(() => {
      result.current() // immediate
      result.current() // queued trailing
    })
    expect(fn).toHaveBeenCalledTimes(1)
    act(() => { vi.advanceTimersByTime(500) })
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('allows new call after interval expires', () => {
    const fn = vi.fn()
    const { result } = renderHook(() => useThrottle(fn, 200))
    act(() => { result.current() })
    expect(fn).toHaveBeenCalledTimes(1)
    act(() => { vi.advanceTimersByTime(200) })
    act(() => { result.current() })
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
