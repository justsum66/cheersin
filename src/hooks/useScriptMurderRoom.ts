'use client'

/**
 * 劇本殺房間：基於 useGameRoom(slug)，補上 scriptDetail、劇本殺專用 inviteUrl、加入表單狀態
 * DC-04：內部改用 useGameRoom，不再自實作 fetchRoom/join
 */
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from '@/contexts/I18nContext'
import { useGameRoom } from '@/hooks/useGameRoom'
import type {
  ScriptMurderRoomInfo,
  ScriptMurderPlayer,
  ScriptDetail,
} from '@/types/script-murder'

export interface UseScriptMurderRoomResult {
  room: ScriptMurderRoomInfo | null
  setRoom: React.Dispatch<React.SetStateAction<ScriptMurderRoomInfo | null>>
  players: ScriptMurderPlayer[]
  setPlayers: React.Dispatch<React.SetStateAction<ScriptMurderPlayer[]>>
  scriptDetail: ScriptDetail | null
  setScriptDetail: React.Dispatch<React.SetStateAction<ScriptDetail | null>>
  /** SM-19：劇本 locked 時 API 回傳的權限提示文案 */
  scriptLockedMessage: string | null
  inviteUrl: string
  setInviteUrl: React.Dispatch<React.SetStateAction<string>>
  error: string | null
  setError: React.Dispatch<React.SetStateAction<string | null>>
  fetchRoom: (slug: string) => Promise<void>
  joinRoom: (displayName: string) => Promise<void>
  displayName: string
  setDisplayName: React.Dispatch<React.SetStateAction<string>>
  joined: boolean
  setJoined: React.Dispatch<React.SetStateAction<boolean>>
  joinError: string | null
  setJoinError: React.Dispatch<React.SetStateAction<string | null>>
  joinLoading: boolean
  myPlayerRowId: string | null
  setMyPlayerRowId: React.Dispatch<React.SetStateAction<string | null>>
}

const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

/** 將 useGameRoom 的 RoomPlayer 轉成 ScriptMurderPlayer */
function toScriptMurderPlayers(
  players: { id: string; displayName: string; orderIndex: number }[]
): ScriptMurderPlayer[] {
  return players.map((p) => ({ id: p.id, displayName: p.displayName, orderIndex: p.orderIndex }))
}

export function useScriptMurderRoom(roomSlug: string | null): UseScriptMurderRoomResult {
  const { t } = useTranslation()
  const gameRoom = useGameRoom(roomSlug)

  const [scriptDetail, setScriptDetail] = useState<ScriptDetail | null>(null)
  /** SM-19：劇本 locked（如 18+ 未訂閱）時 API 回傳 locked: true、message，不寫入 scriptDetail */
  const [scriptLockedMessage, setScriptLockedMessage] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [joined, setJoined] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [joinLoading, setJoinLoading] = useState(false)
  const [myPlayerRowId, setMyPlayerRowId] = useState<string | null>(null)

  /** 由 useGameRoom 資料組出 ScriptMurderRoomInfo（DC-04） */
  const room: ScriptMurderRoomInfo | null = useMemo(() => {
    if (!roomSlug || !gameRoom.roomId) return null
    return {
      id: gameRoom.roomId,
      slug: roomSlug,
      hostId: gameRoom.hostId,
      maxPlayers: gameRoom.maxPlayers,
      scriptId: gameRoom.scriptId ?? null,
      scriptRoom: gameRoom.scriptRoom,
      expiresAt: gameRoom.expiresAt,
    }
  }, [roomSlug, gameRoom.roomId, gameRoom.hostId, gameRoom.maxPlayers, gameRoom.scriptId, gameRoom.scriptRoom, gameRoom.expiresAt])

  /** 劇本殺專用邀請連結：/script-murder?room= */
  const inviteUrl = gameRoom.scriptRoom && roomSlug
    ? `${baseUrl}/script-murder?room=${roomSlug}`
    : (gameRoom.inviteUrl ?? '')

  const setRoom = useCallback(() => {
    /* no-op：room 由 useGameRoom 衍生，不允許外部 set */
  }, [])
  const setInviteUrl = useCallback(() => {
    /* no-op：inviteUrl 由 slug/scriptRoom 衍生 */
  }, [])

  const players = useMemo(() => toScriptMurderPlayers(gameRoom.players), [gameRoom.players])
  const setPlayers = useCallback(() => {
    /* no-op：players 來自 useGameRoom */
  }, [])

  /** SM-49：重新整理後若 myPlayerRowId 已在玩家列表中，視為已加入，單人測試連結才會顯示 */
  useEffect(() => {
    if (myPlayerRowId && players.some((p) => p.id === myPlayerRowId)) setJoined(true)
  }, [myPlayerRowId, players])

  const error = localError ?? gameRoom.error
  const setError = setLocalError

  const fetchRoom = useCallback(
    (slug: string) => gameRoom.fetchRoom(slug),
    // gameRoom 為 object，依 gameRoom.fetchRoom 即可
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameRoom.fetchRoom]
  )

  /** 加入房間：委派 useGameRoom.join，成功後從更新後的 players 可得知自己（頁面 effect 會設 myPlayerRowId） */
  const joinRoom = useCallback(
    async (name: string) => {
      const trimmed = name.trim()
      if (!roomSlug || !trimmed) return
      if (trimmed.length < 2 || trimmed.length > 20) {
        setJoinError(t('scriptMurder.displayNameLengthError'))
        return
      }
      setJoinError(null)
      setJoinLoading(true)
      try {
        const result = await gameRoom.join(trimmed)
        if (!result.ok) {
          setJoinError(result.error ?? '加入失敗')
          return
        }
        setJoined(true)
      } finally {
        setJoinLoading(false)
      }
    },
    // gameRoom 為 object，依 gameRoom.join 即可
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roomSlug, gameRoom.join, t]
  )

  /** 有 scriptId 時拉取劇本詳情（DC-04：保留劇本殺專用邏輯） */
  useEffect(() => {
    if (!gameRoom.scriptId) {
      setScriptDetail(null)
      setScriptLockedMessage(null)
      return
    }
    let cancelled = false
    fetch(`/api/scripts/${gameRoom.scriptId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Script not found'))))
      .then((scriptData) => {
        if (cancelled) return
        if (scriptData.locked) {
          setScriptDetail(null)
          setScriptLockedMessage(typeof scriptData.message === 'string' ? scriptData.message : '此劇本需升級後遊玩')
        } else {
          setScriptLockedMessage(null)
          setScriptDetail(scriptData)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setScriptDetail(null)
          setScriptLockedMessage(null)
        }
      })
    return () => { cancelled = true }
  }, [gameRoom.scriptId])

  return {
    room,
    setRoom,
    players,
    setPlayers,
    scriptDetail,
    setScriptDetail,
    scriptLockedMessage,
    inviteUrl,
    setInviteUrl,
    error,
    setError,
    fetchRoom,
    joinRoom,
    displayName,
    setDisplayName,
    joined,
    setJoined,
    joinError,
    setJoinError,
    joinLoading,
    myPlayerRowId,
    setMyPlayerRowId,
  }
}
