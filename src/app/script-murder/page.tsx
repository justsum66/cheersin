'use client'

/**
 * Phase 3：酒局劇本殺 — 選劇本、建立/加入房間、角色分配、章節/投票/懲罰、結束統計
 * SM-01/SM-02：拆成 ScriptMurderLobby、ScriptMurderRoom、ScriptMurderPlay、ScriptMurderEnded + useScriptMurderRoom、useScriptMurderState
 */
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { useTranslation } from '@/contexts/I18nContext'
import { useUser } from '@/contexts/UserContext'
import { useSubscription } from '@/hooks/useSubscription'
import { useCopyInvite } from '@/hooks/useCopyInvite'
import { useScriptMurderRoom } from '@/hooks/useScriptMurderRoom'
import { useScriptMurderState } from '@/hooks/useScriptMurderState'
import { usePolling } from '@/hooks/usePolling'
import { useScriptMurderRealtime } from '@/hooks/useScriptMurderRealtime'
import type { ScriptSummary, ScriptDetail } from '@/types/script-murder'
import { getErrorMessage } from '@/lib/api-response'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { ScriptMurderLobby } from './ScriptMurderLobby'
import { ScriptMurderRoom } from './ScriptMurderRoom'
import { ScriptMurderPlay } from './ScriptMurderPlay'
import { ScriptMurderEnded } from './ScriptMurderEnded'

const SCRIPT_MURDER_PLAYER_KEY = (slug: string) => `script_murder_player_${slug}`

export default function ScriptMurderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const { user } = useUser()
  const { tier } = useSubscription()
  const roomSlug = searchParams.get('room') ?? ''

  const [scripts, setScripts] = useState<ScriptSummary[]>([])
  const [scriptRooms, setScriptRooms] = useState<
    Array<{ slug: string; scriptTitle: string | null; playerCount: number; maxPlayers: number }>
  >([])
  const [loadingScripts, setLoadingScripts] = useState(true)
  const [creating, setCreating] = useState(false)

  const roomData = useScriptMurderRoom(roomSlug || null)
  const {
    room,
    players,
    scriptDetail,
    inviteUrl,
    scriptLockedMessage,
    error,
    setError,
    fetchRoom,
    joinRoom,
    displayName,
    setDisplayName,
    joined,
    joinError,
    joinLoading,
    myPlayerRowId,
    setMyPlayerRowId,
  } = roomData

  /** Lobby 專用：無 roomSlug 時 fetchScripts 失敗寫入 roomData.error */
  const lobbyError = !roomSlug ? error : null

  const getPlayerId = useCallback(() => {
    return myPlayerRowId ?? players.find((p) => p.displayName === displayName)?.id
  }, [myPlayerRowId, players, displayName])

  const stateData = useScriptMurderState(roomSlug || null, {
    room,
    getPlayerId,
    players,
    scriptDetail,
  })
  const { scriptState, fetchGameState, postScriptAction, startGame, actionLoading } = stateData

  const [myRoleId, setMyRoleId] = useState<string | null>(null)
  const [roleClueOpen, setRoleClueOpen] = useState(false)
  const [showStartConfirm, setShowStartConfirm] = useState(false)

  const getInviteUrl = useCallback(() => inviteUrl, [inviteUrl])

  const { copyInvite, copied: inviteCopied } = useCopyInvite(
    getInviteUrl,
    () => toast.success(t('scriptMurder.copied') ?? '已複製邀請連結', { duration: 2000 }),
    () => toast.error(t('scriptMurder.copyFailed'))
  )
  const isHost = !!room && !!user?.id && room.hostId === user.id
  const freeScriptLimit = tier === 'free' ? 1 : Infinity

  /** SM-03 / SM-49：離開房間，成功後清除 sessionStorage 與 myPlayerRowId 再導向大廳 */
  const handleLeave = useCallback(async () => {
    if (!roomSlug || !myPlayerRowId) return
    try {
      const res = await fetch(`/api/games/rooms/${encodeURIComponent(roomSlug)}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: myPlayerRowId }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        if (typeof window !== 'undefined') sessionStorage.removeItem(SCRIPT_MURDER_PLAYER_KEY(roomSlug))
        setMyPlayerRowId(null)
        router.push('/script-murder')
      } else {
        toast.error(getErrorMessage(data, t('scriptMurder.returnList')))
      }
    } catch {
      toast.error(t('scriptMurder.returnList'))
    }
  }, [roomSlug, myPlayerRowId, router, t, setMyPlayerRowId])

  const fetchScripts = useCallback(async () => {
    setLoadingScripts(true)
    try {
      const [scriptsRes, roomsRes] = await Promise.all([
        fetch('/api/scripts?limit=20'),
        fetch('/api/scripts/rooms?limit=10'),
      ])
      const scriptsData = await scriptsRes.json()
      const roomsData = await roomsRes.json()
      if (scriptsData.scripts) setScripts(scriptsData.scripts)
      if (roomsData.rooms)
        setScriptRooms(
          roomsData.rooms.map(
            (r: {
              slug: string
              scriptTitle: string | null
              playerCount: number
              maxPlayers: number
            }) => ({
              slug: r.slug,
              scriptTitle: r.scriptTitle,
              playerCount: r.playerCount,
              maxPlayers: r.maxPlayers,
            })
          )
        )
    } catch {
      setError(t('scriptMurder.errorLoadScripts'))
    } finally {
      setLoadingScripts(false)
    }
  }, [setError, t])

  useEffect(() => {
    if (!roomSlug) {
      fetchScripts()
    }
  }, [roomSlug, fetchScripts])

  const refetchRoomAndState = useCallback(() => {
    if (roomSlug) {
      fetchRoom(roomSlug)
      fetchGameState()
    }
  }, [roomSlug, fetchRoom, fetchGameState])
  useScriptMurderRealtime(roomSlug || null, refetchRoomAndState)
  usePolling(refetchRoomAndState, { intervalMs: 3000, enabled: !!roomSlug })

  /** SM-49：從 sessionStorage 還原已加入的 player id */
  useEffect(() => {
    if (!roomSlug || typeof window === 'undefined') return
    const stored = sessionStorage.getItem(SCRIPT_MURDER_PLAYER_KEY(roomSlug))
    if (stored) setMyPlayerRowId(stored)
  }, [roomSlug, setMyPlayerRowId])

  /** 玩家列表與 displayName 同步 myPlayerRowId，並寫入 sessionStorage */
  useEffect(() => {
    const pid = players.find((p) => p.displayName === displayName)?.id
    if (pid && !myPlayerRowId) {
      setMyPlayerRowId(pid)
      if (roomSlug && typeof window !== 'undefined') sessionStorage.setItem(SCRIPT_MURDER_PLAYER_KEY(roomSlug), pid)
    }
  }, [players, displayName, myPlayerRowId, setMyPlayerRowId, roomSlug])

  /** SM-49：若 myPlayerRowId 已不在玩家列表中則清除並移除 sessionStorage */
  useEffect(() => {
    if (!roomSlug || !myPlayerRowId || players.some((p) => p.id === myPlayerRowId)) return
    setMyPlayerRowId(null)
    if (typeof window !== 'undefined') sessionStorage.removeItem(SCRIPT_MURDER_PLAYER_KEY(roomSlug))
  }, [myPlayerRowId, players, roomSlug, setMyPlayerRowId])

  useEffect(() => {
    if (!scriptState?.assignments || !getPlayerId() || myRoleId) return
    const rid = scriptState.assignments[getPlayerId()!]
    if (rid) setMyRoleId(rid)
  }, [scriptState?.assignments, getPlayerId, myRoleId])

  const createRoom = async (scriptId: string) => {
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/games/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId }),
      })
      const data = await res.json()
      if (data.error) {
        setError(getErrorMessage(data, t('partyRoom.createFailed')))
        return
      }
      if (data.slug) {
        window.location.href = `/script-murder?room=${data.slug}`
      }
    } catch {
      setError(t('partyRoom.createFailed'))
    } finally {
      setCreating(false)
    }
  }

  if (!roomSlug) {
    return (
      <ScriptMurderLobby
        scripts={scripts}
        scriptRooms={scriptRooms}
        loadingScripts={loadingScripts}
        error={lobbyError}
        createRoom={createRoom}
        creating={creating}
        freeScriptLimit={freeScriptLimit}
        onRetry={fetchScripts}
      />
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 py-8 max-w-md mx-auto">
        {error && <p className="text-red-400 text-center">{error}</p>}
        <Link href="/script-murder" className="text-primary-400 hover:text-primary-300">
          {t('scriptMurder.returnList')}
        </Link>
      </div>
    )
  }

  if (!room.scriptRoom || !room.scriptId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 py-8 max-w-md mx-auto">
        <p className="text-white/70 text-center">{t('scriptMurder.notScriptRoom')}</p>
        <Link href="/script-murder" className="text-primary-400 hover:text-primary-300">
          {t('scriptMurder.goScriptMurder')}
        </Link>
      </div>
    )
  }

  const stateReady = scriptState != null
  const inLobby = stateReady && scriptState.phase === 'lobby'
  const inPlay = stateReady && scriptState.phase === 'play'
  const inEnded = stateReady && scriptState.phase === 'ended'

  if (!stateReady && room.scriptId) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 py-8 max-w-md mx-auto"
        role="status"
        aria-label={t('scriptMurder.loadingRoom')}
      >
        <SkeletonCard className="min-h-[140px] w-full max-w-sm" />
        <p className="text-white/50 text-sm">{t('scriptMurder.loadingRoom')}</p>
      </div>
    )
  }

  if (!scriptDetail && room.scriptId) {
    if (scriptLockedMessage) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 py-8 max-w-md mx-auto" role="status">
          <p className="text-amber-400/90 text-center max-w-sm">{scriptLockedMessage}</p>
          <Link href="/pricing" className="min-h-[48px] px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium games-focus-ring">
            {t('scriptMurder.upgradeUnlock')}
          </Link>
          <Link href="/script-murder" className="text-white/60 hover:text-white/80 text-sm">
            {t('scriptMurder.returnList')}
          </Link>
        </div>
      )
    }
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 py-8 max-w-md mx-auto"
        role="status"
        aria-label={t('scriptMurder.loadingScript')}
      >
        <SkeletonCard className="min-h-[140px] w-full max-w-sm" />
        <p className="text-white/50 text-sm">{t('scriptMurder.loadingScript')}</p>
      </div>
    )
  }

  if (inLobby) {
    return (
      <ScriptMurderRoom
        room={room}
        roomSlug={roomSlug}
        players={players}
        scriptDetail={scriptDetail}
        inviteUrl={inviteUrl}
        copyInvite={copyInvite}
        inviteCopied={inviteCopied}
        joined={joined}
        displayName={displayName}
        setDisplayName={setDisplayName}
        joinRoom={joinRoom}
        joinError={joinError}
        joinLoading={joinLoading}
        startGame={startGame}
        showStartConfirm={showStartConfirm}
        setShowStartConfirm={setShowStartConfirm}
        onLeave={handleLeave}
        myPlayerRowId={myPlayerRowId}
      />
    )
  }

  if (inEnded) {
    return (
      <ScriptMurderEnded
        scriptState={scriptState}
        scriptDetail={scriptDetail}
        roomSlug={roomSlug}
      />
    )
  }

  if (inPlay && scriptDetail) {
    const currentChapter = scriptDetail.chapters[scriptState.chapterIndex]
    const playerId = getPlayerId()
    const myRole =
      myRoleId && scriptDetail.roles.find((r) => r.id === myRoleId)
        ? {
            id: scriptDetail.roles.find((r) => r.id === myRoleId)!.id,
            roleName: scriptDetail.roles.find((r) => r.id === myRoleId)!.roleName,
            roleDescription: scriptDetail.roles.find((r) => r.id === myRoleId)!.roleDescription,
            secretClue: scriptDetail.roles.find((r) => r.id === myRoleId)!.secretClue,
          }
        : null

    if (!currentChapter) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
          <p className="text-white/50">{t('scriptMurder.loading')}</p>
        </div>
      )
    }

    return (
      <ScriptMurderPlay
        scriptState={scriptState}
        scriptDetail={scriptDetail}
        roomSlug={roomSlug}
        players={players}
        postScriptAction={postScriptAction}
        actionLoading={actionLoading}
        myRole={myRole}
        roleClueOpen={roleClueOpen}
        setRoleClueOpen={setRoleClueOpen}
        playerId={playerId}
        isHost={isHost}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 py-8 max-w-md mx-auto">
      <p className="text-white/50">{t('scriptMurder.loading')}</p>
    </div>
  )
}
