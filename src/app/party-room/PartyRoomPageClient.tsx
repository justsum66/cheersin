'use client'

/**
 * 派對房頁面：支援兩種流程
 * 1. ?room=slug（遊戲房間）：useGameRoom + PartyRoomActive + R2-130 乾杯同步
 * 2. 無 room：PartyLobby → PartyRoomManager（presence）
 */
import { useSearchParams } from 'next/navigation'
import { useGameRoom } from '@/hooks/useGameRoom'
import { usePartyRoomState } from '@/hooks/usePartyRoomState'
import { usePartyRoomGameStateRealtime } from '@/hooks/usePartyRoomGameStateRealtime'
import { useCopyInvite } from '@/hooks/useCopyInvite'
import { useSubscription } from '@/hooks/useSubscription'
import { PartyRoomActive } from './PartyRoomActive'
import { PartyRoomEnded } from './PartyRoomEnded'
import PartyRoomManager from '@/components/party/PartyRoomManager'
import { trackPartyRoomCheers } from '@/lib/game-analytics'

export default function PartyRoomPageClient() {
  const searchParams = useSearchParams()
  const roomSlug = searchParams.get('room')?.trim() ?? null
  const { tier } = useSubscription()

  /** 遊戲房間流程（?room=slug） */
  if (roomSlug) {
    return (
      <GamesRoomPartyView slug={roomSlug} tier={tier} />
    )
  }

  /** 預設：PartyRoomManager（presence 流程） */
  return <PartyRoomManager />
}

function GamesRoomPartyView({ slug, tier }: { slug: string; tier: string }) {
  const {
    roomId,
    players: roomPlayers,
    inviteUrl,
    maxPlayers,
    hostId,
    expiresAt,
    loading: roomLoading,
    error: roomError,
    fetchRoom,
  } = useGameRoom(slug)
  const { state: partyState, setState: setPartyState, refetch: refetchPartyState } = usePartyRoomState(slug)
  const { copyInvite, copied: inviteCopied } = useCopyInvite(
    () => inviteUrl ?? '',
    () => {},
    () => {}
  )

  /** R2-130：Realtime 訂閱 game_states，cheers 更新時 refetch 觸發 PartyRoomActive 動畫 */
  usePartyRoomGameStateRealtime(roomId, () => {
    refetchPartyState()
  })

  const partyStateResolved = partyState ?? { cheersCount: 0, currentGameId: undefined }

  const handleCheers = async () => {
    try {
      const res = await fetch(`/api/games/rooms/${encodeURIComponent(slug)}/cheers`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (res.ok && typeof data.cheersCount === 'number') {
        trackPartyRoomCheers(slug, data.cheersCount)
      }
      refetchPartyState()
    } catch {
      refetchPartyState()
    }
  }

  const handleHostSelectGame = async (gameId: string) => {
    await setPartyState({ ...partyStateResolved, currentGameId: gameId })
  }

  const isRoomExpired = expiresAt ? new Date(expiresAt).getTime() < Date.now() : false
  const ROOM_HOST_KEY = 'cheersin_room_host'
  const isHost = typeof window !== 'undefined' && sessionStorage.getItem(ROOM_HOST_KEY) === slug
  if (isRoomExpired || roomError) {
    return (
      <PartyRoomEnded
        roomNotFound={!!roomError}
        cheersCount={partyStateResolved.cheersCount}
      />
    )
  }

  if (roomLoading && !roomId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-white/60" role="status" aria-busy="true">
        <div className="w-10 h-10 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin mb-4" aria-hidden />
        <p>載入房間中…</p>
      </div>
    )
  }

  const players = roomPlayers.map((p) => ({
    id: p.id,
    displayName: p.displayName,
    orderIndex: p.orderIndex,
    isSpectator: p.isSpectator,
    isHost: p.orderIndex === 0,
    playerColor: ['#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'][p.orderIndex % 5],
  }))

  return (
    <PartyRoomActive
      effectiveSlug={slug}
      roomId={roomId}
      players={players}
      maxPlayers={maxPlayers}
      hostId={hostId}
      expiresAt={expiresAt}
      partyState={partyStateResolved}
      error={null}
      roomError={roomError}
      onRetry={() => fetchRoom(slug)}
      isHost={isHost}
      onCheers={handleCheers}
      onHostSelectGame={handleHostSelectGame}
      copyInvite={copyInvite}
      inviteCopied={inviteCopied}
      tier={tier}
    />
  )
}
