'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { useGameRoom } from '@/hooks/useGameRoom'
import { useSubscription } from '@/hooks/useSubscription'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameLogic } from '@/hooks/useGameLogic'
import { useCustomGames } from '@/lib/custom-games'
import { getFontSize, getReduceMotion, getHapticEnabled } from '@/modules/games/settings'
import { getWeeklyPlayCounts } from '@/modules/games/stats/weekly'
import { clearLastSession } from '@/modules/games/user/history'
import { Gamepad2, Users, UserPlus, Settings, Plus, Shuffle, Crown, X, Wifi, WifiOff, WifiLow } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { getMaxRoomPlayers } from '@/lib/subscription'
import { LazyGame } from '@/components/games/GameLazyMap'
import { gamesWithCategory, getGameMeta, GUEST_TRIAL_GAME_IDS, type GameId } from '@/config/games.config'
import type { GamePlaylist } from '@/modules/games/data/playlists'
import { isFreeGame, canPlayGame, getWeeklyFreeGameIds } from '@/modules/games/stats/weekly-free'
import { getActiveLaunchAnnouncements } from '@/config/announcements.config'
import { STORAGE_KEYS } from '@/lib/constants'
import { useGameRoomConnection, ConnectionStatusIndicator } from '@/lib/games/room/connection-manager'
import toast from 'react-hot-toast'
import { getLastSessionGameId } from '@/modules/games/user/history'
import { migrateGameStats } from '@/lib/migrations/game-stats-migration'

import { FeatureIcon } from '@/components/ui/FeatureIcon'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import GameErrorBoundary from '@/components/games/GameErrorBoundary'
import { RoomJoinForm } from '@/components/games/RoomJoinForm'
import { CreateRoomForm } from '@/components/games/CreateRoomForm'
import AgeGate from '@/components/AgeGate'
import { getAgeGatePassed } from '@/components/AgeGate'
import { PullToRefresh } from '@/components/PullToRefresh'
import { GamesHeader } from '@/components/games/subcomponents/GamesHeader'
import { GamesTutorial } from '@/components/games/subcomponents/GamesTutorial'
import { GamesUpgradePrompts } from '@/components/games/subcomponents/GamesUpgradePrompts'
import { GamesFab } from '@/components/games/subcomponents/GamesFab'
import { GamesModals } from '@/components/games/subcomponents/GamesModals'
import Lobby from '@/components/games/Lobby'

const STORAGE_KEY = 'cheersin_games_players'
const ROOM_JOINED_KEY = 'cheersin_room_joined'
const TUTORIAL_DONE_KEY = 'cheersin_games_tutorial_done'
const LOBBY_GAME_TRANSITION_MS = 300

interface GamesLobbyMenuProps {
  roomSlug: string | null
  joinedDisplayName: string | null
  joinedAsSpectator: boolean
  isInRoomMode: boolean
  players: string[]
  roomPlayers: { displayName: string; isSpectator: boolean }[]
  maxPlayers: number
  roomLoading: boolean
  roomError: string | null
  roomFull: boolean
  roomAnonymousMode: boolean
  roomRetryCooldown: boolean
  setRoomRetryCooldown: (cooldown: boolean) => void
  fetchRoom: () => Promise<void>
  handleJoinRoom: (name: string, password?: string) => Promise<void>
  handleJoinAsSpectator: (name: string, password?: string) => Promise<void>
  handleLeaveRoom: () => void
  handleCreateRoom: () => Promise<void>
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
  createRoomSectionRef: React.RefObject<HTMLDivElement>
  activeGame: string | null
  roomInviteUrl: string | null
  isRoomHost: boolean
  setRoomAnonymousMode: (anonymous: boolean) => void
  router: ReturnType<typeof useRouter>
  onJoin: (name: string, password?: string) => Promise<void>
  onJoinSpectator: (name: string, password?: string) => Promise<void>
  recentGameIds: string[]
  weeklyPlayCounts: Record<string, number>
  playlists: GamePlaylist[]
  handleStartPlaylist: (gameIds: GameId[]) => void
  setPlaylists: (playlists: GamePlaylist[]) => void
  searchParams: URLSearchParams
  startGame: (gameId: string) => void
  customGames: any[]
  deleteGame: (id: string) => void
  tier: string
  freeGamesPlayedCount: number
  upgradePromptDismissed: boolean
  setUpgradePromptDismissed: (dismissed: boolean) => void
  lastSession: { gameId: string; timestamp: number } | null
  setLastSession: (session: { gameId: string; timestamp: number } | null) => void
  showRestoreBanner: boolean
  setShowRestoreBanner: (show: boolean) => void
  clearLastSession: () => void
}

export function GamesLobbyMenu({
  roomSlug,
  joinedDisplayName,
  joinedAsSpectator,
  isInRoomMode,
  players,
  roomPlayers,
  maxPlayers,
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
  onJoinSpectator,
  recentGameIds,
  weeklyPlayCounts,
  playlists,
  handleStartPlaylist,
  setPlaylists,
  searchParams,
  startGame,
  customGames,
  deleteGame,
  tier,
  freeGamesPlayedCount,
  upgradePromptDismissed,
  setUpgradePromptDismissed,
  lastSession,
  setLastSession,
  showRestoreBanner,
  setShowRestoreBanner,
  clearLastSession
}: GamesLobbyMenuProps) {
  return (
    <m.div
      key="menu"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: LOBBY_GAME_TRANSITION_MS / 1000 }}
    >
      <GamesTutorial
        showTutorial={false} // This prop will be managed by parent
        roomSlug={roomSlug}
        joinedDisplayName={joinedDisplayName}
        tutorialDontShowAgain={false} // This prop will be managed by parent
        setTutorialDontShowAgain={() => {}} // This prop will be managed by parent
        setShowTutorial={() => {}} // This prop will be managed by parent
      />

      <GamesHeader
        roomSlug={roomSlug}
        joinedDisplayName={joinedDisplayName}
        joinedAsSpectator={joinedAsSpectator}
        players={players}
        roomPlayers={roomPlayers}
        maxPlayers={maxPlayers}
        isInRoomMode={isInRoomMode}
        roomLoading={roomLoading}
        roomError={roomError}
        roomFull={roomFull}
        roomAnonymousMode={roomAnonymousMode}
        roomRetryCooldown={roomRetryCooldown}
        setRoomRetryCooldown={setRoomRetryCooldown}
        fetchRoom={fetchRoom}
        handleJoinRoom={handleJoinRoom}
        handleJoinAsSpectator={handleJoinAsSpectator}
        handleLeaveRoom={handleLeaveRoom}
        handleCreateRoom={handleCreateRoom}
        handlePlayAgain={handlePlayAgain}
        handleRandomGame={handleRandomGame}
        setShowSettingsModal={setShowSettingsModal}
        setShowPlayerModal={setShowPlayerModal}
        setRoomCreatePassword={setRoomCreatePassword}
        setRoomCreateAnonymous={setRoomCreateAnonymous}
        creatingRoom={creatingRoom}
        createRoomError={createRoomError}
        roomCreatePassword={roomCreatePassword}
        roomCreateAnonymous={roomCreateAnonymous}
        roomJoinError={roomJoinError}
        setRoomJoinError={setRoomJoinError}
        createRoomSectionRef={createRoomSectionRef}
        activeGame={activeGame}
        roomInviteUrl={roomInviteUrl}
        isRoomHost={isRoomHost}
        setRoomAnonymousMode={setRoomAnonymousMode}
        router={router}
        onJoin={onJoin}
        onJoinSpectator={onJoinSpectator}
      />

      <GamesUpgradePrompts
        roomSlug={roomSlug}
        joinedDisplayName={joinedDisplayName}
        tier={tier}
        freeGamesPlayedCount={freeGamesPlayedCount}
        upgradePromptDismissed={upgradePromptDismissed}
        setUpgradePromptDismissed={setUpgradePromptDismissed}
        lastSession={lastSession}
        setLastSession={setLastSession}
        showRestoreBanner={showRestoreBanner}
        setShowRestoreBanner={setShowRestoreBanner}
        clearLastSession={clearLastSession}
        startGame={startGame}
      />
      {/* Game Grid — hide when room slug but not joined yet */}
      {(!roomSlug || joinedDisplayName) && (
        <Lobby
          games={gamesWithCategory}
          recentGameIds={recentGameIds}
          weeklyPlayCounts={weeklyPlayCounts}
          weeklyFreeGameIds={getWeeklyFreeGameIds()}
          displayFilter={'classic' as any} // Will be passed from parent
          onDisplayFilterChange={() => {}} // Will be handled by parent
          playlists={playlists}
          onStartPlaylist={handleStartPlaylist}
          onSavePlaylists={setPlaylists}
          initialSearchQuery={searchParams.get('q') ?? ''}
          onSelect={(id: string) => {
            // Check if custom game
            if (id.startsWith('custom_')) {
              router.push(`/games/custom/${id}`)
            } else {
              startGame(id)
            }
          }}
          customGames={customGames}
          onDeleteCustomGame={deleteGame}
        />
      )}
    </m.div>
  )
}