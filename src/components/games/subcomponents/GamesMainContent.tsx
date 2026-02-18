'use client'

import { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { m, AnimatePresence } from 'framer-motion'
import { useGameRoom } from '@/hooks/useGameRoom'
import { getFontSize, getReduceMotion, getHapticEnabled } from '@/modules/games/settings'
import { getWeeklyPlayCounts } from '@/modules/games/stats/weekly'
import { clearLastSession } from '@/modules/games/user/history'
import { Gamepad2, Users, UserPlus, Settings, Plus, Shuffle, Crown, X, Wifi, WifiOff, WifiLow } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { useGameSound } from '@/hooks/useGameSound'
import { useTranslation } from '@/contexts/I18nContext'
import { getMaxRoomPlayers } from '@/lib/subscription'
import { useGameLogic } from '@/hooks/useGameLogic'
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
import { useCustomGames } from '@/lib/custom-games'
import { FeatureIcon } from '@/components/ui/FeatureIcon'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import GameWrapper from '@/components/games/GameWrapper'
import type { DisplayCategory } from '@/components/games/Lobby'
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
import { GamesLobbyMenu } from '@/components/games/subcomponents/GamesLobbyMenu'

const Lobby = lazy(() => import('@/components/games/Lobby').then((m) => ({ default: m.default })))

const STORAGE_KEY = 'cheersin_games_players'
const ROOM_JOINED_KEY = 'cheersin_room_joined'
const TUTORIAL_DONE_KEY = 'cheersin_games_tutorial_done'
const LOBBY_GAME_TRANSITION_MS = 300
const ROOM_HOST_KEY = 'cheersin_room_host'

interface GamesMainContentProps {
  ageVerified: boolean
  setAgeVerified: (verified: boolean) => void
  tier: string
  t: any
  customGames: any[]
  deleteGame: (id: string) => void
  freeGamesPlayedCount: number
  setFreeGamesPlayedCount: (count: number) => void
  upgradePromptDismissed: boolean
  setUpgradePromptDismissed: (dismissed: boolean) => void
  mainContentRef: React.RefObject<HTMLDivElement>
  rateModalTimeoutRef: React.RefObject<ReturnType<typeof setTimeout> | null>
  maxPlayers: number
  startGame: (gameId: string) => void
  activeGame: string | null
  setActiveGame: (game: string | null) => void
  playlists: GamePlaylist[]
  setPlaylists: (playlists: GamePlaylist[]) => void
  recentGameIds: string[]
  setRecentGameIds: (ids: string[]) => void
  weeklyPlayCounts: Record<string, number>
  setWeeklyPlayCounts: (counts: Record<string, number>) => void
  lastSession: { gameId: string; timestamp: number } | null
  setLastSession: (session: { gameId: string; timestamp: number } | null) => void
  showRestoreBanner: boolean
  setShowRestoreBanner: (show: boolean) => void
  showGuestTrialLimitModal: boolean
  setShowGuestTrialLimitModal: (show: boolean) => void
  paidLockGame: { name: string } | null
  setPaidLockGame: (game: { name: string } | null) => void
  trackStart: (playerCount: number) => void
  players: string[]
  isInRoomMode: boolean
  roomSlug: string | null
  roomPlayers: { displayName: string; isSpectator: boolean }[]
  maxRoomPlayers: number
  connectionManager: any
  router: any
  roomInviteUrl: string | null
  isRoomHost: boolean
  setRoomAnonymousMode: (anonymous: boolean) => void
  handleJoinRoom: (name: string, password?: string) => Promise<void>
  handleJoinAsSpectator: (name: string, password?: string) => Promise<void>
  handleLeaveRoom: () => void
  handleCreateRoom: () => Promise<void>
  handlePlayAgain: () => Promise<void>
  handleRandomGame: () => void
  handleStartPlaylist: (gameIds: GameId[]) => void
  joinedDisplayName: string | null
  joinedAsSpectator: boolean
  roomLoading: boolean
  roomError: string | null
  roomFull: boolean
  roomAnonymousMode: boolean
  roomRetryCooldown: boolean
  setRoomRetryCooldown: (cooldown: boolean) => void
  fetchRoom: () => Promise<void>
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
  showTutorial: boolean
  tutorialDontShowAgain: boolean
  setTutorialDontShowAgain: (dontShow: boolean) => void
  setShowTutorial: (show: boolean) => void
  searchParams: URLSearchParams
  handlePreload: () => void
  endGame: () => void
  setGameIdToRate: (id: string | null) => void
  ratingVariant: 0 | 1
  createInvite: { slug: string; inviteUrl: string } | null
  setCreateInvite: (invite: { slug: string; inviteUrl: string } | null) => void
  showPlayerModalState: boolean
  setShowPlayerModalState: (show: boolean) => void
  closePlayerModal: () => void
  gameIdToRate: string | null
  setGameIdToRateState: (id: string | null) => void
}

export function GamesMainContent({
  ageVerified,
  setAgeVerified,
  tier,
  t,
  customGames,
  deleteGame,
  freeGamesPlayedCount,
  setFreeGamesPlayedCount,
  upgradePromptDismissed,
  setUpgradePromptDismissed,
  mainContentRef,
  rateModalTimeoutRef,
  maxPlayers,
  startGame,
  activeGame,
  setActiveGame,
  playlists,
  setPlaylists,
  recentGameIds,
  setRecentGameIds,
  weeklyPlayCounts,
  setWeeklyPlayCounts,
  lastSession,
  setLastSession,
  showRestoreBanner,
  setShowRestoreBanner,
  showGuestTrialLimitModal,
  setShowGuestTrialLimitModal,
  paidLockGame,
  setPaidLockGame,
  trackStart,
  players,
  isInRoomMode,
  roomSlug,
  roomPlayers,
  maxRoomPlayers,
  connectionManager,
  router,
  roomInviteUrl,
  isRoomHost,
  setRoomAnonymousMode,
  handleJoinRoom,
  handleJoinAsSpectator,
  handleLeaveRoom,
  handleCreateRoom,
  handlePlayAgain,
  handleRandomGame,
  handleStartPlaylist,
  joinedDisplayName,
  joinedAsSpectator,
  roomLoading,
  roomError,
  roomFull,
  roomAnonymousMode,
  roomRetryCooldown,
  setRoomRetryCooldown,
  fetchRoom,
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
  showTutorial,
  tutorialDontShowAgain,
  setTutorialDontShowAgain,
  setShowTutorial,
  searchParams,
  handlePreload,
  endGame,
  setGameIdToRate,
  ratingVariant,
  createInvite,
  setCreateInvite,
  showPlayerModalState,
  setShowPlayerModalState,
  closePlayerModal,
  gameIdToRate,
  setGameIdToRateState
}: GamesMainContentProps) {
  const selectedGame = activeGame ? getGameMeta(activeGame) : undefined

  if (!ageVerified) {
    return <AgeGate onConfirm={() => setAgeVerified(true)} />
  }

  return (
    <PullToRefresh onRefresh={async () => window.location.reload()} disabled={!!activeGame}>
      <div ref={mainContentRef} tabIndex={-1} className="games-content min-h-screen pt-0 pb-16 px-4 safe-area-px overflow-hidden relative" role="main" aria-label="派對遊樂場" onPointerDown={handlePreload}>
        {/* Connection Status Indicator */}
        {roomSlug && (
          <div className="fixed top-4 right-4 z-50 md:top-6 md:right-6">
            <ConnectionStatusIndicator 
              manager={connectionManager}
              className="bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg"
            />
          </div>
        )}
        
        {/* Dynamic Background；P1-120：大廳背景氛圍 — 緩慢漸變光暈 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-500/5 rounded-full blur-[150px]" />
          <m.div
            className="absolute w-[400px] h-[400px] bg-accent-500/5 rounded-full blur-[120px]"
            animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            style={{ top: '30%', left: '50%' }}
            aria-hidden
          />
        </div>

        <div className="max-w-7xl xl:max-w-[1440px] mx-auto relative z-10">
          {/* 主內容：menu 或 game 二選一，mode="wait" 僅允許單一子節點 */}
          <AnimatePresence mode="wait">
            {!activeGame ? (
              <GamesLobbyMenu
                roomSlug={roomSlug}
                joinedDisplayName={joinedDisplayName}
                joinedAsSpectator={joinedAsSpectator}
                isInRoomMode={isInRoomMode}
                players={players}
                roomPlayers={roomPlayers}
                maxPlayers={maxPlayers}
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
                onJoin={handleJoinRoom}
                onJoinSpectator={handleJoinAsSpectator}
                recentGameIds={recentGameIds}
                weeklyPlayCounts={weeklyPlayCounts}
                playlists={playlists}
                handleStartPlaylist={handleStartPlaylist}
                setPlaylists={setPlaylists}
                searchParams={searchParams}
                startGame={startGame}
                customGames={customGames}
                deleteGame={deleteGame}
                tier={tier}
                freeGamesPlayedCount={freeGamesPlayedCount}
                upgradePromptDismissed={upgradePromptDismissed}
                setUpgradePromptDismissed={setUpgradePromptDismissed}
                lastSession={lastSession}
                setLastSession={setLastSession}
                showRestoreBanner={showRestoreBanner}
                setShowRestoreBanner={setShowRestoreBanner}
                clearLastSession={clearLastSession}
              />
            ) : activeGame && selectedGame ? (
              <GameErrorBoundary
                key={activeGame}
                gameName={selectedGame.name}
                onReset={() => setActiveGame(null)}
                title={t('gameError.title')}
                desc={t('gameError.desc')}
                retryLabel={t('gameError.retry')}
                backLobbyLabel={t('gameError.backLobby')}
              >
                <GameWrapper
                  title={selectedGame.name}
                  description={selectedGame.description}
                  onExit={() => {
                    const exitedGame = activeGame
                    endGame()

                    /** AUDIT #20：離開遊戲後評分彈窗延遲 500ms，避免與關閉動畫重疊 */
                    if (rateModalTimeoutRef.current) clearTimeout(rateModalTimeoutRef.current)
                    rateModalTimeoutRef.current = setTimeout(() => {
                      rateModalTimeoutRef.current = null
                      setGameIdToRate(exitedGame ?? null)
                    }, 500)
                    /** P0-009 / T055：試玩結束後計數並引導登入；達 3 次後下次點試玩會彈登入 modal */
                    if (!roomSlug && exitedGame && GUEST_TRIAL_GAME_IDS.includes(exitedGame)) {
                      const GUEST_TRIAL_COUNT_KEY = 'cheersin_guest_trial_count'
                      try {
                        const current = parseInt(sessionStorage.getItem(GUEST_TRIAL_COUNT_KEY) || '0', 10)
                        sessionStorage.setItem(GUEST_TRIAL_COUNT_KEY, (current + 1).toString())
                      } catch { }

                      toast(
                        (t) => (
                          <span className="flex items-center gap-2 flex-wrap">
                            <span>試玩結束，登入以開房間、保存進度</span>
                            <Link href="/login" className="underline font-medium text-primary-300 hover:text-primary-200" onClick={() => toast.dismiss(t.id)}>
                              登入
                            </Link>
                          </span>
                        ),
                        { duration: 6000 }
                      )
                    }
                  }}
                  players={players}
                  maxPlayers={isInRoomMode ? maxPlayers : undefined}
                  switchGameList={gamesWithCategory.slice(0, 8).map((g) => ({ id: g.id, name: g.name }))}
                  onSwitchGame={(id) => setActiveGame(id)}
                  currentGameId={activeGame}
                  shareInviteUrl={isInRoomMode ? (roomInviteUrl ?? (roomSlug && typeof window !== 'undefined' ? `${window.location.origin}/games?room=${roomSlug}` : null)) : undefined}
                  isSpectator={joinedAsSpectator}
                  onPlayAgain={isInRoomMode ? handlePlayAgain : undefined}
                  anonymousMode={isInRoomMode ? roomAnonymousMode : undefined}
                  isHost={isInRoomMode ? isRoomHost : undefined}
                  onToggleAnonymous={isInRoomMode && isRoomHost ? setRoomAnonymousMode as (value: boolean) => Promise<{ ok: boolean; error?: string }> : undefined}
                  reportContext={{ roomSlug: roomSlug ?? undefined, gameId: activeGame ?? undefined }}
                  isGuestTrial={!roomSlug && !!activeGame && GUEST_TRIAL_GAME_IDS.includes(activeGame)}
                  trialRoundsMax={3}
                >
                  <LazyGame gameId={activeGame} />
                </GameWrapper>
              </GameErrorBoundary>
            ) : null}
          </AnimatePresence>

          {/* P1-169：移動端浮動操作按鈕 — 創建房間、隨機遊戲 */}
          {!activeGame && (
            <GamesFab
              activeGame={activeGame}
              fabOpen={false} // This prop will be managed by parent
              setFabOpen={() => {}} // This prop will be managed by parent
              createRoomSectionRef={createRoomSectionRef}
              handleRandomGame={handleRandomGame}
              gamesWithCategory={gamesWithCategory}
            />
          )}

          {/* Render subcomponents */}
          <GamesModals
            showSettingsModal={false} // This prop will be managed by parent
            setShowSettingsModal={() => {}} // This prop will be managed by parent
            paidLockGame={paidLockGame}
            setPaidLockGame={setPaidLockGame}
            showGuestTrialLimitModal={showGuestTrialLimitModal}
            setShowGuestTrialLimitModal={setShowGuestTrialLimitModal}
            gameIdToRate={gameIdToRate}
            setGameIdToRate={setGameIdToRateState}
            ratingVariant={ratingVariant}
            createInvite={createInvite}
            setCreateInvite={setCreateInvite}
            showPlayerModal={showPlayerModalState}
            setShowPlayerModal={setShowPlayerModalState}
            closePlayerModal={closePlayerModal}
            isInRoomMode={isInRoomMode}
            players={players}
            roomPlayers={roomPlayers.map((player, index) => ({ id: `player-${index}`, displayName: player.displayName }))}
            maxPlayers={maxPlayers}
            setActiveGame={setActiveGame}
          />
        </div>
      </div>
    </PullToRefresh>
  )
}