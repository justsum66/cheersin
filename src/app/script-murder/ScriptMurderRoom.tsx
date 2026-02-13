'use client'

/**
 * 劇本殺房間內大廳：邀請連結、加入表單、玩家列表、開始遊戲
 * SM-01：自 page 拆出；SM-65：ConfirmDialog triggerRef
 */
import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Copy, Users, Play, ChevronLeft, LogOut } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { formatDateTime } from '@/lib/formatters'
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
  /** ?solo=1：開發測試用，允許 1 人開始 */
  allowSoloTest?: boolean
  /** 僅 1 人在房且未開 solo 時，顯示「單人測試」連結用 */
  soloTestHref?: string | null
  /** 是否為房主（僅房主可開始遊戲）；未登入時可依第一順位玩家判斷 */
  isHost?: boolean
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
  allowSoloTest = false,
  soloTestHref = null,
  isHost = false,
}: ScriptMurderRoomProps) {
  const { t, locale } = useTranslation()
  const startGameTriggerRef = useRef<HTMLButtonElement>(null)
  const leaveTriggerRef = useRef<HTMLButtonElement>(null)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
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
        {isExpired && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20" role="alert">
            <p className="text-amber-200 font-medium">{t('scriptMurder.roomExpired')}</p>
            <Link href="/script-murder" className="mt-2 inline-block text-primary-400 hover:text-primary-300 text-sm">
              {t('scriptMurder.returnList')}
            </Link>
          </div>
        )}
        {room.expiresAt && !isExpired && (
          <p className="text-white/40 text-xs mb-4" role="timer">
            {t('scriptMurder.roomValidUntil')} {formatDateTime(room.expiresAt, locale)}
          </p>
        )}
        {inviteUrl && (
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              title={inviteUrl}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm truncate"
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
                aria-invalid={!!joinErrorDisplay}
                aria-describedby={joinErrorDisplay ? 'script-murder-join-error' : undefined}
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
            {joinErrorDisplay && <p id="script-murder-join-error" className="text-red-400 text-sm mt-2" role="alert" aria-live="assertive">{joinErrorDisplay}</p>}
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
        {joined && players.length < (scriptDetail?.minPlayers ?? 4) && !allowSoloTest && (
          <p className="text-white/60 text-sm mb-4" role="status">
            {t('scriptMurder.needMorePlayers').replace('{{count}}', String(Math.max(0, (scriptDetail?.minPlayers ?? 4) - players.length)))}
          </p>
        )}
        {joined && players.length === 1 && !allowSoloTest && soloTestHref && (
          <div className="mb-4">
            <Link
              href={soloTestHref}
              className="block w-full min-h-[48px] px-4 py-3 rounded-xl bg-amber-500/90 hover:bg-amber-500 text-white font-medium flex items-center justify-center gap-2 games-focus-ring border border-amber-400/50"
            >
              <Play className="w-5 h-5" /> {t('scriptMurder.soloTestLink')}
            </Link>
            <p className="text-white/40 text-xs mt-1.5 text-center">{t('scriptMurder.soloTestHint')}</p>
          </div>
        )}
        {joined && !isHost && (players.length >= (scriptDetail?.minPlayers ?? 4) || allowSoloTest) && !isExpired && (
          <p className="text-white/50 text-sm mb-4" role="status">{t('scriptMurder.waitHostStart')}</p>
        )}
        {joined && isHost && (players.length >= (scriptDetail?.minPlayers ?? 4) || allowSoloTest) && !isExpired && (
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
          <>
            <motion.button
              ref={leaveTriggerRef}
              type="button"
              onClick={() => setShowLeaveConfirm(true)}
              className="w-full min-h-[48px] mt-4 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-medium flex items-center justify-center gap-2 games-focus-ring"
              aria-label={t('scriptMurder.leaveRoom')}
              aria-haspopup="dialog"
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-4 h-4" /> {t('scriptMurder.leaveRoom')}
            </motion.button>
            <ConfirmDialog
              open={showLeaveConfirm}
              title={t('scriptMurder.leaveConfirmTitle')}
              message={t('scriptMurder.leaveConfirmMessage')}
              confirmLabel={t('scriptMurder.leaveRoom')}
              cancelLabel={t('common.cancel')}
              variant="danger"
              triggerRef={leaveTriggerRef}
              onConfirm={() => { setShowLeaveConfirm(false); onLeave() }}
              onCancel={() => setShowLeaveConfirm(false)}
            />
          </>
        )}
      </div>
    </motion.div>
  )
}
