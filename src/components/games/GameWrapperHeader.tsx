'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Users,
  Smartphone,
  Share2,
  ChevronLeft,
  Settings,
  Maximize2,
  Minimize2,
  HelpCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Flag,
  SkipForward,
  RotateCw,
  Volume2,
  VolumeX,
} from 'lucide-react'
import {
  getPassPhoneEnabled,
  setPassPhoneEnabled as persistPassPhone,
  getPassPhoneAntiPeek,
  setPassPhoneAntiPeek as persistAntiPeek,
  getPassPhoneRandomOrder,
  setPassPhoneRandomOrder as persistRandomOrder,
  getPassPhoneTts,
  setPassPhoneTts as persistTts,
} from '@/lib/games-settings'
import { useGameStore } from '@/store/useGameStore'
import { usePassPhone } from './PassPhoneContext'
import { usePunishment } from './Punishments/PunishmentContext'
import { useGameSound } from './GameSoundProvider'
import type { SwitchGameItem } from './GameWrapperTypes'

import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'

export interface GameWrapperHeaderProps {
  title: string
  description?: string
  onExit: () => void
  players: string[]
  maxPlayers?: number
  onSkipRound?: () => void
  onRestart?: () => void
  anonymousMode?: boolean
  isHost?: boolean
  onToggleAnonymous?: (value: boolean) => Promise<{ ok: boolean; error?: string }>
  isFullscreen: boolean
  onToggleFullscreen: () => void
  switchGameList?: SwitchGameItem[]
  onSwitchGame?: (id: string) => void
  onSwitchGameClick?: (id: string) => void
  currentGameId?: string | null
  shareInviteUrl?: string | null
  onShowRules?: () => void
  onPlayAgain?: () => void
  onOpenReport?: () => void
  showRulesButton?: boolean
  isRulesOpen?: boolean
  rulesButtonRef?: React.RefObject<HTMLButtonElement | null>
  showSwitchConfirm?: boolean
  setShowSwitchConfirm?: (v: boolean) => void
  pendingSwitchGameId?: string | null
  setPendingSwitchGameId?: (v: string | null) => void
  onConfirmSwitchGame?: (id: string) => void
  fullscreenUnsupported?: boolean
  isSpectator?: boolean
}

/** 81 統一頂部：返回 / 遊戲名 / 設定；84 返回前確認；83 全螢幕；85 換遊戲 */
export default function GameWrapperHeader({
  title,
  description,
  onExit,
  players,
  isFullscreen,
  onToggleFullscreen,
  switchGameList,
  onSwitchGame,
  onSwitchGameClick,
  currentGameId,
  shareInviteUrl,
  onShowRules,
  showRulesButton,
  fullscreenUnsupported,

  onPlayAgain,
  onOpenReport,
  isRulesOpen = false,
  rulesButtonRef,
  showSwitchConfirm = false,
  setShowSwitchConfirm,
  pendingSwitchGameId = null,
  setPendingSwitchGameId,
  onConfirmSwitchGame,
  maxPlayers,
  onSkipRound,
  onRestart,
  anonymousMode = false,
  isHost = false,
  onToggleAnonymous,
}: GameWrapperHeaderProps) {
  /* R2-001: Deep Refactor - Use Store */
  const { gameState, setGameState, stats, replayEvents, trial: trialState } = useGameStore()

  const passPhone = usePassPhone()
  const punishment = usePunishment()

  // Store mappings
  const gameHasStarted = gameState !== 'lobby'
  const gameStats = stats
  // const replayEvents = replayEvents // already destructured
  // Pause logic: The store 'gameState' is the source of truth for paused.
  const isPaused = gameState === 'paused'
  const onTogglePause = () => setGameState(isPaused ? 'playing' : 'paused')

  // Trial logic
  // The store has `trial` object with roundsLeft.
  const trialRoundsLeft = trialState.roundsLeft
  const REPLAY_UI_DISPLAY_COUNT = 10

  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const settingsRef = useRef<HTMLDivElement | null>(null)
  const hasStarted = gameHasStarted

  useEffect(() => {
    if (!showSettingsMenu) return
    const close = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettingsMenu(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [showSettingsMenu])

  useEffect(() => {
    if (!passPhone) return
    passPhone.setEnabled(getPassPhoneEnabled())
    passPhone.setAntiPeek(getPassPhoneAntiPeek())
    passPhone.setRandomOrder(getPassPhoneRandomOrder())
    passPhone.setTtsEnabled(getPassPhoneTts())
  }, [passPhone])

  /** A11Y-006：離開 / 換遊戲確認框 Esc 關閉（等同取消） */
  useEffect(() => {
    if (!showExitConfirm && !(showSwitchConfirm && pendingSwitchGameId)) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (showExitConfirm) setShowExitConfirm(false)
      else {
        setShowSwitchConfirm?.(false)
        setPendingSwitchGameId?.(null)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showExitConfirm, showSwitchConfirm, pendingSwitchGameId, setShowSwitchConfirm, setPendingSwitchGameId])

  const togglePassPhone = useCallback(() => {
    const next = !getPassPhoneEnabled()
    persistPassPhone(next)
    passPhone?.setEnabled(next)
  }, [passPhone])

  const toggleAntiPeek = useCallback(() => {
    const next = !getPassPhoneAntiPeek()
    persistAntiPeek(next)
    passPhone?.setAntiPeek(next)
  }, [passPhone])

  const toggleRandomOrder = useCallback(() => {
    const next = !getPassPhoneRandomOrder()
    persistRandomOrder(next)
    passPhone?.setRandomOrder(next)
  }, [passPhone])

  const toggleTts = useCallback(() => {
    const next = !getPassPhoneTts()
    persistTts(next)
    passPhone?.setTtsEnabled(next)
  }, [passPhone])

  const passEnabled = passPhone?.enabled ?? false
  const { enabled: soundEnabled, setEnabled: setSoundEnabled } = useGameSound() ?? { enabled: true, setEnabled: () => { } }

  const handleShare = useCallback(() => {
    setShowSettingsMenu(false)
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    const url = shareInviteUrl ?? `${base}/games`
    const text = shareInviteUrl ? `一起玩「${title}」！加入房間：` : `一起玩「${title}」！`
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Cheersin 派對遊樂場', text, url }).catch(() => {
        navigator.clipboard?.writeText(`${text} ${url}`)
      })
    } else {
      navigator.clipboard?.writeText(`${text} ${url}`)
    }
  }, [title, shareInviteUrl])

  const handleCopyLink = useCallback(() => {
    setShowSettingsMenu(false)
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    const url = shareInviteUrl ?? `${base}/games`
    const text = shareInviteUrl ? `一起玩「${title}」！加入房間：${url}` : `一起玩「${title}」！${url}`
    navigator.clipboard?.writeText(text).catch(() => { })
  }, [title, shareInviteUrl])

  return (
    <>
      <div className={`flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-white/[0.02] flex-wrap gap-2 ${isFullscreen ? 'safe-area-pt' : ''}`}>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => (hasStarted ? setShowExitConfirm(true) : onExit())}
            className="rounded-full px-3"
            aria-label="返回大廳（遊戲列表）"
          >
            <ChevronLeft className="w-5 h-5 shrink-0" aria-hidden />
            <span className="text-sm font-medium hidden sm:inline ml-2">返回大廳</span>
          </Button>
          {onPlayAgain && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onPlayAgain}
              leftIcon={<RotateCcw className="w-4 h-4 shrink-0" />}
              className="hidden sm:flex"
              aria-label="再玩一局（建立新房間）"
            >
              再玩一局
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 justify-center">
          <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20 shrink-0">
            <Trophy className="w-5 h-5 text-primary-400" />
          </div>
          <div className="min-w-0 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white font-display truncate" title={title}>{title}</h2>
            {description && <p className="text-xs text-white/40 line-clamp-1">{description}</p>}
            {trialRoundsLeft != null && trialRoundsLeft > 0 && (
              <p className="text-xs text-accent-400 mt-0.5" aria-live="polite">試玩剩餘 {trialRoundsLeft} 局</p>
            )}
          </div>
          {showRulesButton && onShowRules && (
            <Button
              ref={rulesButtonRef as React.Ref<HTMLButtonElement>}
              variant="ghost"
              size="icon"
              onClick={onShowRules}
              className="shrink-0 rounded-full"
              aria-label="顯示遊戲規則"
              aria-expanded={isRulesOpen}
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {players.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60" aria-label={maxPlayers != null ? `房間人數 ${players.length}／${maxPlayers} 人` : `${players.length} 位玩家`}>
              <Users className="w-3.5 h-3.5" />
              <span>{maxPlayers != null ? `${players.length}/${maxPlayers} 人` : `${players.length} 位`}</span>
            </div>
          )}
          <div className="relative" ref={settingsRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettingsMenu((s) => !s)}
              className="rounded-full"
              aria-label="設定"
              aria-expanded={showSettingsMenu}
            >
              <Settings className="w-5 h-5" />
            </Button>
            {showSettingsMenu && (
              <GlassCard
                variant="layer-2"
                className="absolute right-0 top-full mt-2 w-52 rounded-xl p-2 z-20"
                onMouseDown={(e) => e.preventDefault()}
              >
                <button
                  type="button"
                  onClick={() => { setSoundEnabled(!soundEnabled); setShowSettingsMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10 min-h-[48px] min-w-[48px] items-center games-focus-ring"
                  aria-label={soundEnabled ? '關閉音效' : '開啟音效'}
                >
                  <m.span key={soundEnabled ? 'on' : 'off'} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </m.span>
                  {soundEnabled ? '音效開' : '音效關'}
                </button>
                <button
                  type="button"
                  onClick={() => { onToggleFullscreen(); setShowSettingsMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10 min-h-[48px] min-w-[48px] items-center games-focus-ring"
                  aria-label={isFullscreen ? '結束全螢幕' : '全螢幕'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  {isFullscreen ? '結束全螢幕' : '全螢幕'}
                </button>
                {fullscreenUnsupported && (
                  <p className="px-3 py-1 text-xs text-white/50">iOS 不支援全螢幕，可將此頁加入主畫面以獲得類似體驗</p>
                )}
                {isHost && onToggleAnonymous != null && (
                  <label className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10 min-h-[48px] cursor-pointer games-focus-ring">
                    <span className="flex-1">匿名模式</span>
                    <Checkbox
                      checked={anonymousMode}
                      onCheckedChange={async (checked) => {
                        const res = await onToggleAnonymous(checked)
                        if (!res.ok) return
                        setShowSettingsMenu(false)
                      }}
                      className="text-primary-500"
                      aria-label={anonymousMode ? '關閉匿名模式' : '開啟匿名模式'}
                    />
                  </label>
                )}
                {onTogglePause != null && (
                  <button
                    type="button"
                    onClick={() => { onTogglePause(); setShowSettingsMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10 min-h-[48px]"
                  >
                    {isPaused ? '繼續遊戲' : '暫停遊戲'}
                  </button>
                )}
                {onSkipRound != null && (
                  <button
                    type="button"
                    onClick={() => { onSkipRound(); setShowSettingsMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10 min-h-[48px]"
                    aria-label="跳過當前回合"
                  >
                    <SkipForward className="w-4 h-4" /> 跳過本回合
                  </button>
                )}
                {onRestart != null && (
                  <button
                    type="button"
                    onClick={() => { onRestart(); setShowSettingsMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10 min-h-[48px]"
                    aria-label="重新開始本局"
                  >
                    <RotateCw className="w-4 h-4" /> 重新開始
                  </button>
                )}
                {gameStats && (gameStats.durationSec != null || gameStats.correctCount != null || gameStats.punishmentCount != null || (gameStats.funFacts?.length ?? 0) > 0) && (
                  <div className="border-t border-white/10 mt-2 pt-2 px-2">
                    <p className="text-white/50 text-xs mb-1">本局統計</p>
                    <div className="flex flex-wrap gap-2 text-xs text-white/70">
                      {gameStats.durationSec != null && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {Math.floor(gameStats.durationSec / 60)} 分 {gameStats.durationSec % 60} 秒
                        </span>
                      )}
                      {gameStats.correctCount != null && (
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> 答對 {gameStats.correctCount}
                        </span>
                      )}
                      {gameStats.punishmentCount != null && (
                        <span className="inline-flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> 懲罰 {gameStats.punishmentCount}
                        </span>
                      )}
                    </div>
                    {gameStats.funFacts && gameStats.funFacts.length > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-white/5 space-y-0.5">
                        {gameStats.funFacts.map((f, i) => (
                          <p key={i} className="text-primary-300/90 text-xs font-medium">
                            {f.label}：{f.value}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {replayEvents.length > 0 && (
                  <div className="border-t border-white/10 mt-2 pt-2 px-2">
                    <p className="text-white/50 text-xs mb-1">本局回放</p>
                    <div className="max-h-28 overflow-y-auto space-y-0.5 text-xs text-white/70">
                      {[...replayEvents].reverse().slice(0, REPLAY_UI_DISPLAY_COUNT).map((ev, i) => (
                        <div key={`${ev.ts}-${i}`} className="truncate" title={ev.label}>
                          <span className="text-white/40 tabular-nums mr-1">{new Date(ev.ts).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          {ev.label}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const text = [...replayEvents].reverse().slice(0, REPLAY_UI_DISPLAY_COUNT).map((ev) => `${new Date(ev.ts).toLocaleTimeString('zh-TW')} ${ev.label}`).join('\n')
                        navigator.clipboard?.writeText(text).then(() => { }).catch(() => { })
                      }}
                      className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs text-white/70 hover:bg-white/10 min-h-[44px]"
                      aria-label="複製本局回放"
                    >
                      <Share2 className="w-3.5 h-3.5" /> 複製回放
                    </button>
                  </div>
                )}
                {shareInviteUrl ? (
                  <m.div
                    className="border-t border-white/10 pt-2 mt-2 space-y-1"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } }, hidden: {} }}
                  >
                    <p className="px-3 py-1 text-xs text-white/50">分享房間</p>
                    <m.button
                      type="button"
                      variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                      onClick={() => { const u = `https://line.me/R/msg/text/?${encodeURIComponent(`${shareInviteUrl}\n\n一起玩 Cheersin！`)}`; window.open(u, '_blank'); setShowSettingsMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10 min-h-[44px]"
                      aria-label="分享到 Line"
                    >
                      <span className="text-[#00B900] font-bold">LINE</span> 分享
                    </m.button>
                    <m.button
                      type="button"
                      variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                      onClick={() => { const u = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareInviteUrl}\n一起玩 Cheersin！`)}`; window.open(u, '_blank'); setShowSettingsMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10 min-h-[44px]"
                      aria-label="分享到 WhatsApp"
                    >
                      <span className="text-[#25D366] font-bold">WhatsApp</span> 分享
                    </m.button>
                    <m.button
                      type="button"
                      variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10 min-h-[44px]"
                    >
                      <Share2 className="w-4 h-4" /> 複製連結
                    </m.button>
                  </m.div>
                ) : (
                  <button type="button" onClick={() => { handleShare(); setShowSettingsMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10">
                    <Share2 className="w-4 h-4" /> 分享
                  </button>
                )}
                {onOpenReport && (
                  <button type="button" onClick={() => { onOpenReport(); setShowSettingsMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10 min-h-[48px]">
                    <Flag className="w-4 h-4" /> 檢舉
                  </button>
                )}
                {punishment != null && (
                  <div className="border-t border-white/10 pt-2 mt-2">
                    <div className="px-3 py-2">
                      <Checkbox
                        checked={punishment.stackMode}
                        onCheckedChange={(checked) => punishment.setStackMode(checked)}
                        label="懲罰疊加（新一局保留歷史）"
                        aria-label="懲罰疊加：新一局保留懲罰歷史"
                      />
                    </div>
                  </div>
                )}
                {players.length >= 2 && passPhone && (
                  <div className="border-t border-white/10 mt-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { togglePassPhone(); setShowSettingsMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10"
                    >
                      <Smartphone className="w-4 h-4" />
                      {passEnabled ? '關閉傳手機' : '傳手機'}
                    </button>
                    {passEnabled && (
                      <div className="mt-1 pl-1 space-y-1">
                        <div className="px-3 py-1">
                          <Checkbox checked={passPhone.antiPeek} onCheckedChange={toggleAntiPeek} label="防偷看" className="text-white/70" />
                        </div>
                        <div className="px-3 py-1">
                          <Checkbox checked={passPhone.randomOrder} onCheckedChange={toggleRandomOrder} label="亂序傳遞" className="text-white/70" />
                        </div>
                        <div className="px-3 py-1">
                          <Checkbox checked={passPhone.ttsEnabled} onCheckedChange={toggleTts} label="TTS 語音" className="text-white/70" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {switchGameList && switchGameList.length > 0 && (onSwitchGameClick ?? onSwitchGame) && (
                  <div className="border-t border-white/10 mt-2 pt-2">
                    <p className="text-white/50 text-xs px-2 mb-1">換遊戲</p>
                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                      {switchGameList
                        .filter((g) => g.id !== currentGameId)
                        .slice(0, 6)
                        .map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => { (onSwitchGameClick ?? onSwitchGame)?.(g.id); setShowSettingsMenu(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10 min-h-[48px] min-w-[48px]"
                          >
                            {g.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setShowSettingsMenu(false); setShowExitConfirm(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10 mt-1 border-t border-white/10 min-h-[48px]"
                >
                  <ChevronLeft className="w-4 h-4" /> 返回大廳
                </button>
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showExitConfirm && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 safe-area-px safe-area-pb"
            onClick={() => setShowExitConfirm(false)}
          >
            <m.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="exit-confirm-title"
              aria-describedby="exit-confirm-desc"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-sm safe-area-px"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="p-4 md:p-6 rounded-2xl shadow-xl" variant="layer-2">
                <h3 id="exit-confirm-title" className="sr-only">離開遊戲確認</h3>
                <p className="text-white/90 font-medium mb-4" id="exit-confirm-desc">遊戲進行中，確定要離開嗎？</p>
                <div className="flex flex-wrap gap-3 md:gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => { setShowExitConfirm(false); onExit(); }}
                    className="flex-1"
                  >
                    離開
                  </Button>
                </div>
              </GlassCard>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSwitchConfirm && pendingSwitchGameId && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 safe-area-px safe-area-pb"
            onClick={() => { setShowSwitchConfirm?.(false); setPendingSwitchGameId?.(null); }}
          >
            <m.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="switch-confirm-title"
              aria-describedby="switch-confirm-desc"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-sm safe-area-px"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="p-4 md:p-6 rounded-2xl shadow-xl" variant="layer-2">
                <h3 id="switch-confirm-title" className="sr-only">換遊戲確認</h3>
                <p className="text-white/90 font-medium mb-4" id="switch-confirm-desc">遊戲進行中，換遊戲將重新開始，確定嗎？</p>
                <div className="flex flex-wrap gap-3 md:gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => { setShowSwitchConfirm?.(false); setPendingSwitchGameId?.(null); }}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (pendingSwitchGameId) onConfirmSwitchGame?.(pendingSwitchGameId)
                      setShowSwitchConfirm?.(false)
                      setPendingSwitchGameId?.(null)
                    }}
                    className="flex-1"
                  >
                    確定
                  </Button>
                </div>
              </GlassCard>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
