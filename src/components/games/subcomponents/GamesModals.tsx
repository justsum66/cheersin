'use client'

import { m, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, Crown } from 'lucide-react'

import { PaidGameLock } from '@/components/games/PaidGameLock'
import { GameRatingModal } from '@/components/games/GameRatingModal'
import { InviteModal } from '@/components/games/InviteModal'
import { PlayerManagementModal } from '@/components/games/PlayerManagementModal'
import SettingsModal from '@/components/games/SettingsModal'

interface GamesModalsProps {
  showSettingsModal: boolean
  setShowSettingsModal: (show: boolean) => void
  paidLockGame: { name: string } | null
  setPaidLockGame: (game: { name: string } | null) => void
  showGuestTrialLimitModal: boolean
  setShowGuestTrialLimitModal: (show: boolean) => void
  gameIdToRate: string | null
  setGameIdToRate: (id: string | null) => void
  ratingVariant: 0 | 1
  createInvite: { slug: string; inviteUrl: string } | null
  setCreateInvite: (invite: { slug: string; inviteUrl: string } | null) => void
  showPlayerModal: boolean
  setShowPlayerModal: (show: boolean) => void
  closePlayerModal: () => void
  isInRoomMode: boolean
  players: string[]
  roomPlayers: { id: string; displayName: string }[]
  maxPlayers: number
  setActiveGame: (game: string | null) => void
}

export function GamesModals({
  showSettingsModal,
  setShowSettingsModal,
  paidLockGame,
  setPaidLockGame,
  showGuestTrialLimitModal,
  setShowGuestTrialLimitModal,
  gameIdToRate,
  setGameIdToRate,
  ratingVariant,
  createInvite,
  setCreateInvite,
  showPlayerModal,
  setShowPlayerModal,
  closePlayerModal,
  isInRoomMode,
  players,
  roomPlayers,
  maxPlayers,
  setActiveGame
}: GamesModalsProps) {
  return (
    <>
      {/* Settings Modal：獨立 AnimatePresence，不與 mode="wait" 混用 */}
      <AnimatePresence>
        {showSettingsModal && (
          <SettingsModal key="settings-modal" onClose={() => setShowSettingsModal(false)} />
        )}
      </AnimatePresence>

      {/* R2-191：付費遊戲未訂閱時顯示付費牆 */}
      <AnimatePresence>
        {paidLockGame && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          >
            <PaidGameLock
              gameName={paidLockGame.name}
              requiredTier="premium"
              onClose={() => setPaidLockGame(null)}
            />
          </m.div>
        )}
      </AnimatePresence>

      {/* P0-009：訪客試玩 3 次後強制登入 modal */}
      <AnimatePresence>
        {showGuestTrialLimitModal && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowGuestTrialLimitModal(false)}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a1a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="guest-trial-limit-title"
              aria-describedby="guest-trial-limit-desc"
            >
              <h2 id="guest-trial-limit-title" className="text-xl font-bold text-white mb-2">試玩已達 3 次</h2>
              <p id="guest-trial-limit-desc" className="text-white/70 text-sm mb-6">登入後可開房間、保存進度並暢玩全部遊戲。</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="min-h-[48px] inline-flex items-center justify-center rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium"
                  onClick={() => setShowGuestTrialLimitModal(false)}
                >
                  前往登入
                </Link>
                <button
                  type="button"
                  onClick={() => setShowGuestTrialLimitModal(false)}
                  className="min-h-[48px] px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-medium"
                  aria-label="關閉"
                >
                  稍後再說
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Player Management Modal */}
      <PlayerManagementModal
        isOpen={showPlayerModal}
        onClose={closePlayerModal}
        isInRoomMode={isInRoomMode}
        players={players}
        roomPlayers={roomPlayers}
        maxPlayers={maxPlayers}
        onAddPlayer={() => {}}
        onRemovePlayer={() => {}}
        onReorderPlayers={() => {}}
        onLoadLastSaved={() => {}}
        tier={'free' as const}
      />

      {/* 任務 10：離開遊戲後彈出 1–5 星評分；R2-192 Pro 統計預覽；R2-209 下一款推薦 */}
      <AnimatePresence>
        {gameIdToRate && (
          <GameRatingModal
            gameId={gameIdToRate}
            ratingVariant={ratingVariant}
            onClose={() => setGameIdToRate(null)}
            onPlayNext={(id) => setActiveGame(id)}
            tier={'free' as const}
          />
        )}
      </AnimatePresence>

      {/* Invite Link + QR Modal (after create room) */}
      <AnimatePresence>
        {createInvite && (
          <InviteModal
            slug={createInvite.slug}
            inviteUrl={createInvite.inviteUrl}
            onClose={() => setCreateInvite(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}