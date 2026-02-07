'use client'

import { useState, useEffect, useCallback } from 'react'

/** A1-15：房間內遊戲狀態（GET/POST game-state API），供中途加入與多裝置同步 */
export interface UseGameStateResult<T = Record<string, unknown>> {
  state: T | null
  updatedAt: string | null
  isLoading: boolean
  error: string | null
  /** 更新遠端狀態（POST），成功後會更新本地 state */
  setState: (payload: T) => Promise<boolean>
  /** 手動重新拉取 */
  refetch: () => Promise<void>
}

/**
 * 取得並可更新房間內指定遊戲的 state。
 * 僅在 roomSlug 有值時會請求 API；無 roomSlug 時 state/updatedAt 為 null、setState  no-op。
 */
export function useGameState<T = Record<string, unknown>>(
  roomSlug: string | null,
  gameId: string
): UseGameStateResult<T> {
  const [state, setLocalState] = useState<T | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!!roomSlug)
  const [error, setError] = useState<string | null>(null)

  const fetchState = useCallback(async () => {
    if (!roomSlug) {
      setLocalState(null)
      setUpdatedAt(null)
      setError(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/games/rooms/${encodeURIComponent(roomSlug)}/game-state?game_id=${encodeURIComponent(gameId)}`
      )
      if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`)
      const data = (await res.json()) as { state: T | null; updatedAt: string | null }
      setLocalState(data.state ?? null)
      setUpdatedAt(data.updatedAt ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setLocalState(null)
      setUpdatedAt(null)
    } finally {
      setIsLoading(false)
    }
  }, [roomSlug, gameId])

  useEffect(() => {
    fetchState()
  }, [fetchState])

  /** T053 P0：斷線重連 — 恢復可見或網路恢復時重新拉取 state */
  useEffect(() => {
    if (!roomSlug) return
    const onReconnect = () => {
      fetchState()
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') onReconnect()
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('online', onReconnect)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('online', onReconnect)
    }
  }, [roomSlug, fetchState])

  const setState = useCallback(
    async (payload: T): Promise<boolean> => {
      if (!roomSlug) return false
      try {
        const res = await fetch(`/api/games/rooms/${encodeURIComponent(roomSlug)}/game-state`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game_id: gameId, payload }),
        })
        if (!res.ok) return false
        const data = (await res.json()) as { state?: T; updatedAt?: string }
        if (data.state != null) setLocalState(data.state as T)
        if (data.updatedAt != null) setUpdatedAt(data.updatedAt)
        return true
      } catch {
        return false
      }
    },
    [roomSlug, gameId]
  )

  return { state, updatedAt, isLoading, error, setState, refetch: fetchState }
}
