'use client'

/**
 * Killer 派對房：建立/加入房間、邀請連結、乾杯、房主選遊戲
 * DC-05：useGameRoom(slug)；PR-16：拆成 PartyRoomLobby、PartyRoomActive、PartyRoomEnded
 * PR-25：離開房間 — 有 myPlayerRowId 時顯示離開按鈕，呼叫 POST leave 後導向大廳
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { fireFullscreenConfetti } from '@/lib/celebration'
import { useTranslation } from '@/contexts/I18nContext'
import { useUser } from '@/contexts/UserContext'
import { useSubscription } from '@/hooks/useSubscription'
import { useCopyInvite } from '@/hooks/useCopyInvite'
import { useGameRoom } from '@/hooks/useGameRoom'
import { usePartyRoomState } from '@/hooks/usePartyRoomState'
import { usePartyRoomRealtime } from '@/hooks/usePartyRoomRealtime'
import { usePolling } from '@/hooks/usePolling'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { getErrorMessage } from '@/lib/api-response'
import { motion } from 'framer-motion'
import { PartyRoomLobby } from './PartyRoomLobby'
import { PartyRoomActive } from './PartyRoomActive'
import { PartyRoomEnded } from './PartyRoomEnded'

const POLL_INTERVAL_MS = 3000
const PARTY_ROOM_PLAYER_KEY = (slug: string) => `party_room_player_${slug}`

export default function PartyRoomPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useUser()
  const { tier } = useSubscription()
  const searchParams = useSearchParams()
  const roomSlugFromUrl = searchParams.get('room')

  const [roomSlug, setRoomSlug] = useState<string | null>(roomSlugFromUrl)
  const effectiveSlug = roomSlug ?? roomSlugFromUrl ?? null
  /** PR-25 / 加入房間：有加入時為 player row id，用於離開按鈕；可從 sessionStorage 還原 */
  const [myPlayerRowId, setMyPlayerRowId] = useState<string | null>(null)
  /** 加入房間表單 */
  const [joinDisplayName, setJoinDisplayName] = useState('')
  const [joinPassword, setJoinPassword] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const {
    roomId,
    players,
    maxPlayers,
    hostId,
    expiresAt,
    fetchRoom,
    error: roomError,
  } = useGameRoom(effectiveSlug)

  const partyRoomState = usePartyRoomState(effectiveSlug)
  const partyState = partyRoomState.state ?? { cheersCount: 0 }
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prevPlayerCountRef = useRef(0)
  const reducedMotion = usePrefersReducedMotion()

  const inviteUrl = effectiveSlug && typeof window !== 'undefined' ? `${window.location.origin}/party-room?room=${effectiveSlug}` : ''
  const roomNotFound = roomError != null
  const isHost = !!(user?.id && hostId === user.id)
  const isRoomEnded = roomNotFound || (!!expiresAt && new Date(expiresAt).getTime() <= Date.now())

  useEffect(() => {
    if (roomSlugFromUrl && !roomSlug) setRoomSlug(roomSlugFromUrl)
  }, [roomSlugFromUrl, roomSlug])

  /** 從 sessionStorage 還原已加入的 player id；若該 id 已不在玩家列表中則清除 */
  useEffect(() => {
    if (!effectiveSlug || typeof window === 'undefined') return
    const stored = sessionStorage.getItem(PARTY_ROOM_PLAYER_KEY(effectiveSlug))
    if (stored) setMyPlayerRowId(stored)
  }, [effectiveSlug])

  useEffect(() => {
    if (!myPlayerRowId || players.length === 0) return
    const stillInRoom = players.some((p) => p.id === myPlayerRowId)
    if (!stillInRoom) {
      setMyPlayerRowId(null)
      if (typeof window !== 'undefined') sessionStorage.removeItem(PARTY_ROOM_PLAYER_KEY(effectiveSlug ?? ''))
    }
  }, [myPlayerRowId, players, effectiveSlug])

  useEffect(() => {
    if (prevPlayerCountRef.current > 0 && players.length > prevPlayerCountRef.current) {
      toast.success(t('partyRoom.playerJoined') ?? '新玩家加入')
    }
    if (prevPlayerCountRef.current > 0 && players.length < prevPlayerCountRef.current) {
      toast(t('partyRoom.playerLeft') ?? '有玩家離開', { icon: '👋' })
    }
    prevPlayerCountRef.current = players.length
  }, [players.length, t])

  const { refetch: refetchPartyState } = partyRoomState
  const refetchRoomAndState = useCallback(() => {
    if (effectiveSlug) {
      fetchRoom(effectiveSlug)
      refetchPartyState().catch(() => {})
    }
  }, [effectiveSlug, fetchRoom, refetchPartyState])
  usePartyRoomRealtime(effectiveSlug, refetchRoomAndState)
  usePolling(refetchRoomAndState, { intervalMs: POLL_INTERVAL_MS, enabled: !!effectiveSlug })

  useEffect(() => {
    if (roomSlugFromUrl != null && roomSlugFromUrl !== '') return
    if (roomSlug != null && roomSlug !== '') return
    setCreating(true)
    setError(null)
    fetch('/api/games/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partyRoom: true }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(getErrorMessage(data, '建立房間失敗'))
          setCreating(false)
          return
        }
        const slug = data.slug
        setRoomSlug(slug)
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', `/party-room?room=${slug}`)
        }
      })
      .catch(() => setError('建立房間失敗'))
      .finally(() => setCreating(false))
  }, [roomSlugFromUrl, roomSlug])

  const handleCheers = useCallback(() => {
    if (!effectiveSlug) return
    if (typeof window !== 'undefined' && window.navigator?.vibrate && !reducedMotion) {
      window.navigator.vibrate([100, 50, 100])
    }
    if (!reducedMotion) fireFullscreenConfetti()
    const nextCount = (partyState.cheersCount ?? 0) + 1
    partyRoomState.setState({ currentGameId: partyState.currentGameId, cheersCount: nextCount })
  }, [effectiveSlug, partyState.cheersCount, partyState.currentGameId, reducedMotion, partyRoomState])

  const handleHostSelectGame = useCallback(
    (gameId: string) => {
      if (!effectiveSlug || !isHost) return
      partyRoomState.setState({
        currentGameId: gameId,
        cheersCount: partyState.cheersCount ?? 0,
      })
    },
    [effectiveSlug, isHost, partyState.cheersCount, partyRoomState]
  )

  const getInviteUrl = useCallback(() => inviteUrl || (typeof window !== 'undefined' ? window.location.href : ''), [inviteUrl])
  const { copyInvite, copied: inviteCopied } = useCopyInvite(getInviteUrl, () => toast.success(t('common.copied') ?? '已複製', { duration: 2000 }))

  /** 加入房間 — 呼叫 POST join，成功後存 myPlayerRowId 與 sessionStorage */
  const handleJoin = useCallback(async () => {
    if (!effectiveSlug || !joinDisplayName.trim()) return
    setJoinLoading(true)
    setJoinError(null)
    try {
      const res = await fetch(`/api/games/rooms/${effectiveSlug}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: joinDisplayName.trim().slice(0, 20),
          ...(joinPassword.trim() ? { password: joinPassword.trim() } : {}),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setJoinError(getErrorMessage(data, t('partyRoom.joinError')))
        setJoinLoading(false)
        return
      }
      const playerId = (data as { player?: { id?: string } }).player?.id
      if (playerId) {
        setMyPlayerRowId(playerId)
        if (typeof window !== 'undefined') sessionStorage.setItem(PARTY_ROOM_PLAYER_KEY(effectiveSlug), playerId)
        refetchRoomAndState()
      }
      setJoinLoading(false)
    } catch {
      setJoinError(t('partyRoom.joinError'))
      setJoinLoading(false)
    }
  }, [effectiveSlug, joinDisplayName, joinPassword, refetchRoomAndState, t])

  /** PR-25：離開房間 — 清除 sessionStorage 後導向 /party-room */
  const handleLeave = useCallback(async () => {
    if (!effectiveSlug || !myPlayerRowId) return
    try {
      const res = await fetch(`/api/games/rooms/${effectiveSlug}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: myPlayerRowId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(getErrorMessage(data, t('partyRoom.roomNotFoundDesc')))
        return
      }
      if (typeof window !== 'undefined') sessionStorage.removeItem(PARTY_ROOM_PLAYER_KEY(effectiveSlug))
      setMyPlayerRowId(null)
      router.push('/party-room')
    } catch {
      toast.error(t('common.error'))
    }
  }, [effectiveSlug, myPlayerRowId, router, t])

  if (creating && !roomSlug) {
    return <PartyRoomLobby creating />
  }

  if (effectiveSlug && isRoomEnded) {
    return (
      <PartyRoomEnded
        roomNotFound={roomNotFound}
        cheersCount={partyState.cheersCount ?? 0}
      />
    )
  }

  /** 有房間 slug 且已載入房間、未結束，但尚未加入 → 顯示加入表單 */
  const needJoin = effectiveSlug && roomId && !isRoomEnded && !myPlayerRowId
  if (needJoin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-white text-center">{t('partyRoom.joinRoom')}</h1>
        <p className="text-white/70 text-center max-w-md">{t('partyRoom.enterNamePlaceholder')}</p>
        <form
          className="flex flex-col gap-4 w-full max-w-sm"
          onSubmit={(e) => {
            e.preventDefault()
            void handleJoin()
          }}
        >
          <label className="text-sm text-white/60" htmlFor="party-join-displayName">
            {t('partyRoom.displayName')}
          </label>
          <input
            id="party-join-displayName"
            type="text"
            maxLength={20}
            value={joinDisplayName}
            onChange={(e) => setJoinDisplayName(e.target.value)}
            placeholder={t('partyRoom.enterNamePlaceholder')}
            className="min-h-[48px] px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 games-focus-ring"
            disabled={joinLoading}
            required
          />
          <label className="text-sm text-white/60" htmlFor="party-join-password">
            {t('partyRoom.roomPassword')}
          </label>
          <input
            id="party-join-password"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={joinPassword}
            onChange={(e) => setJoinPassword(e.target.value)}
            className="min-h-[48px] px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 games-focus-ring"
            disabled={joinLoading}
          />
          {joinError && <p className="text-red-400 text-sm" role="alert">{joinError}</p>}
          <motion.button
            type="submit"
            disabled={joinLoading || !joinDisplayName.trim()}
            className="btn-primary min-h-[48px] px-6 rounded-xl font-medium games-focus-ring disabled:opacity-50"
            whileTap={{ scale: 0.98 }}
          >
            {joinLoading ? t('partyRoom.joining') : t('partyRoom.joinButton')}
          </motion.button>
        </form>
      </div>
    )
  }

  return (
    <PartyRoomActive
      effectiveSlug={effectiveSlug}
      roomId={roomId}
      players={players}
      maxPlayers={maxPlayers}
      hostId={hostId}
      expiresAt={expiresAt}
      partyState={partyState}
      error={error}
      roomError={roomError}
      onRetry={() => {
        setError(null)
        if (effectiveSlug) fetchRoom(effectiveSlug)
      }}
      isHost={isHost}
      onCheers={handleCheers}
      onHostSelectGame={handleHostSelectGame}
      copyInvite={copyInvite}
      inviteCopied={inviteCopied}
      tier={tier}
      myPlayerRowId={myPlayerRowId}
      onLeave={handleLeave}
    />
  )
}
