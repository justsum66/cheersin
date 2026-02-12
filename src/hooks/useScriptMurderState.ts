'use client'

/**
 * 劇本殺遊戲狀態：基於 useGameState(slug, 'script_murder')，封裝 initScriptState、startGame、postScriptAction
 * DC-06：GET/POST game-state 委派 useGameState；script-murder 動作仍走 /script-murder API 後 refetch
 * SM-12：postScriptAction 樂觀更新保留；失敗時 rollback 並 refetch
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useGameState } from '@/hooks/useGameState'
import type { ScriptState, ScriptMurderRoomInfo, ScriptMurderPlayer, ScriptDetail } from '@/types/script-murder'

const SCRIPT_MURDER_GAME_ID = 'script_murder'

export interface UseScriptMurderStateOptions {
  room: ScriptMurderRoomInfo | null
  getPlayerId: () => string | undefined
  players: ScriptMurderPlayer[]
  scriptDetail: ScriptDetail | null
}

export interface UseScriptMurderStateResult {
  scriptState: ScriptState | null
  setScriptState: React.Dispatch<React.SetStateAction<ScriptState | null>>
  fetchGameState: () => Promise<void>
  postScriptAction: (action: 'advance' | 'vote' | 'punishment_done', option?: string) => Promise<void>
  initScriptState: () => Promise<void>
  startGame: () => Promise<boolean>
  initializing: boolean
  stateFetched: boolean
  actionLoading: boolean
}

export function useScriptMurderState(
  roomSlug: string | null,
  options: UseScriptMurderStateOptions
): UseScriptMurderStateResult {
  const { room, getPlayerId, players, scriptDetail } = options

  const { state: baseState, setState: setGameState, refetch, isLoading } = useGameState<ScriptState>(
    roomSlug,
    SCRIPT_MURDER_GAME_ID
  )

  /** 與 useGameState 同步：baseState 為來源，樂觀更新時用 scriptState 覆蓋顯示 */
  const [optimisticState, setOptimisticState] = useState<ScriptState | null>(null)
  const scriptState = optimisticState ?? baseState

  const [initializing, setInitializing] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const stateFetched = !roomSlug || !isLoading
  const scriptStateRef = useRef<ScriptState | null>(null)
  useEffect(() => {
    scriptStateRef.current = scriptState
  }, [scriptState])

  const fetchGameState = useCallback(() => refetch(), [refetch])

  const initScriptState = useCallback(async () => {
    if (!roomSlug || !room?.scriptId || initializing) return
    setInitializing(true)
    const payload: ScriptState = {
      scriptId: room.scriptId,
      phase: 'lobby',
      chapterIndex: 0,
      assignments: {},
    }
    try {
      const ok = await setGameState(payload)
      if (ok) await refetch()
    } finally {
      setInitializing(false)
    }
  }, [roomSlug, room?.scriptId, initializing, setGameState, refetch])

  useEffect(() => {
    if (!roomSlug || !room?.scriptId || !stateFetched || baseState != null || initializing) return
    initScriptState()
  }, [roomSlug, room?.scriptId, stateFetched, baseState, initializing, initScriptState])

  /** SM-12：樂觀更新；失敗 rollback 並 refetch */
  const postScriptAction = useCallback(
    async (action: 'advance' | 'vote' | 'punishment_done', option?: string) => {
      if (!roomSlug || actionLoading) return
      const pid = getPlayerId()
      const prev = scriptStateRef.current
      if (!prev) return
      setActionLoading(true)
      if (action === 'vote' && pid != null && option !== undefined) {
        setOptimisticState((s) => ({
          ...(s ?? prev)!,
          votes: { ...(s?.votes ?? prev?.votes ?? {}), [pid]: option },
        }))
      } else if (action === 'punishment_done') {
        setOptimisticState((s) => (s ?? prev ? { ...(s ?? prev), punishmentDone: true } : null))
      } else if (action === 'advance') {
        setOptimisticState((s) =>
          s ?? prev
            ? {
                ...(s ?? prev)!,
                chapterIndex: ((s ?? prev)!.chapterIndex ?? 0) + 1,
                votes: {},
                punishmentDone: false,
              }
            : null
        )
      }
      try {
        const body: { action: string; playerId?: string; option?: string } = { action }
        if (action === 'vote' && pid != null && option !== undefined) {
          body.playerId = pid
          body.option = option
        }
        const res = await fetch(`/api/games/rooms/${encodeURIComponent(roomSlug)}/script-murder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (data.state) {
          setOptimisticState(null)
          await refetch()
        }
        if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`)
      } catch {
        setOptimisticState(null)
        await refetch()
      } finally {
        setActionLoading(false)
      }
    },
    [roomSlug, getPlayerId, actionLoading, refetch]
  )

  const startGame = useCallback(async (): Promise<boolean> => {
    if (!roomSlug || !scriptDetail || !room?.scriptId || players.length === 0) return false
    const roleIds = scriptDetail.roles.map((r) => r.id)
    const playerIds = players.map((p) => p.id)
    if (playerIds.length > roleIds.length) return false
    const shuffled = [...roleIds].sort(() => Math.random() - 0.5)
    const assignments: Record<string, string> = {}
    playerIds.forEach((pid, i) => {
      assignments[pid] = shuffled[i]
    })
    const totalChapters = scriptDetail.chapters.length
    const payload: ScriptState = {
      scriptId: room.scriptId,
      phase: 'play',
      chapterIndex: 0,
      assignments,
      totalChapters,
    }
    const ok = await setGameState(payload)
    if (ok) await refetch()
    return ok
  }, [roomSlug, room?.scriptId, scriptDetail, players, setGameState, refetch])

  const setScriptState = useCallback((arg: React.SetStateAction<ScriptState | null>) => {
    setOptimisticState((prev) => (typeof arg === 'function' ? arg(prev ?? null) : arg))
  }, [])

  return {
    scriptState,
    setScriptState,
    fetchGameState,
    postScriptAction,
    initScriptState,
    startGame,
    initializing,
    stateFetched,
    actionLoading,
  }
}
