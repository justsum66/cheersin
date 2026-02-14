'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useReducedMotion } from 'framer-motion'
import { getReduceMotion } from '@/lib/games-settings'
import { getGameMeta } from '@/config/games.config'
import { useGameStore } from '@/store/useGameStore'
import type { GameWrapperProps } from './GameWrapperTypes'

const GAMES_PLAYED_KEY = 'cheersin_games_played'
const TRIAL_ROUNDS_DEFAULT = 3
const MIN_PINCH_SCALE = 0.85
const MAX_PINCH_SCALE = 1.4
const GAMES_PAGE_TITLE = '派對遊樂場 | Cheersin — 你的 AI 派對靈魂伴侶'

export function useGameWrapperLogic(props: GameWrapperProps) {
  const {
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
    maxPlayers,
    onSkipRound,
    onRestart,
    anonymousMode = false,
    isHost = false,
    onToggleAnonymous,
  } = props

  // Store Integration
  const {
    gameState,
    setGameState,
    setTrial,
    trial,
    decrementTrialRound,
    resetGame,
    selectedMode,
    setSelectedMode
  } = useGameStore()

  // Phase 1 Task 14: Mode Selection Logic
  const gameMeta = currentGameId ? getGameMeta(currentGameId) : null
  const availableModes = gameMeta?.modes || []
  // Show selector if modes exist AND no mode selected AND not spectator (spectators join room which has mode set in host? actually specific implementation needed for spectator sync)
  // For now, assume host/local player needs to select mode.
  const showModeSelector = availableModes.length > 0 && !selectedMode

  const onSelectMode = useCallback((modeId: string) => {
    setSelectedMode(modeId)
  }, [setSelectedMode])

  // Derived from Store
  const isPaused = gameState === 'paused'
  const gameHasStarted = gameState !== 'lobby'
  const trialRoundsLeft = trial.roundsLeft

  // Sync Props to Store
  useEffect(() => {
    setTrial(isGuestTrial, trialRoundsMax)
  }, [isGuestTrial, trialRoundsMax, setTrial])

  // Initial Reset
  useEffect(() => {
    if (!currentGameId && !isSpectator) {
      resetGame()
    }
  }, [currentGameId, isSpectator, resetGame])

  // Local UI State
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [rulesContent, setRulesContent] = useState<string | null>(null)
  const [showRulesModal, setShowRulesModal] = useState(false)
  const rulesButtonRef = useRef<HTMLButtonElement>(null)
  const rulesModalRef = useRef<HTMLDivElement>(null)

  const [showReportModal, setShowReportModal] = useState(false)
  const [showTrialEndModal, setShowTrialEndModal] = useState(false)

  const [reportSubmitted, setReportSubmitted] = useState(false)
  const [reportType, setReportType] = useState<string>('其他')
  const [reportDesc, setReportDesc] = useState('')
  const [reportSending, setReportSending] = useState(false)

  const [contentScale, setContentScale] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenUnsupported, setFullscreenUnsupported] = useState(false)
  const [showCountdown, setShowCountdown] = useState(true)
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false)
  const [pendingSwitchGameId, setPendingSwitchGameId] = useState<string | null>(null)
  const [titleAnnouncement, setTitleAnnouncement] = useState('')

  const systemReduced = useReducedMotion()
  const [userReduceMotion, setUserReduceMotion] = useState(false)

  // Reduced Motion Logic
  useEffect(() => {
    setUserReduceMotion(getReduceMotion())
    const on = () => setUserReduceMotion(getReduceMotion())
    window.addEventListener('cheersin-games-reduce-motion-change', on)
    return () => window.removeEventListener('cheersin-games-reduce-motion-change', on)
  }, [])
  const reducedMotion = !!systemReduced || userReduceMotion

  // Game/Audio Logic
  const setIsPaused = useCallback((paused: boolean | ((p: boolean) => boolean)) => {
    const next = typeof paused === 'function' ? paused(isPaused) : paused
    setGameState(next ? 'paused' : 'playing')
  }, [isPaused, setGameState])

  const togglePause = useCallback(() => {
    setGameState(gameState === 'paused' ? 'playing' : 'paused')
  }, [gameState, setGameState])

  const setGameHasStarted = useCallback((started: boolean) => {
    setGameState(started ? 'playing' : 'lobby')
  }, [setGameState])

  const onTrialRoundEnd = useCallback(() => {
    decrementTrialRound()
  }, [decrementTrialRound])

  // Watch trial end
  useEffect(() => {
    if (isGuestTrial && trialRoundsLeft <= 0 && gameHasStarted) {
      setShowTrialEndModal(true)
    }
  }, [trialRoundsLeft, isGuestTrial, gameHasStarted])

  // Countdown Logic matching Reduced Motion
  useEffect(() => {
    if (reducedMotion && showCountdown) {
      setShowCountdown(false)
      setGameHasStarted(true)
    }
  }, [reducedMotion, showCountdown, setGameHasStarted])

  const onCountdownComplete = useCallback(() => {
    setShowCountdown(false)
    setGameHasStarted(true)
  }, [setGameHasStarted])

  // Rules Modal Accessibility
  useEffect(() => {
    if (!showRulesModal || !rulesModalRef.current) return
    const closeBtn = rulesModalRef.current.querySelector<HTMLButtonElement>('button[aria-label="關閉規則"]')
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

  useEffect(() => {
    if (!showRulesModal) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRulesModal() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showRulesModal, closeRulesModal])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (showRulesModal) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [showRulesModal])

  // Fullscreen Logic
  const multiTouchActiveRef = useRef(false)
  const handleToggleFullscreen = useCallback(() => {
    if (multiTouchActiveRef.current) return
    const el = wrapperRef.current
    if (!el) return
    const doc = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => Promise<void> }
    const elWithWebkit = el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }
    const isInFullscreen = !!document.fullscreenElement || !!doc.webkitFullscreenElement
    if (isInFullscreen) {
      const exit = document.exitFullscreen ?? doc.webkitExitFullscreen
      exit?.()?.then(() => { setIsFullscreen(false); setFullscreenUnsupported(false); }).catch(() => { })
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

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (isFullscreen) document.body.classList.add('fullscreen-hide-chrome')
    return () => document.body.classList.remove('fullscreen-hide-chrome')
  }, [isFullscreen])

  // Title / Analytics
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(GAMES_PLAYED_KEY)
      const n = raw ? Math.max(0, parseInt(raw, 10) || 0) : 0
      localStorage.setItem(GAMES_PLAYED_KEY, String(n + 1))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') document.title = `${title} | 派對遊樂場`
    setTitleAnnouncement(`頁面標題：${title} | 派對遊樂場`)
    return () => { if (typeof document !== 'undefined') document.title = GAMES_PAGE_TITLE }
  }, [title])

  // Touch / Pinch Logic
  const contentScaleRef = useRef(1)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pinchStartDistRef = useRef(0)
  const pinchStartScaleRef = useRef(1)
  const threeFingerStartXRef = useRef<number>(0)
  const threeFingerCurrentXRef = useRef<number>(0)
  const threeFingerTrackingRef = useRef(false)
  const multiTouchClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  contentScaleRef.current = contentScale

  useEffect(() => {
    const ref = multiTouchClearTimerRef
    return () => {
      const tid = ref.current
      if (tid) clearTimeout(tid)
    }
  }, [])

  const getTouchDistance = (touches: React.TouchList | TouchList) => {
    if (touches.length < 2) return 0
    return Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY)
  }

  const handleTouchStart = useCallback(() => { }, [])
  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

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

  // Hotkeys
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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        togglePause() // Use store toggle
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
  }, [togglePause])

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

  const headerProps = {
    title,
    description,
    onExit,
    players,
    isFullscreen,
    onToggleFullscreen: handleToggleFullscreen,
    switchGameList,
    onSwitchGame,
    onSwitchGameClick: onSwitchGame ? handleSwitchGameClick : undefined,
    currentGameId,
    shareInviteUrl,
    onShowRules: () => setShowRulesModal(true),
    showRulesButton: !!rulesContent,
    isRulesOpen: showRulesModal,
    rulesButtonRef,
    fullscreenUnsupported,
    isSpectator,
    onPlayAgain,
    onOpenReport: reportContext ? () => setShowReportModal(true) : undefined,
    showSwitchConfirm,
    setShowSwitchConfirm,
    pendingSwitchGameId,
    setPendingSwitchGameId,
    onConfirmSwitchGame: (id: string) => {
      onSwitchGame?.(id)
      setShowSwitchConfirm(false)
      setPendingSwitchGameId(null)
    },
    maxPlayers,
    onSkipRound,
    onRestart,
    anonymousMode,
    isHost,
    onToggleAnonymous,
  }

  return {
    setRulesContent,
    wrapperRef,
    isFullscreen,
    titleAnnouncement,
    headerProps,
    showReportModal,
    setShowReportModal,
    reportContext,
    reportSubmitted,
    setReportSubmitted,
    reportType,
    reportDesc,
    reportSending,
    setReportSending,
    setReportType,
    setReportDesc,
    showTrialEndModal,
    setShowTrialEndModal,
    onExit,
    rulesContent,
    showRulesModal,
    closeRulesModal,
    rulesModalRef,
    isPaused,
    togglePause,
    contentScale,
    children,
    multiTouchActiveRef,
    multiTouchClearTimerRef,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStartPinch,
    handleTouchEndPinch,
    handleTouchStartThree,
    handleTouchMoveThree,
    handleTouchEndThree,
    trialRoundsLeft,
    onTrialRoundEnd,
    gameHasStarted,
    setGameHasStarted,
    showCountdown,
    onCountdownComplete,
    reducedMotion,
    isPausedState: isPaused,
    setIsPaused,
    currentGameId,
    registerSpace,
    registerDigit,
    showModeSelector,
    availableModes,
    onSelectMode,
  }
}
