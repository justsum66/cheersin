'use client'

import { getErrorMessage } from '@/lib/api-response'
import { useState, useEffect, useCallback, useRef } from 'react'

export interface RoomPlayer {
  id: string
  displayName: string
  orderIndex: number
  /** A1-13：是否為觀戰者（不參與遊戲） */
  isSpectator?: boolean
}

export interface GameRoomState {
  roomId: string | null
  slug: string | null
  players: RoomPlayer[]
  inviteUrl: string | null
  loading: boolean
  error: string | null
}

/** 取得房間與玩家；加入房間；輪詢更新玩家列表 */
export function useGameRoom(slug: string | null) {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [players, setPlayers] = useState<RoomPlayer[]>([])
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!slug)
  const [error, setError] = useState<string | null>(null)
  /** GAMES_500 #167：房間不存在時不重複請求 — 410/過期後 visibility 不 refetch */
  const permanentErrorSlugRef = useRef<string | null>(null)

  /** 任務 11：房間取得；失敗時重試 2 次，410/過期則設為「房間已過期」 */
  const fetchRoom = useCallback(async (s: string, retryCount = 0) => {
    const maxRetries = 2
    try {
      setError(null)
      const res = await fetch(`/api/games/rooms/${encodeURIComponent(s)}`)
      if (res.status === 410) {
        permanentErrorSlugRef.current = s
        setError('房間已過期')
        setRoomId(null)
        setPlayers([])
        setLoading(false)
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = getErrorMessage(data, `HTTP ${res.status}`)
        if (/過期|expired|not found|不存在/i.test(String(msg))) {
          permanentErrorSlugRef.current = s
          setError('房間已過期')
          setRoomId(null)
          setPlayers([])
          setLoading(false)
          return
        }
        if (retryCount < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * (retryCount + 1)))
          return fetchRoom(s, retryCount + 1)
        }
        throw new Error(msg)
      }
      const data = await res.json()
      setRoomId(data.room?.id ?? null)
      setPlayers((data.players ?? []).map((p: { id: string; displayName: string; orderIndex: number; isSpectator?: boolean }) => ({
        id: p.id,
        displayName: p.displayName,
        orderIndex: p.orderIndex,
        isSpectator: p.isSpectator ?? false,
      })))
      setInviteUrl((prev) => prev || (data.room?.slug && typeof window !== 'undefined' ? `${window.location.origin}/games?room=${data.room.slug}` : null))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      if (retryCount < maxRetries && /network|fetch|failed/i.test(msg)) {
        await new Promise((r) => setTimeout(r, 1000 * (retryCount + 1)))
        return fetchRoom(s, retryCount + 1)
      }
      setError(msg)
      setRoomId(null)
      setPlayers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!slug) {
      permanentErrorSlugRef.current = null
      setLoading(false)
      setRoomId(null)
      setPlayers([])
      setInviteUrl(null)
      setError(null)
      return
    }
    if (permanentErrorSlugRef.current === slug) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchRoom(slug)
  }, [slug, fetchRoom])

  /** 輪詢：每 5 秒拉一次玩家列表（房間模式時可於上層呼叫） */
  useEffect(() => {
    if (!slug || !roomId) return
    const t = setInterval(() => fetchRoom(slug), 5000)
    return () => clearInterval(t)
  }, [slug, roomId, fetchRoom])

  /** 任務 11：tab 重新可見時 refetch；GAMES_500 #167 房間不存在時不重複請求 */
  useEffect(() => {
    if (!slug || typeof document === 'undefined') return
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return
      if (permanentErrorSlugRef.current === slug) return
      fetchRoom(slug)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [slug, fetchRoom])

  /** GAMES_500 #184：房間加入逾時與重試 — 15 秒逾時 */
  const JOIN_TIMEOUT_MS = 15000
  /** 任務 12：加入房間可選傳 4 位數密碼；任務 13：isSpectator 觀戰模式 */
  const join = useCallback(
    async (displayName: string, password?: string, isSpectator?: boolean): Promise<{ ok: boolean; error?: string }> => {
      if (!slug) return { ok: false, error: 'No room' }
      const name = displayName.trim()
      if (!name) return { ok: false, error: '請輸入暱稱' }
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), JOIN_TIMEOUT_MS)
      try {
        const res = await fetch(`/api/games/rooms/${encodeURIComponent(slug)}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: name,
            password: password?.trim() || undefined,
            isSpectator: isSpectator === true,
          }),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) return { ok: false, error: getErrorMessage(data, `HTTP ${res.status}`) }
        setPlayers((data as { players?: RoomPlayer[] }).players ?? [])
        return { ok: true }
      } catch (e) {
        clearTimeout(timeoutId)
        if (e instanceof Error && e.name === 'AbortError') return { ok: false, error: '連線逾時，請檢查網路後重試' }
        return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- roomId used in closure for join flow
    [slug, roomId]
  )

  /** 任務 12：建立房間可選傳 4 位數密碼（API 若支援則儲存） */
  const createRoom = useCallback(async (password?: string): Promise<{ slug: string; inviteUrl: string } | { error: string }> => {
    try {
      const res = await fetch('/api/games/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(password?.trim() ? { password: password.trim().slice(0, 4) } : {}),
      })
      const data = await res.json().catch(() => ({})) as { slug?: string; inviteUrl?: string; error?: string }
      if (!res.ok) return { error: getErrorMessage(data, `HTTP ${res.status}`) }
      const url = data.inviteUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/games?room=${data.slug}`
      return { slug: data.slug!, inviteUrl: url }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Unknown error' }
    }
  }, [])

  return {
    slug,
    roomId,
    players,
    inviteUrl,
    loading,
    error,
    fetchRoom,
    join,
    createRoom,
  }
}
