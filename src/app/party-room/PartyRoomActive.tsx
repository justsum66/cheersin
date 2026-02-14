'use client'

/**
 * PR-16：派對房「有房間、未結束」狀態 — 玩家列表、邀請、乾杯、房主選遊戲
 * PR-35：房主可結束房間 — 結束按鈕 + 確認 dialog
 * R2-130：全員乾杯同步 — cheersCount 增加時觸發碰杯動畫 + 震動
 */
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { m , AnimatePresence } from 'framer-motion'
import { Users, Sparkles, Wine, Gamepad2, Link2, Check, Crown, LogOut, DoorClosed } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useHaptic } from '@/hooks/useHaptic'
import type { RoomPlayer } from '@/hooks/useGameRoom'

export interface PartyRoomActiveProps {
  effectiveSlug: string | null
  roomId: string | null
  players: RoomPlayer[]
  maxPlayers: number
  hostId: string | null
  expiresAt: string | null
  partyState: { cheersCount: number; currentGameId?: string }
  error: string | null
  roomError: string | null
  onRetry: () => void
  isHost: boolean
  onCheers: () => void
  onHostSelectGame: (gameId: string) => void
  copyInvite: () => void
  inviteCopied: boolean
  tier: string
  /** PR-25：有加入房間時的玩家 row id，用於離開房間；無則不顯示離開按鈕 */
  myPlayerRowId?: string | null
  onLeave?: () => void | Promise<void>
  /** PR-35：房主結束房間；僅房主時顯示結束按鈕 */
  onEndRoom?: () => void | Promise<void>
  endRoomLoading?: boolean
}

export function PartyRoomActive({
  effectiveSlug,
  roomId,
  players,
  maxPlayers,
  hostId,
  expiresAt,
  partyState,
  error,
  roomError,
  onRetry,
  isHost,
  onCheers,
  onHostSelectGame,
  copyInvite,
  inviteCopied,
  tier,
  myPlayerRowId,
  onLeave,
  onEndRoom,
  endRoomLoading = false,
}: PartyRoomActiveProps) {
  const { t } = useTranslation()
  const prefersReducedMotion = usePrefersReducedMotion()
  const { vibrate } = useHaptic()
  const [endRoomDialogOpen, setEndRoomDialogOpen] = useState(false)
  const [showCheersBurst, setShowCheersBurst] = useState(false)
  const prevCheersRef = useRef(partyState.cheersCount)
  const playerCount = players.length
  const remainingMs = expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : null

  /** R2-130：cheersCount 增加時觸發碰杯動畫 + 震動（含 Realtime 同步） */
  useEffect(() => {
    const prev = prevCheersRef.current
    const curr = partyState.cheersCount
    if (curr > prev && prev >= 0) {
      prevCheersRef.current = curr
      setShowCheersBurst(true)
      vibrate([100, 50, 100], true)
      const id = setTimeout(() => {
        setShowCheersBurst(false)
      }, 1200)
      return () => clearTimeout(id)
    }
    prevCheersRef.current = curr
  }, [partyState.cheersCount, vibrate])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-8 relative">
      {/* R2-130：全員乾杯同步碰杯動畫 */}
      <AnimatePresence>
        {showCheersBurst && !prefersReducedMotion && (
          <m.div
            key="cheers-burst"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            aria-live="polite"
            aria-label="乾杯！"
          >
            <div className="flex items-center justify-center gap-2">
              <m.div
                animate={{ rotate: [-8, 4, -4, 0], x: [0, -4, 0] }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <Wine className="w-16 h-16 text-amber-400/90 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" aria-hidden />
              </m.div>
              <m.span
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-4xl font-bold text-amber-300 drop-shadow-lg"
              >
                乾杯！
              </m.span>
              <m.div
                animate={{ rotate: [8, -4, 4, 0], x: [0, 4, 0] }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <Wine className="w-16 h-16 text-amber-400/90 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" aria-hidden />
              </m.div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-3 text-primary-400 party-room-no-print">
        <Users className="w-12 h-12" aria-hidden />
        <Sparkles className="w-8 h-8" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold text-white text-center">{t('partyRoom.title')}</h1>
      <p className="text-white/70 text-center max-w-md">{t('partyRoom.subtitle')}</p>

      {effectiveSlug && roomId && isHost && playerCount < maxPlayers && (
        <m.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm glass-card party-room-no-print"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <m.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              aria-hidden
            >
              <Wine className="w-5 h-5 text-amber-400" />
            </m.div>
            <span>{t('partyRoom.waitingForPlayers') ?? '等待玩家加入…'}</span>
          </div>
          {playerCount >= 2 && (
            <span className="text-amber-300/90 text-xs">{t('partyRoom.startingSoon') ?? '人齊後即可開始玩'}</span>
          )}
        </m.div>
      )}

      {(error || roomError) && (
        <div className="flex flex-col items-center gap-2 party-room-no-print" role="alert" aria-live="assertive">
          <p className="text-red-400 text-sm" id="party-room-error">{error || roomError}</p>
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[48px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-sm font-medium games-focus-ring"
            aria-label={t('error.retry') ?? '重試'}
            aria-describedby="party-room-error"
          >
            重試
          </button>
        </div>
      )}

      <m.div
        key={effectiveSlug ?? 'no-room'}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm space-y-3 rounded-xl glass-card border border-white/10 p-4"
      >
        <m.p
          className="text-white/60 text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
        >
          {t('partyRoom.roomStatus')}
        </m.p>
        <m.div
          className="flex items-center gap-2 text-white/80"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
          role="status"
          aria-live="polite"
          aria-label={`${t('partyRoom.peopleCount')} ${playerCount} ${t('partyRoom.peopleCountValue')} ${maxPlayers}`}
        >
          <Users className="w-5 h-5 text-primary-400" aria-hidden />
          <span>
            {t('partyRoom.peopleCount')} <strong className="text-white tabular-nums"><AnimatedNumber value={playerCount} /></strong> / {maxPlayers} {t('partyRoom.peopleCountValue')}
          </span>
        </m.div>
        {remainingMs != null && remainingMs > 0 && (
          <m.p
            className="text-white/50 text-xs tabular-nums"
            aria-live="polite"
            role="timer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {t('partyRoom.remainingMinutes') ?? '剩餘'} <AnimatedNumber value={Math.ceil(remainingMs / 60_000)} /> {t('partyRoom.minutes') ?? '分鐘'}
          </m.p>
        )}
        {players.length > 0 && (
          <m.div
            className="flex flex-wrap gap-2 items-center"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            role="list"
            aria-label={t('partyRoom.playersList') ?? '玩家列表'}
          >
            <AnimatePresence mode="popLayout">
              {[...players].sort((a, b) => a.orderIndex - b.orderIndex).map((p) => (
                <m.div
                  key={p.id}
                  layout
                  initial={{ opacity: 1, scale: 1 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                  transition={prefersReducedMotion ? { duration: 0.1 } : { duration: 0.3, ease: 'easeOut' }}
                  className="flex items-center gap-1.5 shrink-0 rounded-full bg-white/10 px-2 py-1 text-white/90 text-sm"
                  role="listitem"
                  title={p.displayName}
                >
                  <span className="w-6 h-6 rounded-full bg-primary-500/30 flex items-center justify-center text-xs font-semibold text-primary-200" aria-hidden>
                    {p.displayName.charAt(0).toUpperCase() || '?'}
                  </span>
                  <span className="max-w-[80px] truncate">{p.displayName}</span>
                  {p.isHost && (
                    <span className="inline-flex items-center gap-0.5 text-amber-400 text-xs shrink-0" title={t('partyRoom.host') ?? '房主'}>
                      <Crown className="w-3.5 h-3.5" aria-hidden />
                      <span className="sr-only">{t('partyRoom.host') ?? '房主'}</span>
                      <span className="hidden sm:inline text-amber-300/90" aria-hidden>{t('partyRoom.host') ?? '房主'}</span>
                    </span>
                  )}
                </m.div>
              ))}
            </AnimatePresence>
          </m.div>
        )}
        <div className="flex flex-wrap gap-2">
          {isHost && tier === 'free' && maxPlayers <= 4 && (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 min-h-[48px] px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-sm font-medium games-focus-ring border border-amber-500/30 party-room-no-print"
              aria-label={t('partyRoom.unlock12PlayersAria') ?? '升級解鎖 12 人房間'}
            >
              <Crown className="w-4 h-4" aria-hidden />
              {t('partyRoom.unlock12Players') ?? '解鎖 12 人上限'}
            </Link>
          )}
          {isHost && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-white/50 text-xs mr-1">{t('partyRoom.hostSelectGame')}：</span>
              {partyState.currentGameId && (
                <span className="text-primary-300 text-xs font-medium mr-1" aria-live="polite">
                  {t('partyRoom.currentGame') ?? '目前'}：{partyState.currentGameId === 'truth-or-dare' ? (t('partyRoom.gameTruthOrDare') ?? '真心話') : partyState.currentGameId === 'roulette' ? (t('partyRoom.gameRoulette') ?? '轉盤') : (t('partyRoom.gameLiarDice') ?? '骰子')}
                </span>
              )}
              {['truth-or-dare', 'roulette', 'liar-dice'].map((gid) => (
                <m.button
                  key={gid}
                  type="button"
                  onClick={() => onHostSelectGame(gid)}
                  whileTap={{ scale: 0.97 }}
                  className={`min-h-[48px] px-3 py-2 rounded-lg text-sm games-focus-ring transition-colors party-room-no-print ${
                    partyState.currentGameId === gid ? 'bg-primary-500/40 text-primary-200' : 'bg-white/10 text-white/80 hover:bg-white/15'
                  }`}
                >
                  {gid === 'truth-or-dare' ? (t('partyRoom.gameTruthOrDare') ?? '真心話') : gid === 'roulette' ? (t('partyRoom.gameRoulette') ?? '轉盤') : (t('partyRoom.gameLiarDice') ?? '骰子')}
                </m.button>
              ))}
            </div>
          )}
          {isHost ? (
            <>
              <Link
                href={`/games?room=${effectiveSlug}`}
                className="inline-flex items-center gap-2 min-h-[48px] px-4 py-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 text-sm font-medium games-focus-ring party-room-no-print"
              >
                <Gamepad2 className="w-4 h-4" aria-hidden />
                {t('partyRoom.hostSelectGame')}
              </Link>
              {partyState.currentGameId && (
                <Link
                  href={`/games?room=${effectiveSlug}&game=${partyState.currentGameId}`}
                  className="inline-flex items-center gap-2 min-h-[48px] px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 text-sm font-medium games-focus-ring party-room-no-print"
                >
                  {t('partyRoom.continueGames')}
                </Link>
              )}
            </>
          ) : (
            partyState.currentGameId && (
              <Link
                href={`/games?room=${effectiveSlug}&game=${partyState.currentGameId}`}
                className="inline-flex items-center gap-2 min-h-[48px] px-4 py-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 text-sm font-medium games-focus-ring party-room-no-print"
              >
                <Gamepad2 className="w-4 h-4" aria-hidden />
                {t('partyRoom.continueGames')}
              </Link>
            )
          )}
          <m.button
            type="button"
            onClick={copyInvite}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 min-h-[48px] px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium games-focus-ring party-room-no-print"
            aria-label={t('partyRoom.copyInviteAria')}
            aria-live="polite"
          >
            {inviteCopied ? <Check className="w-4 h-4 text-primary-400" aria-hidden /> : <Link2 className="w-4 h-4" aria-hidden />}
            {inviteCopied ? t('common.copied') : t('partyRoom.inviteLink')}
          </m.button>
        </div>
      </m.div>

      {/* R2-130：全員乾杯同步動畫 — 目前為 client 寫入 state + confetti；多機同步需後端「同步觸發」API 後補齊 */}
      <m.button
        type="button"
        onClick={onCheers}
        whileTap={{ scale: 0.96 }}
        className="min-h-[56px] px-8 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-2 games-focus-ring transition-colors party-room-no-print"
        aria-label={t('partyRoom.cheers')}
      >
        <Wine className="w-6 h-6" aria-hidden />
        {t('partyRoom.cheers')}
      </m.button>
      {partyState.cheersCount > 0 && (
        <p className="text-white/60 text-sm tabular-nums">
          {t('partyRoom.cheersCount')} <AnimatedNumber value={partyState.cheersCount} />
        </p>
      )}
      <Link
        href="/games"
        className="min-h-[48px] px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors games-focus-ring party-room-no-print"
      >
        {t('partyRoom.continueGames')}
      </Link>
      {myPlayerRowId && onLeave && (
        <m.button
          type="button"
          onClick={() => void onLeave()}
          className="min-h-[48px] px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium games-focus-ring party-room-no-print"
          aria-label={t('partyRoom.leaveRoom')}
        >
          <LogOut className="w-4 h-4 inline-block mr-2 align-middle" aria-hidden />
          {t('partyRoom.leaveRoom')}
        </m.button>
      )}
      <Link href="/" className="text-white/50 hover:text-white/80 text-sm party-room-no-print">
        {t('partyRoom.backHome')}
      </Link>
      {/* PR-35：房主可結束房間 — 確認後呼叫 onEndRoom */}
      {isHost && onEndRoom && (
        <m.button
          type="button"
          onClick={() => setEndRoomDialogOpen(true)}
          disabled={endRoomLoading}
          className="min-h-[48px] px-4 py-2 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-sm font-medium games-focus-ring party-room-no-print"
          aria-label={t('partyRoom.endRoomAria') ?? t('partyRoom.endRoom')}
        >
          <DoorClosed className="w-4 h-4 inline-block mr-2 align-middle" aria-hidden />
          {endRoomLoading ? (t('common.loading') ?? '處理中…') : t('partyRoom.endRoom')}
        </m.button>
      )}
      {onEndRoom && (
        <ConfirmDialog
          open={endRoomDialogOpen}
          title={t('partyRoom.endRoomConfirmTitle') ?? '結束房間？'}
          message={t('partyRoom.endRoomConfirmMessage') ?? '結束後房間將立即關閉。確定要結束嗎？'}
          confirmLabel={t('partyRoom.endRoom') ?? '結束房間'}
          cancelLabel={t('common.cancel') ?? '取消'}
          variant="danger"
          onConfirm={async () => {
            await onEndRoom()
            setEndRoomDialogOpen(false)
          }}
          onCancel={() => setEndRoomDialogOpen(false)}
        />
      )}
    </div>
  )
}
