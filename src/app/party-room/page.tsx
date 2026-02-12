'use client'

/**
 * Killer 派對房：建立/加入房間、邀請連結、乾杯、房主選遊戲
 * DC-05：useGameRoom(slug)；PR-16：拆成 PartyRoomLobby、PartyRoomActive、PartyRoomEnded
 * PR-25：離開房間 — 有 myPlayerRowId 時顯示離開按鈕，呼叫 POST leave 後導向大廳
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
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
import { getDisplayErrorMessage } from '@/lib/api-error-i18n'
import { trackPartyRoomCreate, trackPartyRoomJoin, trackPartyRoomCheers, trackPartyRoomSelectGame } from '@/lib/game-analytics'
import { motion } from 'framer-motion'
import { PartyRoomLobby } from './PartyRoomLobby'
import { PartyRoomActive } from './PartyRoomActive'
import { PartyRoomEnded } from './PartyRoomEnded'

const POLL_INTERVAL_MS = 2000
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
  /** PR-26：建立房間重試 — 重試時遞增以重新觸發 create effect */
  const [createRetryCount, setCreateRetryCount] = useState(0)
  /** PR-22：建立前可選人數 4/8/12（付費才可選 8/12） */
  const [selectedMaxPlayers, setSelectedMaxPlayers] = useState<4 | 8 | 12>(4)
  /** PR-35：房主結束房間 loading */
  const [endRoomLoading, setEndRoomLoading] = useState(false)
  /** PR-34：進行中房間列表（大廳時顯示入口） */
  const [activeRooms, setActiveRooms] = useState<{ slug: string; expiresAt: string; playerCount: number }[]>([])
  const prevPlayerCountRef = useRef(0)
  const reducedMotion = usePrefersReducedMotion()

  const inviteUrl = effectiveSlug && typeof window !== 'undefined' ? `${window.location.origin}/party-room?room=${effectiveSlug}` : ''
  const roomNotFound = roomError != null
  const isHost = !!(user?.id && hostId === user.id)
  const isRoomEnded = roomNotFound || (!!expiresAt && new Date(expiresAt).getTime() <= Date.now())

  useEffect(() => {
    if (roomSlugFromUrl && !roomSlug) setRoomSlug(roomSlugFromUrl)
  }, [roomSlugFromUrl, roomSlug])

  /** PR-34：大廳時拉取進行中房間列表 */
  useEffect(() => {
    if (roomSlug ?? roomSlugFromUrl) return
    fetch('/api/games/rooms?list=active&limit=10')
      .then((res) => res.ok ? res.json() : { rooms: [] })
      .then((data) => setActiveRooms(data.rooms ?? []))
      .catch(() => setActiveRooms([]))
  }, [roomSlug, roomSlugFromUrl])

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

  /** PR-26：建立房間；失敗時 setError，重試由 createRetryCount 觸發；PR-22：可傳 maxPlayers */
  const runCreateRoom = useCallback(() => {
    setCreating(true)
    setError(null)
    fetch('/api/games/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partyRoom: true, maxPlayers: selectedMaxPlayers }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(getDisplayErrorMessage(data, t, t('partyRoom.createFailed')))
          setCreating(false)
          return
        }
        const slug = data.slug
        setRoomSlug(slug)
        trackPartyRoomCreate(slug, selectedMaxPlayers)
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', `/party-room?room=${slug}`)
        }
      })
      .catch(() => setError(t('partyRoom.createFailed')))
      .finally(() => setCreating(false))
  }, [selectedMaxPlayers, t])

  /** PR-22：僅在點擊建立或重試時建立房間；有 room= query 時由 URL 還原 slug，不自動建立 */
  useEffect(() => {
    if (roomSlugFromUrl != null && roomSlugFromUrl !== '') return
    if (roomSlug != null && roomSlug !== '') return
    if (createRetryCount === 0) return
    runCreateRoom()
  }, [roomSlugFromUrl, roomSlug, createRetryCount, runCreateRoom])

  const handleCheers = useCallback(() => {
    if (!effectiveSlug) return
    if (typeof window !== 'undefined' && window.navigator?.vibrate && !reducedMotion) {
      window.navigator.vibrate([100, 50, 100])
    }
    if (!reducedMotion) fireFullscreenConfetti()
    const nextCount = (partyState.cheersCount ?? 0) + 1
    trackPartyRoomCheers(effectiveSlug, nextCount)
    partyRoomState.setState({ currentGameId: partyState.currentGameId, cheersCount: nextCount })
  }, [effectiveSlug, partyState.cheersCount, partyState.currentGameId, reducedMotion, partyRoomState])

  const handleHostSelectGame = useCallback(
    (gameId: string) => {
      if (!effectiveSlug || !isHost) return
      trackPartyRoomSelectGame(effectiveSlug, gameId)
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
        const code = (data as { error?: { code?: string } }).error?.code
        const msg =
          code === 'ROOM_FULL'
            ? t('partyRoom.roomFull')
            : code === 'INVALID_PASSWORD'
              ? t('partyRoom.wrongPassword')
              : getDisplayErrorMessage(data, t, t('partyRoom.joinError'))
        setJoinError(msg)
        setJoinLoading(false)
        return
      }
      const playerId = (data as { player?: { id?: string } }).player?.id
      if (playerId) {
        setMyPlayerRowId(playerId)
        trackPartyRoomJoin(effectiveSlug, players.length + 1)
        if (typeof window !== 'undefined') sessionStorage.setItem(PARTY_ROOM_PLAYER_KEY(effectiveSlug), playerId)
        refetchRoomAndState()
      }
      setJoinLoading(false)
    } catch {
      setJoinError(t('partyRoom.joinError'))
      setJoinLoading(false)
    }
  }, [effectiveSlug, joinDisplayName, joinPassword, players.length, refetchRoomAndState, t])

  /** PR-35：房主結束房間 — PATCH endRoom: true 後 refetch，畫面會切到 PartyRoomEnded */
  const handleEndRoom = useCallback(async () => {
    if (!effectiveSlug) return
    setEndRoomLoading(true)
    try {
      const res = await fetch(`/api/games/rooms/${effectiveSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endRoom: true }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(getDisplayErrorMessage(data, t, t('partyRoom.roomNotFoundDesc')))
        return
      }
      refetchRoomAndState()
    } catch {
      toast.error(t('common.error'))
    } finally {
      setEndRoomLoading(false)
    }
  }, [effectiveSlug, refetchRoomAndState, t])

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
        toast.error(getDisplayErrorMessage(data, t, t('partyRoom.roomNotFoundDesc')))
        return
      }
      if (typeof window !== 'undefined') sessionStorage.removeItem(PARTY_ROOM_PLAYER_KEY(effectiveSlug))
      setMyPlayerRowId(null)
      router.push('/party-room')
    } catch {
      toast.error(t('common.error'))
    }
  }, [effectiveSlug, myPlayerRowId, router, t])

  /** PR-22：尚未建立房間時顯示人數選擇 + 建立按鈕（不自動建立） */
  const canSelect12 = tier === 'basic' || tier === 'premium'
  if (!roomSlug && !roomSlugFromUrl && !creating && !error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-white text-center">{t('partyRoom.title')}</h1>
        <p className="text-white/70 text-center max-w-md">{t('partyRoom.subtitle')}</p>
        <p className="text-white/50 text-xs text-center max-w-md mt-1" role="doc-tip">{t('partyRoom.onboardingSteps')}</p>
        <div className="flex flex-col gap-2 w-full max-w-sm">
          <label className="text-sm text-white/60">{t('partyRoom.peopleCount')} / {t('partyRoom.peopleCountValue')}</label>
          <div className="flex gap-2">
            {([4, 8, 12] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSelectedMaxPlayers(n)}
                disabled={n > 4 && !canSelect12}
                className={`min-h-[48px] flex-1 rounded-xl font-medium games-focus-ring ${
                  selectedMaxPlayers === n ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/15'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {n}
              </button>
            ))}
          </div>
          {!canSelect12 && (
            <p className="text-amber-300/90 text-xs">{t('partyRoom.unlock12Players') ?? '升級可解鎖 12 人'}</p>
          )}
        </div>
        <motion.button
          type="button"
          onClick={() => { setCreateRetryCount((c) => c + 1) }}
          className="btn-primary min-h-[48px] px-8 rounded-xl font-medium games-focus-ring"
          whileTap={{ scale: 0.98 }}
        >
          {t('gamesRoom.create') ?? '建立房間'}
        </motion.button>
        {/* PR-34：進行中房間列表入口 */}
        {activeRooms.length > 0 && (
          <section className="w-full max-w-sm mt-6" aria-label={t('partyRoom.activeRooms')}>
            <h2 className="text-sm font-medium text-white/70 mb-2">{t('partyRoom.activeRooms')}</h2>
            <ul className="space-y-2">
              {activeRooms.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/party-room?room=${r.slug}`}
                    className="flex items-center justify-between min-h-[48px] px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-sm games-focus-ring"
                  >
                    <span className="font-mono text-white/80">{r.slug}</span>
                    <span className="text-white/60 text-xs">{r.playerCount} {t('partyRoom.peopleCountValue')}</span>
                    <span className="text-primary-300 font-medium">{t('partyRoom.activeRoomsJoin')}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    )
  }

  if (creating && !roomSlug) {
    return <PartyRoomLobby creating />
  }

  /** PR-26：建立房間失敗時顯示錯誤與重試（無 effectiveSlug 時 onRetry 無法重跑 create） */
  if (!effectiveSlug && error && !creating) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-8">
        <p className="text-red-400 text-sm text-center" role="alert">{error}</p>
        <motion.button
          type="button"
          onClick={() => {
            setError(null)
            setCreateRetryCount((c) => c + 1)
          }}
          className="min-h-[48px] px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium games-focus-ring"
          whileTap={{ scale: 0.98 }}
        >
          {t('error.retry') ?? '再試一次'}
        </motion.button>
        <Link href="/party-room" className="text-white/60 hover:text-white/80 text-sm">
          {t('partyRoom.backToLobby') ?? '返回大廳'}
        </Link>
      </div>
    )
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
      <div
        className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-8"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            router.push('/party-room')
          }
        }}
      >
        <h1 className="text-2xl font-bold text-white text-center">{t('partyRoom.joinRoom')}</h1>
        <p className="text-white/70 text-center max-w-md">{t('partyRoom.enterNamePlaceholder')}</p>
        <p className="text-white/50 text-xs text-center max-w-md mt-1" role="doc-tip">{t('partyRoom.onboardingSteps')}</p>
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
            onFocus={(e) => (e.target as HTMLInputElement)?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })}
            placeholder={t('partyRoom.enterNamePlaceholder')}
            className="min-h-[48px] px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 games-focus-ring"
            disabled={joinLoading}
            required
            aria-invalid={!!joinError}
            aria-describedby={joinError ? 'party-join-error' : undefined}
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
            aria-invalid={!!joinError}
            aria-describedby={joinError ? 'party-join-error' : undefined}
          />
          {joinError && (
            <p id="party-join-error" className="text-red-400 text-sm" role="alert" aria-live="assertive">
              {joinError}
            </p>
          )}
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
        if (effectiveSlug) {
          fetchRoom(effectiveSlug)
          refetchPartyState().catch(() => {})
        }
      }}
      isHost={isHost}
      onCheers={handleCheers}
      onHostSelectGame={handleHostSelectGame}
      copyInvite={copyInvite}
      inviteCopied={inviteCopied}
      tier={tier}
      myPlayerRowId={myPlayerRowId}
      onLeave={handleLeave}
      onEndRoom={isHost ? handleEndRoom : undefined}
      endRoomLoading={endRoomLoading}
    />
  )
}
