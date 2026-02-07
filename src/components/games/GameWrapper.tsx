'use client'

import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Trophy, Users, Smartphone, Share2, ChevronLeft, Settings, Maximize2, Minimize2, HelpCircle, Clock, CheckCircle, AlertTriangle, RotateCcw, Flag } from 'lucide-react'
import { ModalCloseButton } from '@/components/ui/ModalCloseButton'
import {
  getPassPhoneEnabled,
  setPassPhoneEnabled as persistPassPhone,
  getPassPhoneAntiPeek,
  setPassPhoneAntiPeek as persistAntiPeek,
  getPassPhoneRandomOrder,
  setPassPhoneRandomOrder as persistRandomOrder,
  getPassPhoneTts,
  setPassPhoneTts as persistTts,
  getReduceMotion,
} from '@/lib/games-settings'
import Link from 'next/link'
import { stripHtml } from '@/lib/games-sanitize'
import { GameSessionProvider } from './GameSessionProvider'
import { usePassPhone } from './PassPhoneContext'
import PassPhoneMode from './PassPhoneMode'
import BrandWatermark from './BrandWatermark'

/** 供子元件（如 GameRules）註冊規則內文；任務 18 改為點擊問號觸發 */
export const GameRulesContext = createContext<{ setRulesContent: (s: string | null) => void } | null>(null)
export function useGameRulesContext() {
  return useContext(GameRulesContext)
}

/** 任務 30：遊戲是否已開始，未開始時點返回直接離開不彈確認 */
export const GameProgressContext = createContext<{ hasStarted: boolean; setHasStarted: (v: boolean) => void } | null>(null)
export function useGameProgress() {
  return useContext(GameProgressContext)
}

/** 任務 19：遊戲快捷鍵，子元件可註冊 Space 下一題 / 1-9 選項 */
export const GameHotkeyContext = createContext<{
  registerSpace: (fn: () => void) => () => void
  registerDigit: (digit: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, fn: () => void) => () => void
} | null>(null)
export function useGameHotkey() {
  return useContext(GameHotkeyContext)
}

/** 任務 22：暫停狀態，子遊戲可讀 isPaused 凍結計時器 */
export const GamePauseContext = createContext<{ isPaused: boolean; setPaused: (v: boolean) => void } | null>(null)
export function useGamePause() {
  return useContext(GamePauseContext)
}

/** 任務 26：本局統計，子遊戲可註冊時長/答對數/懲罰次數 */
export interface GameStatsSnapshot {
  durationSec?: number
  correctCount?: number
  punishmentCount?: number
}
export const GameStatsContext = createContext<{
  stats: GameStatsSnapshot
  setStats: (s: Partial<GameStatsSnapshot>) => void
} | null>(null)
export function useGameStats() {
  return useContext(GameStatsContext)
}

/** 任務 29：遊戲記錄回放 — 子遊戲可推送關鍵操作，設定內可查看本局精彩時刻 */
export interface ReplayEvent {
  type: string
  label: string
  payload?: unknown
  ts: number
}
const MAX_REPLAY_EVENTS = 50
/** GAMES_500 #225：設定內本局回放顯示筆數 */
const REPLAY_UI_DISPLAY_COUNT = 10
export const GameReplayContext = createContext<{
  events: ReplayEvent[]
  addEvent: (e: Omit<ReplayEvent, 'ts'>) => void
} | null>(null)
export function useGameReplay() {
  return useContext(GameReplayContext)
}

/** A1-13：觀戰者狀態，子遊戲可讀取以隱藏操作按鈕、僅顯示結果 */
export const GameSpectatorContext = createContext<boolean>(false)
export function useGameSpectator(): boolean {
  return useContext(GameSpectatorContext)
}

/** AUDIT #26：遊戲內「簡化動畫」設定即時反映；使用者設定或系統 prefers-reduced-motion */
export const GameReduceMotionContext = createContext<boolean>(false)
export function useGameReduceMotion(): boolean {
  return useContext(GameReduceMotionContext)
}

/** Q2：試玩限 3 局 — 子遊戲每局結束時呼叫 onRoundEnd，局數用盡後顯示登入 CTA。GAMES_500 #212：roundsLeft 與登入狀態同步可於登入後重設 trial 局數。 */
export interface TrialContextValue {
  roundsLeft: number
  onRoundEnd: () => void
  isTrialMode: boolean
}
export const GameTrialContext = createContext<TrialContextValue | null>(null)
export function useGameTrial(): TrialContextValue | null {
  return useContext(GameTrialContext)
}

const MIN_PINCH_SCALE = 0.85
const MAX_PINCH_SCALE = 1.4

/** 85 換遊戲快捷：傳入列表與回調，設定內可快速切換 */
export interface SwitchGameItem {
  id: string
  name: string
}

interface GameWrapperProps {
  title: string
  description?: string
  onExit: () => void
  children: React.ReactNode
  players?: string[]
  /** 85 換遊戲：列表（不含當前）與選擇回調 */
  switchGameList?: SwitchGameItem[]
  onSwitchGame?: (id: string) => void
  currentGameId?: string | null
  /** 100 分享遊戲邀請：房間連結，有則分享此 URL */
  shareInviteUrl?: string | null
  /** A1-13：當前用戶是否為觀戰者（不參與遊戲，僅觀看） */
  isSpectator?: boolean
  /** T057 P1：再玩一局（新房間）— 房間模式時建立同款新房間並導向 */
  onPlayAgain?: () => void
  /** T059 P1：檢舉入口 — 房間/遊戲內檢舉，送 API 與日誌 */
  reportContext?: { roomSlug?: string; gameId?: string }
  /** Q2：免登入試玩 — 限 N 局，局數用盡後顯示登入 CTA */
  isGuestTrial?: boolean
  trialRoundsMax?: number
}

/** 81 統一頂部：返回 / 遊戲名 / 設定；84 返回前確認；83 全螢幕；85 換遊戲 */
function GameWrapperHeader({
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
  gameHasStarted,
  onShowRules,
  showRulesButton,
  fullscreenUnsupported,
  isPaused,
  onTogglePause,
  gameStats,
  replayEvents = [],
  isSpectator = false,
  onPlayAgain,
  onOpenReport,
  trialRoundsLeft,
  isRulesOpen = false,
  rulesButtonRef,
  showSwitchConfirm = false,
  setShowSwitchConfirm,
  pendingSwitchGameId = null,
  setPendingSwitchGameId,
  onConfirmSwitchGame,
}: {
  title: string
  description?: string
  onExit: () => void
  players: string[]
  isFullscreen: boolean
  onToggleFullscreen: () => void
  switchGameList?: SwitchGameItem[]
  onSwitchGame?: (id: string) => void
  /** GAMES_500 #222：換遊戲前若已開始則先確認；未提供時直接用 onSwitchGame */
  onSwitchGameClick?: (id: string) => void
  currentGameId?: string | null
  shareInviteUrl?: string | null
  gameHasStarted?: boolean
  onShowRules?: () => void
  onPlayAgain?: () => void
  onOpenReport?: () => void
  showRulesButton?: boolean
  isRulesOpen?: boolean
  /** GAMES_500 #188：規則關閉時焦點還原 */
  rulesButtonRef?: React.RefObject<HTMLButtonElement | null>
  /** GAMES_500 #222：換遊戲確認 */
  showSwitchConfirm?: boolean
  setShowSwitchConfirm?: (v: boolean) => void
  pendingSwitchGameId?: string | null
  setPendingSwitchGameId?: (v: string | null) => void
  onConfirmSwitchGame?: (id: string) => void
  fullscreenUnsupported?: boolean
  isPaused?: boolean
  onTogglePause?: () => void
  /** 任務 26：本局統計 */
  gameStats?: GameStatsSnapshot
  /** 任務 29：本局回放事件列表 */
  replayEvents?: ReplayEvent[]
  /** A1-13：是否為觀戰者 */
  isSpectator?: boolean
  /** Q2：試玩剩餘局數（僅試玩模式顯示） */
  trialRoundsLeft?: number
}) {
  const passPhone = usePassPhone()
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const settingsRef = useRef<HTMLDivElement | null>(null)
  const hasStarted = gameHasStarted ?? false

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

  return (
    <>
      {/* RWD-12：全螢幕時頂部 safe-area-pt 避開 notch */}
      <div className={`flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-white/[0.02] flex-wrap gap-2 ${isFullscreen ? 'safe-area-pt' : ''}`}>
        {/* 81 左：返回箭頭觸控區域擴大至 48px；84/30 已開始才彈確認，未開始直接返回 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (hasStarted ? setShowExitConfirm(true) : onExit())}
            className="games-focus-ring inline-flex items-center justify-center gap-2 games-touch-target p-3 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white touch-manipulation"
            aria-label="返回大廳（遊戲列表）"
          >
            <ChevronLeft className="w-5 h-5 shrink-0" aria-hidden />
            <span className="text-sm font-medium hidden sm:inline">返回大廳</span>
          </button>
          {onPlayAgain && (
            <button
              type="button"
              onClick={onPlayAgain}
              className="inline-flex items-center justify-center gap-2 games-touch-target px-3 py-2 rounded-full bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/40 text-primary-300 text-sm font-medium transition-colors"
              aria-label="再玩一局（建立新房間）"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">再玩一局</span>
            </button>
          )}
        </div>
        {/* 81 中：標題置中；任務 18 問號觸發規則 */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 justify-center">
          <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20 shrink-0">
            <Trophy className="w-5 h-5 text-primary-400" />
          </div>
          <div className="min-w-0 text-center">
            {/* RWD-13 / RWD-7：遊戲標題階層 text-xl md:text-2xl；RWD-19 truncate */}
            <h2 className="text-xl md:text-2xl font-bold text-white font-display truncate" title={title}>{title}</h2>
            {description && <p className="text-xs text-white/40 line-clamp-1">{description}</p>}
            {trialRoundsLeft != null && trialRoundsLeft > 0 && (
              <p className="text-xs text-accent-400 mt-0.5" aria-live="polite">試玩剩餘 {trialRoundsLeft} 局</p>
            )}
          </div>
          {showRulesButton && onShowRules && (
            <button
              ref={rulesButtonRef}
              type="button"
              onClick={onShowRules}
              className="shrink-0 games-touch-target flex items-center justify-center p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors games-focus-ring"
              aria-label="顯示遊戲規則"
              aria-expanded={isRulesOpen}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          )}
        </div>
        {/* 81 右：玩家數、設定下拉（傳手機/全螢幕/分享/返回） */}
        <div className="flex items-center gap-2">
          {players.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
              <Users className="w-3.5 h-3.5" />
              <span>{players.length} 位</span>
            </div>
          )}
          <div className="relative" ref={settingsRef}>
            <button
              type="button"
              onClick={() => setShowSettingsMenu((s) => !s)}
              className="games-touch-target flex items-center justify-center p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white games-focus-ring"
              aria-label="設定"
              aria-expanded={showSettingsMenu}
            >
              <Settings className="w-5 h-5" />
            </button>
            {showSettingsMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-[#0a0a1a] border border-white/10 p-2 shadow-xl z-20"
                onMouseDown={(e) => e.preventDefault()}
              >
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
                {onTogglePause != null && (
                  <button
                    type="button"
                    onClick={() => { onTogglePause(); setShowSettingsMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10 min-h-[48px]"
                  >
                    {isPaused ? '繼續遊戲' : '暫停遊戲'}
                  </button>
                )}
                {gameStats && (gameStats.durationSec != null || gameStats.correctCount != null || gameStats.punishmentCount != null) && (
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
                        navigator.clipboard?.writeText(text).then(() => { /* copied */ }).catch(() => {})
                      }}
                      className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs text-white/70 hover:bg-white/10 min-h-[44px]"
                      aria-label="複製本局回放"
                    >
                      <Share2 className="w-3.5 h-3.5" /> 複製回放
                    </button>
                  </div>
                )}
                <button type="button" onClick={handleShare} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10">
                  <Share2 className="w-4 h-4" /> 分享
                </button>
                {onOpenReport && (
                  <button type="button" onClick={() => { onOpenReport(); setShowSettingsMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-white/80 hover:bg-white/10 min-h-[48px]">
                    <Flag className="w-4 h-4" /> 檢舉
                  </button>
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
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                          <input type="checkbox" checked={passPhone.antiPeek} onChange={toggleAntiPeek} className="rounded" />
                          防偷看
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                          <input type="checkbox" checked={passPhone.randomOrder} onChange={toggleRandomOrder} className="rounded" />
                          亂序傳遞
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                          <input type="checkbox" checked={passPhone.ttsEnabled} onChange={toggleTts} className="rounded" />
                          TTS 語音
                        </label>
                      </div>
                    )}
                  </div>
                )}
                {/* 85 換遊戲快捷：排除當前遊戲；GAMES_500 #222 遊戲進行中換遊戲先確認 */}
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 84 返回確認彈窗 */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 safe-area-px safe-area-pb"
            onClick={() => setShowExitConfirm(false)}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="exit-confirm-title"
              aria-describedby="exit-confirm-desc"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-4 md:p-6 max-w-sm w-full shadow-xl safe-area-px"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="exit-confirm-title" className="sr-only">離開遊戲確認</h3>
              <p className="text-white/90 font-medium mb-4" id="exit-confirm-desc">遊戲進行中，確定要離開嗎？</p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 min-h-[48px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => { setShowExitConfirm(false); onExit(); }}
                  className="flex-1 min-h-[48px] px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium"
                >
                  離開
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GAMES_500 #222：換遊戲確認 — 遊戲進行中時提示重新開始 */}
      <AnimatePresence>
        {showSwitchConfirm && pendingSwitchGameId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 safe-area-px safe-area-pb"
            onClick={() => { setShowSwitchConfirm?.(false); setPendingSwitchGameId?.(null); }}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="switch-confirm-title"
              aria-describedby="switch-confirm-desc"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-4 md:p-6 max-w-sm w-full shadow-xl safe-area-px"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="switch-confirm-title" className="sr-only">換遊戲確認</h3>
              <p className="text-white/90 font-medium mb-4" id="switch-confirm-desc">遊戲進行中，換遊戲將重新開始，確定嗎？</p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <button
                  type="button"
                  onClick={() => { setShowSwitchConfirm?.(false); setPendingSwitchGameId?.(null); }}
                  className="flex-1 min-h-[48px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (pendingSwitchGameId) onConfirmSwitchGame?.(pendingSwitchGameId)
                    setShowSwitchConfirm?.(false)
                    setPendingSwitchGameId?.(null)
                  }}
                  className="flex-1 min-h-[48px] px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium"
                >
                  確定
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const GAMES_PLAYED_KEY = 'cheersin_games_played'

const TRIAL_ROUNDS_DEFAULT = 3

export default function GameWrapper({
  title,
  description,
  onExit,
  children,
  players = [],
  switchGameList,
  onSwitchGame,
  currentGameId = null,
  shareInviteUrl = null,
  isSpectator = false,
  onPlayAgain,
  reportContext,
  isGuestTrial = false,
  trialRoundsMax = TRIAL_ROUNDS_DEFAULT,
}: GameWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [rulesContent, setRulesContent] = useState<string | null>(null)
  const [showRulesModal, setShowRulesModal] = useState(false)
  /** GAMES_500 #188：規則關閉時焦點還原至觸發按鈕；#232 規則內容 focus 陷阱 */
  const rulesButtonRef = useRef<HTMLButtonElement>(null)
  const rulesModalRef = useRef<HTMLDivElement>(null)
  /** 任務 77：規則 Modal 開啟時 focus 關閉鈕；關閉時 focus 回觸發鈕由 closeRulesModal 處理 */
  useEffect(() => {
    if (!showRulesModal || !rulesModalRef.current) return
    const container = rulesModalRef.current
    const closeBtn = container.querySelector<HTMLButtonElement>('button[aria-label="關閉規則"]')
    const id = setTimeout(() => closeBtn?.focus(), 50)
    return () => clearTimeout(id)
  }, [showRulesModal])
  useEffect(() => {
    if (!showRulesModal || !rulesModalRef.current) return
    const container = rulesModalRef.current
    const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (!container.contains(document.activeElement)) return
      const nodes = container.querySelectorAll<HTMLElement>(FOCUSABLE)
      const list = Array.from(nodes).filter((el) => el.offsetParent !== null)
      if (list.length === 0) return
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showRulesModal])
  const closeRulesModal = useCallback(() => {
    setShowRulesModal(false)
    setTimeout(() => rulesButtonRef.current?.focus(), 0)
  }, [])
  const [showReportModal, setShowReportModal] = useState(false)
  /** Q2：試玩限 N 局，局數用盡後顯示登入 CTA */
  const [trialRoundsLeft, setTrialRoundsLeft] = useState(trialRoundsMax)
  const [showTrialEndModal, setShowTrialEndModal] = useState(false)
  /** GAMES_500 #224：試玩局數扣減應保持原子性（單一 setState 內完成 prev→next 與 modal 觸發） */
  const onTrialRoundEnd = useCallback(() => {
    setTrialRoundsLeft((prev) => {
      if (prev <= 1) {
        setShowTrialEndModal(true)
        return 0
      }
      return prev - 1
    })
  }, [])
  const [reportSubmitted, setReportSubmitted] = useState(false)
  const [reportType, setReportType] = useState<string>('其他')
  const [reportDesc, setReportDesc] = useState('')
  const [reportSending, setReportSending] = useState(false)
  const [contentScale, setContentScale] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  /** 任務 21：全螢幕不支援時（如 iOS Safari）顯示替代提示 */
  const [fullscreenUnsupported, setFullscreenUnsupported] = useState(false)
  /** 任務 22：暫停狀態，顯示遮罩並可凍結子遊戲計時 */
  const [isPaused, setIsPaused] = useState(false)
  /** 任務 30：子遊戲可透過 useGameProgress().setHasStarted(true) 標記已開始 */
  const [gameHasStarted, setGameHasStarted] = useState(false)
  /** GAMES_500 #222：換遊戲確認 — 遊戲進行中時先彈確認 */
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false)
  const [pendingSwitchGameId, setPendingSwitchGameId] = useState<string | null>(null)
  /** 任務 26：本局統計，子遊戲可透過 useGameStats().setStats 更新。GAMES_500 #235：本局統計子遊戲可選推送 — 各子遊戲可選呼叫 setStats。 */
  const [gameStats, setGameStats] = useState<GameStatsSnapshot>({})
  /** 任務 29：本局回放事件，子遊戲可透過 useGameReplay().addEvent 推送 */
  const [replayEvents, setReplayEvents] = useState<ReplayEvent[]>([])
  /** AUDIT #26：簡化動畫 — 使用者設定即時反映，或系統 prefers-reduced-motion */
  const systemReduced = useReducedMotion()
  const [userReduceMotion, setUserReduceMotion] = useState(false)
  useEffect(() => {
    setUserReduceMotion(getReduceMotion())
    const on = () => setUserReduceMotion(getReduceMotion())
    window.addEventListener('cheersin-games-reduce-motion-change', on)
    return () => window.removeEventListener('cheersin-games-reduce-motion-change', on)
  }, [])
  const reducedMotion = !!systemReduced || userReduceMotion
  const contentScaleRef = useRef(1)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pinchStartDistRef = useRef(0)
  const pinchStartScaleRef = useRef(1)
  /** 任務 17：三指滑動換遊戲 — 記錄起始 X 與是否正在追蹤 */
  const threeFingerStartXRef = useRef<number>(0)
  const threeFingerCurrentXRef = useRef<number>(0)
  const threeFingerTrackingRef = useRef(false)
  /** GAMES_500 #220：雙指縮放時不觸發全屏 — 全屏按鈕若在雙指後誤觸則忽略 */
  const multiTouchActiveRef = useRef(false)
  const multiTouchClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** GAMES_500 #22（可選）：動態 title 變更時螢幕閱讀器 announce */
  const [titleAnnouncement, setTitleAnnouncement] = useState('')
  contentScaleRef.current = contentScale

  /** GAMES_500 #222：換遊戲前若已開始則先確認，否則直接換 */
  const handleSwitchGameClick = useCallback(
    (gameId: string) => {
      if (gameHasStarted) {
        setPendingSwitchGameId(gameId)
        setShowSwitchConfirm(true)
      } else {
        onSwitchGame?.(gameId)
      }
    },
    [gameHasStarted, onSwitchGame]
  )

  /** GAMES_500 #231 #220：全螢幕切換；雙指縮放後短時間內不觸發全屏避免誤觸 */
  const handleToggleFullscreen = useCallback(() => {
    if (multiTouchActiveRef.current) return
    const el = wrapperRef.current
    if (!el) return
    const doc = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => Promise<void> }
    const elWithWebkit = el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }
    const isInFullscreen = !!document.fullscreenElement || !!doc.webkitFullscreenElement
    if (isInFullscreen) {
      const exit = document.exitFullscreen ?? doc.webkitExitFullscreen
      exit?.()?.then(() => { setIsFullscreen(false); setFullscreenUnsupported(false); }).catch(() => {})
    } else {
      const request = el.requestFullscreen ?? elWithWebkit.webkitRequestFullscreen
      request?.call(el)
        ?.then(() => { setIsFullscreen(true); setFullscreenUnsupported(false); })
        .catch(() => setFullscreenUnsupported(true))
    }
  }, [])
  useEffect(() => {
    const doc = document as Document & { webkitFullscreenElement?: Element }
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement || !!doc.webkitFullscreenElement)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', onFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
    }
  }, [])

  /** 遊戲次數寫入：進入遊戲時 +1 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(GAMES_PLAYED_KEY)
      const n = raw ? Math.max(0, parseInt(raw, 10) || 0) : 0
      localStorage.setItem(GAMES_PLAYED_KEY, String(n + 1))
    } catch {
      /* ignore */
    }
  }, [])

  /** 任務 26 / 29：換遊戲時清空本局統計與回放 */
  useEffect(() => {
    setGameStats({})
    setReplayEvents([])
  }, [currentGameId])

  /** 任務 29：推送回放事件，保留最近 MAX_REPLAY_EVENTS 筆 */
  const addReplayEvent = useCallback((e: Omit<ReplayEvent, 'ts'>) => {
    setReplayEvents((prev) => [...prev.slice(-(MAX_REPLAY_EVENTS - 1)), { ...e, ts: Date.now() }])
  }, [])

  /** 任務 18：規則改為點擊問號觸發，長按不再觸發規則 */
  const handleTouchStart = useCallback(() => {
    /* 僅保留給雙指縮放用，規則改由問號按鈕觸發 */
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  /** 任務 19：快捷鍵 Space / 1-9 註冊表 */
  const spaceHandlerRef = useRef<(() => void) | null>(null)
  const digitHandlersRef = useRef<Record<number, () => void>>({})
  const registerSpace = useCallback((fn: () => void) => {
    spaceHandlerRef.current = fn
    return () => { spaceHandlerRef.current = null }
  }, [])
  const registerDigit = useCallback((digit: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, fn: () => void) => {
    digitHandlersRef.current[digit] = fn
    return () => { delete digitHandlersRef.current[digit] }
  }, [])
  /** 任務 22：暫停切換 */
  const togglePause = useCallback(() => setIsPaused((p) => !p), [])

  /** GAMES_500 #309：全屏時 body 加 class 隱藏導航與底欄 */
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (isFullscreen) document.body.classList.add('fullscreen-hide-chrome')
    return () => document.body.classList.remove('fullscreen-hide-chrome')
  }, [isFullscreen])

  /** GAMES_500 #186 #22：遊戲標題與 document title 同步；變更時螢幕閱讀器 announce（可選） */
  const GAMES_PAGE_TITLE = '派對遊樂場 | Cheersin — 你的 AI 派對靈魂伴侶'
  useEffect(() => {
    if (typeof document !== 'undefined') document.title = `${title} | 派對遊樂場`
    setTitleAnnouncement(`頁面標題：${title} | 派對遊樂場`)
    return () => { if (typeof document !== 'undefined') document.title = GAMES_PAGE_TITLE }
  }, [title])

  /** GAMES_500 #220：unmount 時清除雙指防誤觸計時 */
  useEffect(() => {
    return () => {
      if (multiTouchClearTimerRef.current) clearTimeout(multiTouchClearTimerRef.current)
    }
  }, [])

  /** GAMES_500 #221：規則展開時背景不捲動（body overflow） */
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (showRulesModal) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [showRulesModal])

  /** GAMES_500 #188：規則 modal 按 Esc 關閉並還原焦點 */
  useEffect(() => {
    if (!showRulesModal) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRulesModal() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showRulesModal, closeRulesModal])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        setIsPaused((p) => !p)
        return
      }
      if (e.key === ' ') {
        e.preventDefault()
        spaceHandlerRef.current?.()
        return
      }
      const d = e.key >= '1' && e.key <= '9' ? Number(e.key) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 : 0
      if (d) digitHandlersRef.current[d]?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  /** 雙指縮放：適應不同視力（React.TouchList 與 DOM TouchList 相容） */
  const getTouchDistance = (touches: React.TouchList | TouchList) => {
    if (touches.length < 2) return 0
    return Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY)
  }

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dist = getTouchDistance(e.touches)
      if (pinchStartDistRef.current > 0) {
        const ratio = dist / pinchStartDistRef.current
        const next = Math.min(MAX_PINCH_SCALE, Math.max(MIN_PINCH_SCALE, pinchStartScaleRef.current * ratio))
        setContentScale(next)
      } else {
        pinchStartDistRef.current = dist
        pinchStartScaleRef.current = contentScaleRef.current
      }
    }
  }, [])

  const handleTouchStartPinch = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchStartDistRef.current = getTouchDistance(e.touches)
      pinchStartScaleRef.current = contentScaleRef.current
    } else {
      pinchStartDistRef.current = 0
    }
  }, [])

  const handleTouchEndPinch = useCallback(() => {
    pinchStartDistRef.current = 0
  }, [])

  /** 任務 17：三指滑動換遊戲 — 左/右滑切換上/下一款 */
  const handleTouchStartThree = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 3 && switchGameList?.length && onSwitchGame) {
      threeFingerTrackingRef.current = true
      threeFingerStartXRef.current = (e.touches[0].clientX + e.touches[1].clientX + e.touches[2].clientX) / 3
      threeFingerCurrentXRef.current = threeFingerStartXRef.current
    }
  }, [switchGameList?.length, onSwitchGame])

  const handleTouchMoveThree = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 3) {
      threeFingerCurrentXRef.current = (e.touches[0].clientX + e.touches[1].clientX + e.touches[2].clientX) / 3
    }
  }, [])

  const handleTouchEndThree = useCallback(() => {
    if (!threeFingerTrackingRef.current) return
    threeFingerTrackingRef.current = false
    if (!switchGameList?.length || !onSwitchGame || !currentGameId) return
    const delta = threeFingerCurrentXRef.current - threeFingerStartXRef.current
    const idx = switchGameList.findIndex((g) => g.id === currentGameId)
    if (idx < 0) return
    if (delta > 60 && idx < switchGameList.length - 1) {
      onSwitchGame(switchGameList[idx + 1]!.id)
    } else if (delta < -60 && idx > 0) {
      onSwitchGame(switchGameList[idx - 1]!.id)
    }
  }, [switchGameList, onSwitchGame, currentGameId])

  return (
    <GameSessionProvider players={players}>
      <GameRulesContext.Provider value={{ setRulesContent }}>
      <GameProgressContext.Provider value={{ hasStarted: gameHasStarted, setHasStarted: setGameHasStarted }}>
      <GameHotkeyContext.Provider value={{ registerSpace, registerDigit }}>
      <GamePauseContext.Provider value={{ isPaused, setPaused: setIsPaused }}>
      <GameStatsContext.Provider value={{ stats: gameStats, setStats: (s) => setGameStats((prev) => ({ ...prev, ...s })) }}>
      <GameReplayContext.Provider value={{ events: replayEvents, addEvent: addReplayEvent }}>
      <GameSpectatorContext.Provider value={isSpectator}>
      <GameReduceMotionContext.Provider value={reducedMotion}>
      <GameTrialContext.Provider value={isGuestTrial ? { roundsLeft: trialRoundsLeft, onRoundEnd: onTrialRoundEnd, isTrialMode: true } : { roundsLeft: 0, onRoundEnd: () => {}, isTrialMode: false }}>
          <motion.div
            ref={wrapperRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative w-full max-w-6xl mx-auto glass-card overflow-hidden flex flex-col ${isFullscreen ? 'min-h-[100dvh]' : 'min-h-[min(600px,80vh)]'}`}
          >
            {/* GAMES_500 #22：動態 title 變更時螢幕閱讀器 announce */}
            {titleAnnouncement && (
              <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{titleAnnouncement}</div>
            )}
            <GameWrapperHeader
              title={title}
              description={description}
              onExit={onExit}
              players={players}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
              switchGameList={switchGameList}
              onSwitchGame={onSwitchGame}
              onSwitchGameClick={onSwitchGame ? handleSwitchGameClick : undefined}
              currentGameId={currentGameId}
              shareInviteUrl={shareInviteUrl}
              gameHasStarted={gameHasStarted}
              onShowRules={() => setShowRulesModal(true)}
              showRulesButton={!!rulesContent}
              isRulesOpen={showRulesModal}
              rulesButtonRef={rulesButtonRef}
              fullscreenUnsupported={fullscreenUnsupported}
              isPaused={isPaused}
              onTogglePause={togglePause}
              gameStats={gameStats}
              replayEvents={replayEvents}
              isSpectator={isSpectator}
              onPlayAgain={onPlayAgain}
              onOpenReport={reportContext ? () => setShowReportModal(true) : undefined}
              trialRoundsLeft={isGuestTrial ? trialRoundsLeft : undefined}
              showSwitchConfirm={showSwitchConfirm}
              setShowSwitchConfirm={setShowSwitchConfirm}
              pendingSwitchGameId={pendingSwitchGameId}
              setPendingSwitchGameId={setPendingSwitchGameId}
              onConfirmSwitchGame={(id) => { onSwitchGame?.(id); setShowSwitchConfirm(false); setPendingSwitchGameId(null); }}
            />

          {/* T059 P1：檢舉 modal — 類型、說明、送出後顯示「已收到」 */}
          {showReportModal && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="檢舉">
              <div className="w-full max-w-sm rounded-2xl bg-[#0a0a1a] border border-white/10 p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Flag className="w-5 h-5 text-primary-400" /> 檢舉
                  </h3>
                  <ModalCloseButton onClick={() => { setShowReportModal(false); setReportSubmitted(false); setReportDesc(''); setReportType('其他'); }} aria-label="關閉" className="rounded-full" />
                </div>
                {reportSubmitted ? (
                  <p className="text-primary-400 font-medium">已收到，感謝您的回報。</p>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setReportSending(true)
                      try {
                        await fetch('/api/report', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ type: reportType, description: reportDesc.trim() || undefined, context: reportContext }),
                        })
                        setReportSubmitted(true)
                      } catch {
                        /* ignore */
                      } finally {
                        setReportSending(false)
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="report-type" className="block text-white/70 text-sm mb-1">類型</label>
                      <select id="report-type" value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white text-sm" aria-label="檢舉類型">
                        <option value="不當內容">不當內容</option>
                        <option value="騷擾">騷擾</option>
                        <option value="作弊或濫用">作弊或濫用</option>
                        <option value="其他">其他</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="report-desc" className="block text-white/70 text-sm mb-1">說明（選填）</label>
                      <textarea id="report-desc" value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} rows={3} maxLength={500} placeholder="簡述情況" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30 text-sm resize-none" aria-label="檢舉說明" />
                    </div>
                    <button type="submit" disabled={reportSending} className="w-full games-touch-target rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-medium">
                      {reportSending ? '送出中…' : '送出'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* 任務 22：暫停遮罩 */}
          {isPaused && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4" role="dialog" aria-label="遊戲已暫停">
              <p className="text-white text-xl font-bold mb-4">遊戲已暫停</p>
              <button
                type="button"
                onClick={togglePause}
                className="games-touch-target px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold"
              >
                繼續
              </button>
              <p className="text-white/50 text-xs mt-2">也可按 P 鍵繼續</p>
            </div>
          )}
          {/* 內容區：RWD 1–4 主容器 px/py 隨 breakpoint；RWD 2 safe-area；RWD 11 overflow-y auto */}
          <div
            className="flex-1 px-4 sm:px-6 md:px-8 py-4 md:py-6 lg:py-8 relative overflow-y-auto min-h-0 touch-manipulation safe-area-pb safe-area-px"
            onTouchStart={(e) => {
              if (e.touches.length >= 2) multiTouchActiveRef.current = true
              if (e.touches.length === 1) handleTouchStart()
              if (e.touches.length === 2) handleTouchStartPinch(e)
              if (e.touches.length === 3) handleTouchStartThree(e)
            }}
            onTouchEnd={(e) => {
              handleTouchEnd()
              if (e.touches.length === 0) {
                if (multiTouchClearTimerRef.current) clearTimeout(multiTouchClearTimerRef.current)
                multiTouchClearTimerRef.current = setTimeout(() => {
                  multiTouchActiveRef.current = false
                  multiTouchClearTimerRef.current = null
                }, 400)
                handleTouchEndPinch()
                handleTouchEndThree()
              }
            }}
            onTouchMove={(e) => {
              handleTouchMove(e)
              if (e.touches.length === 3) handleTouchMoveThree(e)
            }}
            onTouchCancel={(e) => {
              handleTouchEnd()
              if (e.touches.length === 0) { handleTouchEndPinch(); handleTouchEndThree(); }
            }}
            onTouchEndCapture={handleTouchEndPinch}
            style={{ touchAction: 'manipulation' }}
          >
            {/* RWD 1/5 max-w-xl；RWD-20 遊戲區 text-center 一致；RWD-22 min-w-0 不固定寬度 */}
            <div
              className="origin-top transition-transform duration-150 w-full max-w-xl mx-auto text-center min-w-0"
              style={{ transform: `scale(${contentScale})` }}
            >
              {children}
            </div>
            <BrandWatermark />
          </div>
        </motion.div>

        {/* Q2：試玩限 3 局已結束 — 登入 CTA */}
        <AnimatePresence>
          {showTrialEndModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 safe-area-px safe-area-pb"
              role="dialog"
              aria-modal="true"
              aria-labelledby="trial-end-title"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-sm rounded-2xl bg-[#0a0a1a] border border-white/10 p-6 shadow-xl text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 id="trial-end-title" className="text-xl font-bold text-white mb-2">試玩限 3 局已結束</h2>
                <p className="text-white/70 text-sm mb-6">登入以繼續玩、開房間、保存進度。升級方案可解鎖更多局數。</p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="min-h-[48px] flex items-center justify-center rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium"
                    onClick={() => setShowTrialEndModal(false)}
                  >
                    登入
                  </Link>
                  <Link
                    href="/pricing"
                    className="min-h-[48px] flex items-center justify-center rounded-xl bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/40 text-accent-300 font-medium"
                    onClick={() => setShowTrialEndModal(false)}
                  >
                    升級方案
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setShowTrialEndModal(false); onExit(); }}
                    className="min-h-[48px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium"
                  >
                    返回大廳
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        </GameTrialContext.Provider>
        </GameReduceMotionContext.Provider>
        </GameSpectatorContext.Provider>
        </GameReplayContext.Provider>
        {/* 99 長按規則彈窗：手機用 Bottom Sheet 自底部滑出 */}
        <AnimatePresence>
          {showRulesModal && rulesContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 sm:p-4 safe-area-px safe-area-pb"
              onClick={closeRulesModal}
            >
              <motion.div
                ref={rulesModalRef}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="glass-card p-6 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[85vh] sm:max-h-[70vh] overflow-y-auto safe-area-pb safe-area-px"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-1 rounded-full bg-white/30 mx-auto mb-4 sm:hidden" aria-hidden />
                {/* 任務 88：規則內容結構化 h2/段落，螢幕閱讀器可依標題導航 */}
                <h2 id="rules-modal-heading" className="text-lg font-bold text-white mb-3">規則說明</h2>
                <div className="games-body text-white/80 space-y-2" role="region" aria-labelledby="rules-modal-heading">
                  {(stripHtml(rulesContent) || '')
                    .split(/\n\n+/)
                    .filter((p) => p.trim())
                    .map((para, i) => (
                      <p key={i} className="whitespace-pre-line">{para.trim()}</p>
                    ))}
                </div>
                <button
                  type="button"
                  onClick={closeRulesModal}
                  className="mt-4 games-touch-target px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium games-focus-ring"
                  aria-label="關閉規則"
                >
                  關閉
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      <PassPhoneMode />
      </GameStatsContext.Provider>
      </GamePauseContext.Provider>
      </GameHotkeyContext.Provider>
      </GameProgressContext.Provider>
      </GameRulesContext.Provider>
    </GameSessionProvider>
  )
}
