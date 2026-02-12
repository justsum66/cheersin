'use client'

import { getErrorMessage } from '@/lib/api-response'
import { useState, useEffect, useCallback, useRef } from 'react'

/** P1-124：系統為每個玩家分配的辨識色，用於頭像、聊天等處 */
const PLAYER_COLORS = ['#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#A855F7'] as const

export interface RoomPlayer {
  id: string
  displayName: string
  orderIndex: number
  /** A1-13：是否為觀戰者（不參與遊戲） */
  isSpectator?: boolean
  /** P1-117：房主標識 — orderIndex 0 為創建者/房主 */
  isHost?: boolean
  /** P1-124：玩家辨識色（系統依 orderIndex 分配） */
  playerColor?: string
}

export interface GameRoomState {
  roomId: string | null
  slug: string | null
  players: RoomPlayer[]
  inviteUrl: string | null
  /** P0-004：匿名模式開啟時，API 已回傳玩家A/B，此處僅供 UI 開關顯示 */
  anonymousMode: boolean
  /** DC-05：房型上限、房主、過期時間，供 party-room 等使用 */
  maxPlayers: number
  hostId: string | null
  expiresAt: string | null
  loading: boolean
  error: string | null
}

/** 取得房間與玩家；加入房間；輪詢更新玩家列表 */
export function useGameRoom(slug: string | null) {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [players, setPlayers] = useState<RoomPlayer[]>([])
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [anonymousMode, setAnonymousModeState] = useState(false)
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [hostId, setHostId] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  /** DC-04：劇本殺房專用，供 useScriptMurderRoom 使用 */
  const [scriptId, setScriptId] = useState<string | null>(null)
  const [scriptRoom, setScriptRoom] = useState(false)
  const [loading, setLoading] = useState(!!slug)
  const [error, setError] = useState<string | null>(null)
  /** GAMES_500 #167：房間不存在時不重複請求 — 410/過期後 visibility 不 refetch */
  const permanentErrorSlugRef = useRef<string | null>(null)

  /** 任務 11：房間取得；失敗時重試 2 次，410/過期則設為「房間已過期」；P2-273 卸載時以 AbortController 取消請求 */
  const fetchRoom = useCallback(async (s: string, retryCount = 0, signal?: AbortSignal) => {
    const maxRetries = 2
    try {
      setError(null)
      const res = await fetch(`/api/games/rooms/${encodeURIComponent(s)}`, { signal })
      if (res.status === 410) {
        permanentErrorSlugRef.current = s
        setError('房間已過期')
        setRoomId(null)
        setPlayers([])
        setHostId(null)
        setExpiresAt(null)
        setScriptId(null)
        setScriptRoom(false)
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
          setHostId(null)
          setExpiresAt(null)
          setScriptId(null)
          setScriptRoom(false)
          setLoading(false)
          return
        }
        if (retryCount < maxRetries && !signal?.aborted) {
          await new Promise((r) => setTimeout(r, 1000 * (retryCount + 1)))
          return fetchRoom(s, retryCount + 1, signal)
        }
        throw new Error(msg)
      }
      const data = await res.json()
      const roomAnonymous = !!data.room?.anonymousMode
      setRoomId(data.room?.id ?? null)
      setAnonymousModeState(roomAnonymous)
      setMaxPlayers(data.room?.maxPlayers ?? 4)
      setHostId(data.room?.hostId ?? null)
      setExpiresAt(data.room?.expiresAt ?? null)
      setScriptId(data.room?.scriptId ?? null)
      setScriptRoom(!!data.room?.scriptRoom)
      setPlayers((data.players ?? []).map((p: { id: string; displayName: string; orderIndex: number; isSpectator?: boolean }) => ({
        id: p.id,
        displayName: p.displayName,
        orderIndex: p.orderIndex,
        isSpectator: p.isSpectator ?? false,
        isHost: p.orderIndex === 0,
        playerColor: PLAYER_COLORS[p.orderIndex % PLAYER_COLORS.length],
      })))
      setInviteUrl((prev) => prev || (data.room?.slug && typeof window !== 'undefined' ? `${window.location.origin}/games?room=${data.room.slug}` : null))
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      const msg = e instanceof Error ? e.message : 'Unknown error'
      if (retryCount < maxRetries && !signal?.aborted && /network|fetch|failed/i.test(msg)) {
        await new Promise((r) => setTimeout(r, 1000 * (retryCount + 1)))
        return fetchRoom(s, retryCount + 1, signal)
      }
      setError(msg)
      setRoomId(null)
      setPlayers([])
      setHostId(null)
      setExpiresAt(null)
      setScriptId(null)
      setScriptRoom(false)
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
      setAnonymousModeState(false)
      setMaxPlayers(4)
      setHostId(null)
      setExpiresAt(null)
      setScriptId(null)
      setScriptRoom(false)
      setError(null)
      return
    }
    if (permanentErrorSlugRef.current === slug) {
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    fetchRoom(slug, 0, controller.signal)
    return () => controller.abort()
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
        const raw = (data as { players?: { id: string; displayName: string; orderIndex: number; isSpectator?: boolean }[] }).players ?? []
        setPlayers(raw.map((p) => ({
          ...p,
          isSpectator: p.isSpectator ?? false,
          isHost: p.orderIndex === 0,
          playerColor: PLAYER_COLORS[p.orderIndex % PLAYER_COLORS.length],
        })))
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

  /** 任務 12：建立房間可選傳 4 位數密碼、P0-004 匿名模式；可傳 password 字串或 { password, anonymousMode } */
  const createRoom = useCallback(async (passwordOrOptions?: string | { password?: string; anonymousMode?: boolean }): Promise<{ slug: string; inviteUrl: string } | { error: string }> => {
    try {
      const options = typeof passwordOrOptions === 'string'
        ? { password: passwordOrOptions }
        : passwordOrOptions
      const body: { password?: string; anonymousMode?: boolean } = {}
      if (options?.password?.trim()) body.password = options.password!.trim().slice(0, 4)
      if (options?.anonymousMode === true) body.anonymousMode = true
      const res = await fetch('/api/games/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({})) as { slug?: string; inviteUrl?: string; error?: string }
      if (!res.ok) return { error: getErrorMessage(data, `HTTP ${res.status}`) }
      const url = data.inviteUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/games?room=${data.slug}`
      return { slug: data.slug!, inviteUrl: url }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Unknown error' }
    }
  }, [])

  /** P0-004：房主切換匿名模式；成功後 refetch 取得遮蔽後名單 */
  const setAnonymousMode = useCallback(async (value: boolean): Promise<{ ok: boolean; error?: string }> => {
    if (!slug) return { ok: false, error: 'No room' }
    try {
      const res = await fetch(`/api/games/rooms/${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousMode: value }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return { ok: false, error: getErrorMessage(data, `HTTP ${res.status}`) }
      setAnonymousModeState(value)
      await fetchRoom(slug)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
    }
  }, [slug, fetchRoom])

  return {
    slug,
    roomId,
    players,
    inviteUrl,
    anonymousMode,
    maxPlayers,
    hostId,
    expiresAt,
    scriptId,
    scriptRoom,
    setAnonymousMode,
    loading,
    error,
    fetchRoom,
    join,
    createRoom,
  }
}
