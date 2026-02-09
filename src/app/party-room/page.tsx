'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Sparkles, Wine, Gamepad2, Link2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { fireFullscreenConfetti } from '@/lib/celebration'
import { useTranslation } from '@/contexts/I18nContext'
import { useUser } from '@/contexts/UserContext'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'

const PARTY_ROOM_GAME_ID = 'party-room'
const POLL_INTERVAL_MS = 3000

interface PartyState {
  currentGameId?: string
  cheersCount: number
}

/**
 * Killer 派對房：建立/加入房間、邀請連結、房限 4/12 人、乾杯後端同步、房主選遊戲
 */
export default function PartyRoomPage() {
  const { t } = useTranslation()
  const { user } = useUser()
  const searchParams = useSearchParams()
  const roomSlugFromUrl = searchParams.get('room')

  const [roomSlug, setRoomSlug] = useState<string | null>(roomSlugFromUrl)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [inviteUrl, setInviteUrl] = useState('')
  const [playerCount, setPlayerCount] = useState(0)
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [hostId, setHostId] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [roomNotFound, setRoomNotFound] = useState(false)
  const [partyState, setPartyState] = useState<PartyState>({ cheersCount: 0 })
  const [inviteCopied, setInviteCopied] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prevPlayerCountRef = useRef(0)

  const isHost = user?.id && hostId === user.id
  const isRoomEnded = roomNotFound || (!!expiresAt && new Date(expiresAt).getTime() <= Date.now())
  const remainingMs = expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : null

  const fetchRoom = useCallback(async (slug: string) => {
    const res = await fetch(`/api/games/rooms/${slug}`)
    if (res.status === 404) {
      setRoomNotFound(true)
      setRoomId(null)
      return
    }
    if (!res.ok) return
    setRoomNotFound(false)
    const data = await res.json()
    const newCount = data.players?.length ?? 0
    if (prevPlayerCountRef.current > 0 && newCount > prevPlayerCountRef.current) {
      toast.success(t('partyRoom.playerJoined') ?? '新玩家加入')
    }
    if (prevPlayerCountRef.current > 0 && newCount < prevPlayerCountRef.current) {
      toast(t('partyRoom.playerLeft') ?? '有玩家離開', { icon: '👋' })
    }
    prevPlayerCountRef.current = newCount
    setRoomId(data.room?.id ?? null)
    setPlayerCount(newCount)
    setMaxPlayers(data.room?.maxPlayers ?? 4)
    setHostId(data.room?.hostId ?? null)
    setExpiresAt(data.room?.expiresAt ?? null)
  }, [t])

  const fetchPartyState = useCallback(async (slug: string) => {
    const res = await fetch(`/api/games/rooms/${slug}/game-state?game_id=${PARTY_ROOM_GAME_ID}`)
    if (!res.ok) return
    const data = await res.json()
    const state = (data.state as PartyState) ?? {}
    setPartyState({ currentGameId: state.currentGameId, cheersCount: state.cheersCount ?? 0 })
  }, [])

  useEffect(() => {
    if (!roomSlugFromUrl && !roomSlug) return
    const slug = roomSlug ?? roomSlugFromUrl
    if (!slug) return
    setRoomSlug(slug)
    const url = typeof window !== 'undefined' ? `${window.location.origin}/party-room?room=${slug}` : ''
    setInviteUrl(url)
    fetchRoom(slug).catch(() => setError('無法載入房間'))
    fetchPartyState(slug).catch(() => {})
  }, [roomSlugFromUrl, roomSlug, fetchRoom, fetchPartyState])

  useEffect(() => {
    if (!roomSlug) return
    const t = setInterval(() => {
      fetchRoom(roomSlug).catch(() => {})
      fetchPartyState(roomSlug).catch(() => {})
    }, POLL_INTERVAL_MS)
    return () => clearInterval(t)
  }, [roomSlug, fetchRoom, fetchPartyState])

  const [, setTick] = useState(0)
  useEffect(() => {
    if (!expiresAt || new Date(expiresAt).getTime() <= Date.now()) return
    const id = setInterval(() => setTick((n) => n + 1), 60_000)
    return () => clearInterval(id)
  }, [expiresAt])

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
          setError(data.error)
          setCreating(false)
          return
        }
        const slug = data.slug
        setRoomSlug(slug)
        setInviteUrl(data.inviteUrl ?? `${typeof window !== 'undefined' ? window.location.origin : ''}/party-room?room=${slug}`)
        setMaxPlayers(data.maxPlayers ?? 4)
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', `/party-room?room=${slug}`)
        }
        fetchRoom(slug).catch(() => {})
        fetchPartyState(slug).catch(() => {})
      })
      .catch(() => setError('建立房間失敗'))
      .finally(() => setCreating(false))
  }, [roomSlugFromUrl, roomSlug, fetchRoom, fetchPartyState])

  const handleCheers = useCallback(() => {
    if (!roomSlug) return
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate([100, 50, 100])
    }
    fireFullscreenConfetti()
    const nextCount = partyState.cheersCount + 1
    setPartyState((s) => ({ ...s, cheersCount: nextCount }))
    fetch(`/api/games/rooms/${roomSlug}/game-state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game_id: PARTY_ROOM_GAME_ID,
        payload: { currentGameId: partyState.currentGameId, cheersCount: nextCount },
      }),
    }).catch(() => setPartyState((s) => ({ ...s, cheersCount: partyState.cheersCount })))
  }, [roomSlug, partyState.cheersCount, partyState.currentGameId])

  const handleHostSelectGame = useCallback(
    (gameId: string) => {
      if (!roomSlug || !isHost) return
      fetch(`/api/games/rooms/${roomSlug}/game-state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: PARTY_ROOM_GAME_ID,
          payload: { currentGameId: gameId, cheersCount: partyState.cheersCount },
        }),
      })
        .then(() => setPartyState((s) => ({ ...s, currentGameId: gameId })))
        .catch(() => {})
    },
    [roomSlug, isHost, partyState.cheersCount]
  )

  const handleCopyInvite = useCallback(() => {
    const url = inviteUrl || (typeof window !== 'undefined' ? window.location.href : '')
    void navigator.clipboard?.writeText(url).then(() => {
      setInviteCopied(true)
      toast.success(t('common.copied') ?? '已複製', { duration: 2000 })
      setTimeout(() => setInviteCopied(false), 2000)
    })
  }, [inviteUrl, t])

  if (creating && !roomSlug) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4"
        role="status"
        aria-label={t('common.loading')}
      >
        <div className="w-10 h-10 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" aria-hidden />
        <p className="text-white/70">{t('common.loading')}</p>
        <p className="text-white/50 text-xs">正在建立派對房…</p>
      </motion.div>
    )
  }

  if (roomSlug && isRoomEnded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-8"
      >
        <div className="flex items-center gap-3 text-white/60">
          <Users className="w-12 h-12" aria-hidden />
          <Sparkles className="w-8 h-8" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-white text-center">房間已結束</h1>
        <p className="text-white/60 text-center max-w-md">
          {roomNotFound ? '此房間已關閉或不存在。' : '本房間已到期，感謝一起玩！'}
        </p>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.25 }}
          className="w-full max-w-sm rounded-xl bg-white/5 border border-white/10 p-6 space-y-4"
        >
          <p className="text-white/50 text-sm font-medium">本局統計</p>
          <div className="flex items-center justify-center gap-2 text-white/80">
            <Wine className="w-5 h-5 text-amber-400" aria-hidden />
            <span>乾杯 <strong className="text-white">{partyState.cheersCount}</strong> 次</span>
          </div>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link
              href="/party-room"
              className="min-h-[48px] px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium games-focus-ring"
            >
              建立新房間
            </Link>
            <Link
              href="/games"
              className="min-h-[48px] px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium games-focus-ring"
            >
              返回大廳
            </Link>
          </div>
        </motion.div>
        <Link href="/" className="text-white/50 hover:text-white/80 text-sm">
          {t('partyRoom.backHome')}
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-8">
      <div className="flex items-center gap-3 text-primary-400">
        <Users className="w-12 h-12" aria-hidden />
        <Sparkles className="w-8 h-8" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold text-white text-center">{t('partyRoom.title')}</h1>
      <p className="text-white/70 text-center max-w-md">{t('partyRoom.subtitle')}</p>

      {/* R2-051：等待玩家加入時顯示品牌化等待動畫（酒杯脈動） */}
      {roomSlug && roomId && isHost && playerCount < maxPlayers && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm"
          role="status"
          aria-live="polite"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            aria-hidden
          >
            <Wine className="w-5 h-5 text-amber-400" />
          </motion.div>
          <span>{t('partyRoom.waitingForPlayers') ?? '等待玩家加入…'}</span>
        </motion.div>
      )}

      {error && (
        <p className="text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm space-y-3 rounded-xl bg-white/5 border border-white/10 p-4"
      >
        <p className="text-white/60 text-sm font-medium">{t('partyRoom.roomStatus')}</p>
        <div className="flex items-center gap-2 text-white/80">
          <Users className="w-5 h-5 text-primary-400" aria-hidden />
          <span>
            {t('partyRoom.peopleCount')} <strong className="text-white tabular-nums"><AnimatedNumber value={playerCount} /></strong> / {maxPlayers} {t('partyRoom.peopleCountValue')}
          </span>
        </div>
        {remainingMs != null && remainingMs > 0 && (
          <p className="text-white/50 text-xs tabular-nums" aria-live="polite">
            剩餘 <AnimatedNumber value={Math.ceil(remainingMs / 60_000)} /> 分鐘
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {isHost && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-white/50 text-xs mr-1">房主選遊戲：</span>
              {['truth-or-dare', 'roulette', 'liar-dice'].map((gid) => (
                <motion.button
                  key={gid}
                  type="button"
                  onClick={() => handleHostSelectGame(gid)}
                  whileTap={{ scale: 0.97 }}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-sm games-focus-ring transition-colors ${
                    partyState.currentGameId === gid ? 'bg-primary-500/40 text-primary-200' : 'bg-white/10 text-white/80 hover:bg-white/15'
                  }`}
                >
                  {gid === 'truth-or-dare' ? '真心話' : gid === 'roulette' ? '轉盤' : '骰子'}
                </motion.button>
              ))}
            </div>
          )}
          {isHost ? (
            <>
              <Link
                href={`/games?room=${roomSlug}`}
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 text-sm font-medium games-focus-ring"
              >
                <Gamepad2 className="w-4 h-4" aria-hidden />
                {t('partyRoom.hostSelectGame')}
              </Link>
              {partyState.currentGameId && (
                <Link
                  href={`/games?room=${roomSlug}&game=${partyState.currentGameId}`}
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 text-sm font-medium games-focus-ring"
                >
                  {t('partyRoom.continueGames')}
                </Link>
              )}
            </>
          ) : (
            partyState.currentGameId && (
              <Link
                href={`/games?room=${roomSlug}&game=${partyState.currentGameId}`}
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 text-sm font-medium games-focus-ring"
              >
                <Gamepad2 className="w-4 h-4" aria-hidden />
                {t('partyRoom.continueGames')}
              </Link>
            )
          )}
          <motion.button
            type="button"
            onClick={handleCopyInvite}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium games-focus-ring"
            aria-label={t('partyRoom.copyInviteAria')}
          >
            <Link2 className="w-4 h-4" aria-hidden />
            {inviteCopied ? t('common.copied') : t('partyRoom.inviteLink')}
          </motion.button>
        </div>
      </motion.div>

      <motion.button
        type="button"
        onClick={handleCheers}
        whileTap={{ scale: 0.96 }}
        className="min-h-[56px] px-8 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-2 games-focus-ring transition-colors"
        aria-label={t('partyRoom.cheers')}
      >
        <Wine className="w-6 h-6" aria-hidden />
        {t('partyRoom.cheers')}
      </motion.button>
      {partyState.cheersCount > 0 && (
        <p className="text-white/60 text-sm tabular-nums">
          {t('partyRoom.cheersCount')} <AnimatedNumber value={partyState.cheersCount} />
        </p>
      )}
      <Link
        href="/games"
        className="min-h-[48px] px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors games-focus-ring"
      >
        {t('partyRoom.continueGames')}
      </Link>
      <Link href="/" className="text-white/50 hover:text-white/80 text-sm">
        {t('partyRoom.backHome')}
      </Link>
    </div>
  )
}
