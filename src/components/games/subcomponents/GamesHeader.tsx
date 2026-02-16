'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

import { FeatureIcon } from '@/components/ui/FeatureIcon'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { RoomJoinForm } from '@/components/games/RoomJoinForm'
import { CreateRoomForm } from '@/components/games/CreateRoomForm'
import { ConnectionStatusIndicator } from '@/lib/games/room/connection-manager'
import { useGameRoom } from '@/hooks/useGameRoom'
import { useSubscription } from '@/hooks/useSubscription'
import { getMaxRoomPlayers } from '@/lib/subscription'
import { getGameMeta } from '@/config/games.config'
import { useTranslation } from '@/contexts/I18nContext'

import { Gamepad2, Users, UserPlus, Settings } from 'lucide-react'

interface GamesHeaderProps {
  roomSlug: string | null
  joinedDisplayName: string | null
  joinedAsSpectator: boolean
  players: string[]
  roomPlayers: { displayName: string }[]
  maxPlayers: number
  isInRoomMode: boolean
  roomLoading: boolean
  roomError: string | null
  roomFull: boolean
  roomAnonymousMode: boolean
  roomRetryCooldown: boolean
  setRoomRetryCooldown: (cooldown: boolean) => void
  fetchRoom: (slug: string) => Promise<void>
  handleJoinRoom: (name: string, password?: string) => Promise<void>
  handleJoinAsSpectator: (name: string, password?: string) => Promise<void>
  handleLeaveRoom: () => void
  handleCreateRoom: () => void
  handlePlayAgain: () => Promise<void>
  handleRandomGame: () => void
  setShowSettingsModal: (show: boolean) => void
  setShowPlayerModal: (show: boolean) => void
  setRoomCreatePassword: (password: string) => void
  setRoomCreateAnonymous: (anonymous: boolean) => void
  creatingRoom: boolean
  createRoomError: string | null
  roomCreatePassword: string
  roomCreateAnonymous: boolean
  roomJoinError: string | null
  setRoomJoinError: (error: string | null) => void
  createRoomSectionRef: React.RefObject<HTMLDivElement | null>
  activeGame: string | null
  roomInviteUrl: string | null
  isRoomHost: boolean
  setRoomAnonymousMode: (anonymous: boolean) => void
  router: ReturnType<typeof useRouter>
  onJoin: (name: string, password?: string) => Promise<void>
  onJoinSpectator: (name: string, password?: string) => Promise<void>
}

interface GamesHeaderProps {
  roomSlug: string | null
  joinedDisplayName: string | null
  joinedAsSpectator: boolean
  players: string[]
  roomPlayers: { displayName: string }[]
  maxPlayers: number
  isInRoomMode: boolean
  roomLoading: boolean
  roomError: string | null
  roomFull: boolean
  roomAnonymousMode: boolean
  roomRetryCooldown: boolean
  setRoomRetryCooldown: (cooldown: boolean) => void
  fetchRoom: (slug: string) => Promise<void>
  handleJoinRoom: (name: string, password?: string) => Promise<void>
  handleJoinAsSpectator: (name: string, password?: string) => Promise<void>
  handleLeaveRoom: () => void
  handleCreateRoom: () => void
  handlePlayAgain: () => Promise<void>
  handleRandomGame: () => void
  setShowSettingsModal: (show: boolean) => void
  setShowPlayerModal: (show: boolean) => void
  setRoomCreatePassword: (password: string) => void
  setRoomCreateAnonymous: (anonymous: boolean) => void
  creatingRoom: boolean
  createRoomError: string | null
  roomCreatePassword: string
  roomCreateAnonymous: boolean
  roomJoinError: string | null
  setRoomJoinError: (error: string | null) => void
  createRoomSectionRef: React.RefObject<HTMLDivElement | null>
  activeGame: string | null
  roomInviteUrl: string | null
  isRoomHost: boolean
  setRoomAnonymousMode: (anonymous: boolean) => void

  router: ReturnType<typeof useRouter>
  onJoin: (name: string, password?: string) => Promise<void>
  onJoinSpectator: (name: string, password?: string) => Promise<void>
}

export function GamesHeader({
  roomSlug,
  joinedDisplayName,
  joinedAsSpectator,
  players,
  roomPlayers,
  maxPlayers,
  isInRoomMode,
  roomLoading,
  roomError,
  roomFull,
  roomAnonymousMode,
  roomRetryCooldown,
  setRoomRetryCooldown,
  fetchRoom,
  handleJoinRoom,
  handleJoinAsSpectator,
  handleLeaveRoom,
  handleCreateRoom,
  handlePlayAgain,
  handleRandomGame,
  setShowSettingsModal,
  setShowPlayerModal,
  setRoomCreatePassword,
  setRoomCreateAnonymous,
  creatingRoom,
  createRoomError,
  roomCreatePassword,
  roomCreateAnonymous,
  roomJoinError,
  setRoomJoinError,
  createRoomSectionRef,
  activeGame,
  roomInviteUrl,
  isRoomHost,
  setRoomAnonymousMode,
  router,
  onJoin,
  onJoinSpectator
}: GamesHeaderProps) {
  
  const { t } = useTranslation()
  
  return (
    <div className="text-center mb-4">
      <div className="flex justify-center mb-2">
        <FeatureIcon icon={Gamepad2} size="lg" color="white" />
      </div>
      <h1 className="text-5xl md:text-7xl font-display font-bold mb-3" id="games-page-title">
        派對<span className="gradient-text">遊樂場</span>
      </h1>
      <p className="text-white/50 text-xl max-w-lg mx-auto mb-4">
        你的 AI 派對靈魂伴侶，點燃聚會氣氛。
      </p>
      <p className="text-white/30 text-xs mb-4" aria-hidden>多人同機？設定內可開啟「傳手機接力」</p>
      <p className="mb-4">
        <Link href="/script-murder" className="text-primary-400 hover:text-primary-300 text-sm underline underline-offset-2">
          酒局劇本殺 — 4–8 人秘密角色、投票懲罰
        </Link>
      </p>

      {/* P1-116：房間人數顯示 — 在房間內頂部顯示目前人數/上限 */}
      {roomSlug && joinedDisplayName && (
        <p className="mb-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-2 text-white/80 text-sm" role="status" aria-label={`房間人數 ${roomPlayers.length} ／${maxPlayers} 人`}>
          <Users className="w-4 h-4 text-primary-400" aria-hidden />
          <span>目前 {roomPlayers.length}/{maxPlayers} 人</span>
        </p>
      )}

      {/* Room: loading / error / join form；GAMES_500 #166 房間 loading skeleton */}
      {roomSlug && roomLoading && (
        <GlassCard className="mb-4 p-4 max-w-md mx-auto animate-pulse" role="status" aria-label="載入房間中">
          <div className="h-5 bg-white/10 rounded w-1/3 mb-3" />
          <div className="h-4 bg-white/10 rounded w-full mb-2" />
          <div className="h-12 bg-white/10 rounded w-full" />
        </GlassCard>
      )}
      {/* GAMES_500 #23 #29：房間不存在／slug 無效時友善錯誤頁 + 回首頁 CTA */}
      {roomSlug && !roomLoading && roomError && (
        <GlassCard className="mb-4 p-4 border-red-500/50 bg-red-500/10 text-red-300" role="alert" aria-live="assertive">
          <p>{roomError}</p>
          <p className="text-white/60 text-xs mt-1">請確認連結是否正確，或返回遊樂場使用本機名單。</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => {
                if (!roomSlug || roomRetryCooldown) return
                setRoomRetryCooldown(true)
                setTimeout(() => {
                  fetchRoom(roomSlug)
                  setRoomRetryCooldown(false)
                }, 1500)
              }}
              disabled={roomRetryCooldown}
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white"
              aria-label="重試載入房間（約 1.5 秒後）"
            >
              {roomRetryCooldown ? '重試中…' : '重試'}
            </Button>
            <Button
              type="button"
              onClick={() => router.replace('/games')}
              size="sm"
              className="bg-white/10 text-white"
              aria-label="回首頁或使用本機名單"
            >
              回首頁
            </Button>
          </div>
        </GlassCard>
      )}
      {/* AUDIT #6：加入房間表單與建立房間區塊視覺層級分明 */}
      {roomSlug && !roomLoading && !roomError && !joinedDisplayName && (
        <RoomJoinForm
          roomFull={roomFull}
          currentPlayersCount={roomPlayers.length}
          maxPlayers={maxPlayers}
          onJoin={onJoin}
          onJoinSpectator={onJoinSpectator}
          error={roomJoinError}
          setError={setRoomJoinError}
          t={t}
        />
      )}

      <div className="flex flex-wrap gap-3 justify-center items-start" ref={createRoomSectionRef}>
        <Button
          type="button"
          onClick={() => setShowSettingsModal(true)}
          variant="ghost"
          className="gap-2 rounded-full"
          leftIcon={<Settings className="w-5 h-5" />}
          aria-label="設定"
        >
          <span>設定</span>
        </Button>
        <Button
          onClick={() => setShowPlayerModal(true)}
          variant="ghost"
          className="gap-3 rounded-full"
          leftIcon={<Users className="w-5 h-5" />}
          rightIcon={<UserPlus className="w-4 h-4 text-primary-400" />}
          aria-label="管理玩家名單"
        >
          <span>管理玩家 ({players.length})</span>
        </Button>
        <CreateRoomForm
          isInRoomMode={isInRoomMode}
          activeGameId={activeGame}
          password={roomCreatePassword}
          setPassword={setRoomCreatePassword}
          isAnonymous={roomCreateAnonymous}
          setIsAnonymous={setRoomCreateAnonymous}
          isCreating={creatingRoom}
          onCreate={handleCreateRoom}
          error={createRoomError}
          currentPlayersCount={players.length}
          maxPlayers={maxPlayers}
          onLeaveRoom={isInRoomMode ? handleLeaveRoom : undefined}
        />
      </div>
      {players.length === 0 && !roomSlug && (
        <p className="text-white/40 text-sm mt-2">先新增玩家，命運轉盤等遊戲會自動帶入名單</p>
      )}
      {isInRoomMode && (
        <>
          {/* GAMES_500 #178：房間內玩家變更時 aria-live 通知 */}
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">目前 {roomPlayers.length} 位玩家</p>
          <p className="text-white/40 text-sm mt-2" role="status">
            房間模式：{joinedDisplayName}
            {joinedAsSpectator && '（觀戰中）'}
            {players.length > 0 && (
              <> · {players.slice(0, 3).join('、')}{players.length > 3 ? ` +${players.length - 3} 人` : ''}，共 {players.length} 人</>
            )}
            （名單會自動同步）
          </p>
        </>
      )}
    </div>
  )
}