'use client'

/**
 * 劇本殺房間內大廳：邀請連結、加入表單、玩家列表、開始遊戲
 * SM-01：自 page 拆出；SM-65：ConfirmDialog triggerRef
 */
import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Copy, Users, Play, ChevronLeft, LogOut } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { ScriptMurderRoomInfo, ScriptMurderPlayer, ScriptDetail } from '@/types/script-murder'

export interface ScriptMurderRoomProps {
  room: ScriptMurderRoomInfo
  roomSlug: string
  players: ScriptMurderPlayer[]
  scriptDetail: ScriptDetail | null
  inviteUrl: string
  copyInvite: () => void
  inviteCopied: boolean
  joined: boolean
  displayName: string
  setDisplayName: (v: string) => void
  joinRoom: (name: string) => void
  joinError: string | null
  joinLoading?: boolean
  startGame: () => void | Promise<boolean>
  showStartConfirm: boolean
  setShowStartConfirm: (v: boolean) => void
  /** SM-03：離開房間；有 myPlayerRowId 時顯示按鈕 */
  onLeave?: () => void
  myPlayerRowId?: string | null
}

export function ScriptMurderRoom({
  room,
  roomSlug,
  players,
  scriptDetail,
  inviteUrl,
  copyInvite,
  inviteCopied,
  joined,
  displayName,
  setDisplayName,
  joinRoom,
  joinError,
  joinLoading = false,
  startGame,
  showStartConfirm,
  setShowStartConfirm,
  onLeave,
  myPlayerRowId,
}: ScriptMurderRoomProps) {
  const { t } = useTranslation()
  const startGameTriggerRef = useRef<HTMLButtonElement>(null)
  const isExpired = !!room.expiresAt && new Date(room.expiresAt).getTime() < Date.now()
  /** SM-56：API 回傳「房間已滿」時顯示 i18n key */
  const joinErrorDisplay =
    joinError && (joinError === '房間已滿' || joinError.toLowerCase().includes('room full'))
      ? t('scriptMurder.roomFull')
      : joinError

  return (
    <motion.div
      key="lobby"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen px-4 py-8"
    >
      <div className="max-w-lg mx-auto">
        <Link
          href="/script-murder"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> {t('scriptMurder.backToList')}
        </Link>
        <h1 className="text-xl font-bold text-white mb-2">
          {scriptDetail?.title} — {t('scriptMurder.lobbyTitleSuffix')}
        </h1>
        <p className="text-white/60 text-sm mb-6">{t('scriptMurder.lobbyShareInvite')}</p>
        <p className="text-white/50 text-xs mb-4" role="doc-tip">{t('scriptMurder.onboardingSteps')}</p>
        {room.expiresAt && (
          <p className="text-white/40 text-xs mb-4" role="timer">
            {new Date(room.expiresAt).getTime() < Date.now()
              ? t('scriptMurder.roomExpired')
              : `房間有效至 ${new Date(room.expiresAt).toLocaleString('zh-TW')}`}
          </p>
        )}
        {inviteUrl && (
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              aria-label={t('scriptMurder.copyInvite')}
            />
            <button
              type="button"
              onClick={copyInvite}
              className="min-h-[48px] px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15 games-focus-ring flex items-center gap-2"
              aria-label={inviteCopied ? t('scriptMurder.copied') : t('scriptMurder.copyInvite')}
            >
              <Copy className="w-5 h-5" />
              {inviteCopied ? t('scriptMurder.copied') : t('scriptMurder.copyInvite')}
            </button>
          </div>
        )}
        {!joined ? (
          <div className="mb-6">
            <label className="block text-white/70 text-sm mb-2">{t('scriptMurder.displayName')}</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t('scriptMurder.enterNamePlaceholder')}
                maxLength={20}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 min-h-[44px]"
                aria-label={t('scriptMurder.displayName')}
              />
              <motion.button
                type="button"
                disabled={joinLoading || !displayName.trim()}
                onClick={() => displayName.trim() && joinRoom(displayName.trim())}
                className="min-h-[48px] px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white games-focus-ring disabled:opacity-50"
                whileTap={{ scale: 0.98 }}
              >
                {joinLoading ? t('scriptMurder.joining') : t('scriptMurder.joinButton')}
              </motion.button>
            </div>
            {joinErrorDisplay && <p className="text-red-400 text-sm mt-2" role="alert">{joinErrorDisplay}</p>}
          </div>
        ) : null}
        <div className="flex items-center gap-2 text-white/70 mb-4" role="status" aria-live="polite" aria-label={`${t('scriptMurder.joinedCount')} ${players.length} / ${room.maxPlayers}`}>
          <Users className="w-5 h-5" />
          <span>
            {t('scriptMurder.joinedCount')} {players.length} / {room.maxPlayers}{' '}
            {t('scriptMurder.peopleUnit')}
          </span>
        </div>
        <ul className="space-y-2 mb-6" aria-live="polite">
          {players.length === 0 ? (
            <li className="text-white/50 text-sm">{t('scriptMurder.noPlayersYet')}</li>
          ) : (
            players.map((p) => (
              <li key={p.id} className="text-white/80">
                {p.displayName}
              </li>
            ))
          )}
        </ul>
        {joined && players.length >= (scriptDetail?.minPlayers ?? 4) && !isExpired && (
          <>
            <motion.button
              ref={startGameTriggerRef}
              type="button"
              onClick={() => setShowStartConfirm(true)}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium flex items-center justify-center gap-2 games-focus-ring"
              aria-haspopup="dialog"
              aria-expanded={showStartConfirm}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-5 h-5" /> {t('scriptMurder.startGameLabel')}
            </motion.button>
            <ConfirmDialog
              open={showStartConfirm}
              title={t('scriptMurder.startConfirmTitle')}
              message={t('scriptMurder.startConfirmMessage')}
              confirmLabel={t('scriptMurder.startGameLabel')}
              cancelLabel={t('common.cancel')}
              variant="default"
              triggerRef={startGameTriggerRef}
              onConfirm={async () => {
                setShowStartConfirm(false)
                const result = await startGame()
                if (result === false) toast.error(t('scriptMurder.startGameFailed'))
              }}
              onCancel={() => setShowStartConfirm(false)}
            />
          </>
        )}
        {joined && myPlayerRowId && onLeave && (
          <motion.button
            type="button"
            onClick={onLeave}
            className="w-full min-h-[48px] mt-4 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-medium flex items-center justify-center gap-2 games-focus-ring"
            aria-label={t('scriptMurder.leaveRoom')}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-4 h-4" /> {t('scriptMurder.leaveRoom')}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
