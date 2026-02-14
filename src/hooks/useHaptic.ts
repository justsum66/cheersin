/**
 * Phase 1 C4.2 / GAME-010: 統一觸覺反饋 Hook，可開關（依 games-settings）
 */
import { useCallback, useRef, useState, useEffect } from 'react'
import { getHapticEnabled, setHapticEnabled } from '@/lib/games-settings'

/** 預設震動模式（毫秒） */
export const HAPTIC_PATTERNS: Record<string, number | number[]> = {
  /** 輕微點擊 - 快速單次震動 */
  tap: 10,
  /** 一般點擊 - 標準觸覺反饋 */
  click: 30,
  /** 成功 - 雙次輕震 */
  success: [40, 30, 40],
  /** 失敗/錯誤 - 較長的單次震動 */
  error: 100,
  /** 警告 - 中等長度 */
  warning: 80,
  /** 懲罰 - 節奏感震動 */
  punishment: [80, 40, 80],
  /** 重大事件 - 強烈震動 */
  heavy: [150, 80, 150],
  /** 倒數結束 */
  timeout: 200,
  /** 輪到下一人 */
  nextTurn: 50,
}

export type HapticType = keyof typeof HAPTIC_PATTERNS

/** 檢查是否支援震動 API */
export function hasHapticSupport(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator
}

/**
 * 統一觸覺反饋 Hook；enabled 為 false 時不震動（GAME-010 可開關）
 * @returns vibrate、enabled、setEnabled、hasSupport
 */
export function useHaptic() {
  const lastVibrateRef = useRef<number>(0)
  const minIntervalMs = 50 // 防止過於頻繁的震動
  const [enabled, setEnabledState] = useState(() =>
    typeof window !== 'undefined' ? getHapticEnabled() : true
  )
  useEffect(() => {
    setEnabledState(getHapticEnabled())
  }, [])

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value)
    setHapticEnabled(value)
  }, [])

  const vibrate = useCallback((
    typeOrPattern: HapticType | number | number[] = 'click',
    force = false
  ) => {
    if (!hasHapticSupport()) return false
    if (!enabled) return false

    const now = Date.now()
    if (!force && now - lastVibrateRef.current < minIntervalMs) {
      return false
    }

    try {
      let pattern: number | number[]
      if (typeof typeOrPattern === 'string') {
        pattern = HAPTIC_PATTERNS[typeOrPattern] ?? 30
      } else {
        pattern = typeOrPattern
      }

      const result = navigator.vibrate(pattern)
      if (result) {
        lastVibrateRef.current = now
      }
      return result
    } catch {
      return false
    }
  }, [enabled])

  /** 取消當前震動 */
  const cancel = useCallback(() => {
    if (hasHapticSupport()) {
      navigator.vibrate(0)
    }
  }, [])

  return { vibrate, cancel, hasSupport: hasHapticSupport(), enabled, setEnabled }
}

