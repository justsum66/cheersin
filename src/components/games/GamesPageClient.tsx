'use client'

import { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameRoom } from '@/hooks/useGameRoom'
import { getFontSize, getReduceMotion } from '@/lib/games-settings'
import { Gamepad2, Users, UserPlus, X, RotateCcw, Settings, Eye, EyeOff, Crown, GripVertical, Plus, Shuffle } from 'lucide-react'
import { ModalCloseButton } from '@/components/ui/ModalCloseButton'
import FeatureIcon from '@/components/ui/FeatureIcon'
import GameWrapper from '@/components/games/GameWrapper'
import type { DisplayCategory } from '@/components/games/Lobby'
/** P0-018：非首屏遊戲列表懶加載，降低大廳首屏 bundle */
const Lobby = lazy(() => import('@/components/games/Lobby').then((m) => ({ default: m.default })))
import GameErrorBoundary from '@/components/games/GameErrorBoundary'
import SettingsModal from '@/components/games/SettingsModal'
import AgeGate, { getAgeGatePassed } from '@/components/games/AgeGate'
import { PullToRefresh } from '@/components/PullToRefresh'
import { useSubscription } from '@/hooks/useSubscription'
import { useGameSound } from '@/hooks/useGameSound'
import { useNavVisibility } from '@/contexts/NavVisibilityContext'
import { getMaxRoomPlayers } from '@/lib/subscription'
import { LazyGame, prefetchGame } from '@/components/games/GameLazyMap'
import { gamesWithCategory, getGameMeta, GUEST_TRIAL_GAME_IDS, type GameId } from '@/config/games.config'
import { getActiveLaunchAnnouncements } from '@/config/announcements.config'
import toast from 'react-hot-toast'
import { getWeeklyPlayCounts, incrementWeeklyPlay } from '@/lib/games-weekly'
import { getLastSession, saveLastSession, clearLastSession } from '@/lib/games-last-session'
import { setGameRating } from '@/lib/games-favorites'
import { trackGameStart, trackGameEnd } from '@/lib/game-analytics'
import { Star } from 'lucide-react'
const STORAGE_KEY = 'cheersin_games_players'
const ROOM_JOINED_KEY = 'cheersin_room_joined'
const RECENT_GAMES_KEY = 'cheersin_games_recent'
const RECENT_GAMES_MAX = 5
/** 任務 28：首次教學已讀 key */
const TUTORIAL_DONE_KEY = 'cheersin_games_tutorial_done'
/** P0-009：訪客試玩次數（sessionStorage），達 3 次後強制登入 */
const GUEST_TRIAL_COUNT_KEY = 'cheersin_guest_trial_count'
const GUEST_TRIAL_LIMIT = 3
function getGuestTrialCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    const v = sessionStorage.getItem(GUEST_TRIAL_COUNT_KEY)
    return v ? Math.max(0, parseInt(v, 10)) : 0
  } catch {
    return 0
  }
}
function incrementGuestTrialCount(): void {
  if (typeof window === 'undefined') return
  try {
    const n = getGuestTrialCount() + 1
    sessionStorage.setItem(GUEST_TRIAL_COUNT_KEY, String(n))
  } catch {
    /* ignore */
  }
}
/** GAMES_500 #100：Lobby 與 GameWrapper 切換動畫時長常數化 */
const LOBBY_GAME_TRANSITION_MS = 300
/** GAMES_500 #138：建立房間成功後「已複製」按鈕回饋顯示時長（ms） */
const INVITE_COPY_FEEDBACK_MS = 2000

/** 任務 14：隨機暱稱候選（酒桌風） */
const RANDOM_NICKNAMES = ['酒神', '派對王', '乾杯俠', '骰子手', '轉盤王', '真心話王', '冒險家', '幸運星', '夜貓子', '派對動物', '酒桌霸主', '乾杯達人', '遊戲王', '歡樂製造機', '氣氛擔當']

/** PERSONA T015：年齡門檻僅首次進入 /games 顯示，存 sessionStorage，本 session 不再顯示 */
function GamesPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomSlug = searchParams.get('room')
  /** P1-122：篩選器狀態保持 — 從 URL ?tab= 讀取並同步回寫 */
  const LOBBY_TABS: DisplayCategory[] = ['couple', 'all', 'classic', 'vs', 'random', 'two']
  const tabParam = searchParams.get('tab')
  const lobbyDisplayFilter: DisplayCategory = (tabParam && LOBBY_TABS.includes(tabParam as DisplayCategory)) ? (tabParam as DisplayCategory) : 'classic'
  const handleLobbyTabChange = useCallback((cat: DisplayCategory) => {
    const p = new URLSearchParams(searchParams.toString())
    p.set('tab', cat)
    router.replace(`/games?${p.toString()}`, { scroll: false })
  }, [searchParams, router])
  const { tier } = useSubscription()
  const [ageVerified, setAgeVerified] = useState(false)
  useEffect(() => {
    setAgeVerified(getAgeGatePassed())
  }, [])
  /** 105 預載音效：首次互動時解鎖 AudioContext */
  const { preload } = useGameSound()
  const preloadCalled = useRef(false)
  const handlePreload = useCallback(() => {
    if (!preloadCalled.current) {
      preload()
      preloadCalled.current = true
    }
  }, [preload])
  const maxPlayers = getMaxRoomPlayers(tier)
  /** GAMES_500 #160：房間加入後自動 focus 至主內容 */
  const mainContentRef = useRef<HTMLDivElement>(null)
  const rateModalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inviteCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** ANA.1：遊戲開始時間，用於離開時計算 duration */
  const gameStartTimeRef = useRef<number>(0)
  const lastTrackedGameIdRef = useRef<string | null>(null)
  useEffect(() => {
    return () => {
      if (rateModalTimeoutRef.current) {
        clearTimeout(rateModalTimeoutRef.current)
        rateModalTimeoutRef.current = null
      }
      if (inviteCopyTimeoutRef.current) {
        clearTimeout(inviteCopyTimeoutRef.current)
        inviteCopyTimeoutRef.current = null
      }
    }
  }, [])
  /** GAMES_500 #40：預載下一可能路由（/learn、/pricing）可選 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const t = setTimeout(() => {
      router.prefetch('/learn')
      router.prefetch('/pricing')
    }, 2000)
    return () => clearTimeout(t)
  }, [router])
  const {
    roomId,
    players: roomPlayers,
    inviteUrl: roomInviteUrl,
    loading: roomLoading,
    error: roomError,
    join: joinRoom,
    createRoom,
    fetchRoom,
  } = useGameRoom(roomSlug)
  /** GAMES_500 #175：房間 reconnection 與離線提示 — 需 backend/Service Worker 支援後於此或 useGameRoom 實作。GAMES_500 #209：觀戰者加入時廣播或提示可選 — 可於房間狀態訂閱時顯示 toast。 */

  const [activeGame, setActiveGame] = useState<GameId>(null)
  /** GAMES_500 #37：離開遊戲返回 Lobby 還原捲動位置 */
  const savedScrollYRef = useRef(0)
  /** P1-169：FAB 滾動至建立房間區塊 */
  const createRoomSectionRef = useRef<HTMLDivElement>(null)
  const [fabOpen, setFabOpen] = useState(false)
  /** GAMES_500 #37：返回 Lobby 時還原捲動位置 */
  useEffect(() => {
    if (!activeGame && typeof window !== 'undefined') {
      window.scrollTo({ top: savedScrollYRef.current, behavior: 'instant' })
    }
  }, [activeGame])
  const navVisibility = useNavVisibility()
  /** P1-169：隨機選遊戲（與 Lobby 隨機按鈕邏輯一致） */
  const handleRandomGame = useCallback(() => {
    if (gamesWithCategory.length === 0) return
    const id = gamesWithCategory[Math.floor(Math.random() * gamesWithCategory.length)].id
    if (!roomSlug && GUEST_TRIAL_GAME_IDS.includes(id) && getGuestTrialCount() >= GUEST_TRIAL_LIMIT) {
      setShowGuestTrialLimitModal(true)
      return
    }
    savedScrollYRef.current = typeof window !== 'undefined' ? window.scrollY : 0
    setActiveGame(id)
    saveLastSession(id)
    incrementWeeklyPlay(id)
    setWeeklyPlayCounts(getWeeklyPlayCounts())
    setShowRestoreBanner(false)
    try {
      const raw = localStorage.getItem(RECENT_GAMES_KEY)
      const arr = raw ? (JSON.parse(raw) as string[]) : []
      const next = [id, ...arr.filter((x) => x !== id)].slice(0, RECENT_GAMES_MAX)
      localStorage.setItem(RECENT_GAMES_KEY, JSON.stringify(next))
      setRecentGameIds(next)
    } catch { /* ignore */ }
    setFabOpen(false)
  // gamesWithCategory 來自 config 常數，穩定；roomSlug 影響試玩限制邏輯
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: gamesWithCategory is module-level
  }, [roomSlug])
  const [localPlayers, setLocalPlayers] = useState<string[]>([])
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [roomJoinName, setRoomJoinName] = useState('')
  const [roomJoinPassword, setRoomJoinPassword] = useState('')
  const [roomJoinError, setRoomJoinError] = useState<string | null>(null)
  /** P1-125：房間密碼可見性切換 */
  const [showJoinPassword, setShowJoinPassword] = useState(false)
  const [showCreatePassword, setShowCreatePassword] = useState(false)
  /** 任務 12：建立房間可選 4 位數密碼 */
  const [roomCreatePassword, setRoomCreatePassword] = useState('')
  const [createInvite, setCreateInvite] = useState<{ slug: string; inviteUrl: string } | null>(null)
  /** AUDIT #7：複製邀請連結後按鈕顯示「已複製」回饋；GAMES_500 #138 時長可配置 */
  const [inviteCopyJustDone, setInviteCopyJustDone] = useState(false)
  /** GAMES_500 #158：房間建立後邀請區塊可摺疊 */
  const [inviteBlockCollapsed, setInviteBlockCollapsed] = useState(false)
  /** GAMES_500 #159：邀請連結 QR code 可選（行動端顯示，桌面可收合） */
  const [showQR, setShowQR] = useState(false)
  useEffect(() => {
    const check = () => setShowQR(typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window))
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [createRoomError, setCreateRoomError] = useState<string | null>(null)
  const [joinedDisplayName, setJoinedDisplayName] = useState<string | null>(null)
  /** A1-13：是否以觀戰者身份加入（不參與遊戲） */
  const [joinedAsSpectator, setJoinedAsSpectator] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [recentGameIds, setRecentGameIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(RECENT_GAMES_KEY)
      return raw ? (JSON.parse(raw) as string[]).slice(0, RECENT_GAMES_MAX) : []
    } catch {
      return []
    }
  })
  /** 任務 7：本週熱門遊玩次數，離開遊戲時刷新 */
  const [weeklyPlayCounts, setWeeklyPlayCounts] = useState<Record<string, number>>(() => getWeeklyPlayCounts())
  /** 任務 23：存檔恢復 — 上次遊戲與是否顯示恢復橫幅 */
  const [lastSession, setLastSession] = useState<ReturnType<typeof getLastSession>>(() => (typeof window !== 'undefined' ? getLastSession() : null))
  const [showRestoreBanner, setShowRestoreBanner] = useState(true)
  /** 任務 28：首次進入遊戲頁教學 overlay；AUDIT #47 「不再顯示」勾選 */
  const [tutorialDontShowAgain, setTutorialDontShowAgain] = useState(false)
  const [showTutorial, setShowTutorial] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return !localStorage.getItem(TUTORIAL_DONE_KEY)
    } catch {
      return false
    }
  })
  /** 任務 10：離開遊戲後彈出 1–5 星評分；EXPERT_60 P2：A/B 文案 variant（0=為剛才評分、1=喜歡嗎給個星） */
  const [gameIdToRate, setGameIdToRate] = useState<string | null>(null)
  const [ratingVariant, setRatingVariant] = useState<0 | 1>(() => (typeof window !== 'undefined' && Math.random() < 0.5 ? 0 : 1))
  /** P0-009：訪客試玩達 3 次後顯示登入 modal */
  const [showGuestTrialLimitModal, setShowGuestTrialLimitModal] = useState(false)

  /** EXPERT_60 P2：評分彈窗出現時送 analytics（variant 用於 A/B） */
  useEffect(() => {
    if (!gameIdToRate) return
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'game_rating_modal_show', value: 1, id: `variant_${ratingVariant}` }),
      }).catch(() => {})
    } catch { /* noop */ }
  }, [gameIdToRate, ratingVariant])

  /** A1-13：從 localStorage 讀取加入狀態（displayName + isSpectator），相容舊版純字串 */
  useEffect(() => {
    if (!roomSlug || typeof window === 'undefined') {
      setJoinedDisplayName(null)
      setJoinedAsSpectator(false)
      return
    }
    try {
      const raw = localStorage.getItem(ROOM_JOINED_KEY)
      if (!raw || raw.trim() === '') {
        setJoinedDisplayName(null)
        setJoinedAsSpectator(false)
        return
      }
      const obj = JSON.parse(raw) as Record<string, string | { displayName: string; isSpectator?: boolean }>
      const entry = obj[roomSlug]
      if (entry == null) {
        setJoinedDisplayName(null)
        setJoinedAsSpectator(false)
        return
      }
      if (typeof entry === 'string') {
        setJoinedDisplayName(entry)
        setJoinedAsSpectator(false)
        return
      }
      setJoinedDisplayName(entry.displayName ?? null)
      setJoinedAsSpectator(entry.isSpectator === true)
    } catch {
      setJoinedDisplayName(null)
      setJoinedAsSpectator(false)
    }
  }, [roomSlug])

  /** T057 P1：URL game 參數 — 進入房間後自動開啟同款遊戲（再玩一局導向） */
  useEffect(() => {
    const gameId = searchParams.get('game')
    if (!gameId || !roomSlug || !joinedDisplayName) return
    if (getGameMeta(gameId)) setActiveGame(gameId)
  }, [searchParams, roomSlug, joinedDisplayName])

  const isInRoomMode = !!roomSlug && !!joinedDisplayName
  const players = isInRoomMode ? roomPlayers.map((p) => p.displayName) : localPlayers

  /** ANA.1：進入遊戲時追蹤 game_start（僅在開局時送一次），離開時在 onExit 送 game_end */
  useEffect(() => {
    if (!activeGame) {
      lastTrackedGameIdRef.current = null
      return
    }
    if (lastTrackedGameIdRef.current === activeGame) return
    lastTrackedGameIdRef.current = activeGame
    gameStartTimeRef.current = Date.now()
    trackGameStart(activeGame, players.length)
  }, [activeGame, players.length])

  /** GAMES_500 #44：房間已滿時加入按鈕 disabled 與提示 */
  const roomFull = !!roomSlug && !joinedDisplayName && roomPlayers.length >= maxPlayers
  /** GAMES_500 #161：房間錯誤重試間隔與防抖（1.5s 內不重複） */
  const [roomRetryCooldown, setRoomRetryCooldown] = useState(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- setPlayers: no-op in room mode, setLocalPlayers in list mode; identity intentional
  const setPlayers = isInRoomMode ? (() => {}) : setLocalPlayers

  /** GAMES_500 #137：API 錯誤碼對應友善文案（密碼錯誤／房間已滿／過期） */
  const mapRoomJoinError = useCallback((err: string) => {
    if (/password|密碼|wrong password/i.test(err)) return '密碼錯誤，請確認房間密碼'
    if (/full|滿|capacity/i.test(err)) return '房間已滿，請稍後再試'
    if (/expired|過期|not found|不存在/i.test(err)) return '房間不存在或已過期'
    if (/請輸入暱稱|name/i.test(err)) return '請輸入暱稱'
    return err
  }, [])

  /** GAMES_500 #176：建立房間錯誤友善文案 */
  const mapCreateRoomError = useCallback((err: string) => {
    if (/network|fetch|failed|timeout|連線/i.test(err)) return '連線失敗，請稍後再試'
    if (/limit|滿|capacity|人數|tier|subscription/i.test(err)) return '已達方案人數上限，升級可開更多人'
    return err
  }, [])

  const handleJoinRoom = useCallback(async () => {
    if (!roomSlug) return
    setRoomJoinError(null)
    const name = roomJoinName.trim()
    if (!name) {
      setRoomJoinError('請輸入暱稱')
      return
    }
    const result = await joinRoom(name, roomJoinPassword || undefined, false)
    if (result.ok) {
      try {
        const raw = localStorage.getItem(ROOM_JOINED_KEY)
        const obj = raw && raw.trim() ? (JSON.parse(raw) as Record<string, unknown>) : {}
        obj[roomSlug] = { displayName: name, isSpectator: false }
        localStorage.setItem(ROOM_JOINED_KEY, JSON.stringify(obj))
      } catch {
        /* ignore */
      }
      setJoinedDisplayName(name)
      setJoinedAsSpectator(false)
      setRoomJoinName('')
      requestAnimationFrame(() => mainContentRef.current?.focus({ preventScroll: false }))
    } else {
      setRoomJoinError(mapRoomJoinError(result.error ?? '加入失敗'))
    }
  }, [roomSlug, roomJoinName, roomJoinPassword, joinRoom, mapRoomJoinError])

  /** A1-13：以觀戰者身份加入房間（不參與遊戲，僅觀看）；GAMES_500 #141 觀戰者加入文案區分 */
  const handleJoinAsSpectator = useCallback(async () => {
    if (!roomSlug) return
    setRoomJoinError(null)
    const name = roomJoinName.trim()
    if (!name) {
      setRoomJoinError('請輸入暱稱')
      return
    }
    const result = await joinRoom(name, roomJoinPassword || undefined, true)
    if (result.ok) {
      try {
        const raw = localStorage.getItem(ROOM_JOINED_KEY)
        const obj = raw && raw.trim() ? (JSON.parse(raw) as Record<string, unknown>) : {}
        obj[roomSlug] = { displayName: name, isSpectator: true }
        localStorage.setItem(ROOM_JOINED_KEY, JSON.stringify(obj))
      } catch {
        /* ignore */
      }
      setJoinedDisplayName(name)
      setJoinedAsSpectator(true)
      setRoomJoinName('')
      requestAnimationFrame(() => mainContentRef.current?.focus({ preventScroll: false }))
    } else {
      setRoomJoinError(mapRoomJoinError(result.error ?? '加入失敗'))
    }
  }, [roomSlug, roomJoinName, roomJoinPassword, joinRoom, mapRoomJoinError])

  const handleCreateRoom = useCallback(async () => {
    setCreatingRoom(true)
    setCreateRoomError(null)
    const result = await createRoom(roomCreatePassword || undefined)
    setCreatingRoom(false)
    if ('error' in result) {
      setCreateRoomError(mapCreateRoomError(result.error))
      return
    }
    if (typeof document !== 'undefined') inviteSavedFocusRef.current = document.activeElement as HTMLElement | null
    setCreateInvite({ slug: result.slug, inviteUrl: result.inviteUrl })
  }, [createRoom, roomCreatePassword, mapCreateRoomError])

  /** T057 P1-144：再玩一局（新房間）— 建立新房間、自動加入、複製邀請連結、導向；無需返回大廳 */
  const handlePlayAgain = useCallback(async () => {
    const result = await createRoom(roomCreatePassword || undefined)
    if ('error' in result) return
    const newSlug = result.slug
    const inviteUrl = result.inviteUrl ?? (typeof window !== 'undefined' ? `${window.location.origin}/games?room=${newSlug}` : '')
    if (joinedDisplayName) {
      try {
        const res = await fetch(`/api/games/rooms/${encodeURIComponent(newSlug)}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: joinedDisplayName,
            password: roomCreatePassword?.trim() || undefined,
            isSpectator: joinedAsSpectator ?? false,
          }),
        })
        if (res.ok) {
          const raw = localStorage.getItem(ROOM_JOINED_KEY)
          const obj = raw && raw.trim() ? (JSON.parse(raw) as Record<string, unknown>) : {}
          obj[newSlug] = { displayName: joinedDisplayName, isSpectator: joinedAsSpectator ?? false }
          localStorage.setItem(ROOM_JOINED_KEY, JSON.stringify(obj))
        }
        if (inviteUrl && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(inviteUrl)
          toast.success('新房間已建立，邀請連結已複製')
        }
      } catch {
        /* ignore */
      }
    }
    router.replace(`/games?room=${newSlug}&game=${activeGame ?? ''}`)
  }, [createRoom, roomCreatePassword, activeGame, router, joinedDisplayName, joinedAsSpectator])

  const selectedGame = activeGame ? getGameMeta(activeGame) : undefined

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw) as string[]
        if (Array.isArray(parsed)) setPlayers(parsed.slice(0, maxPlayers))
      }
    } catch {
      /* ignore */
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- setPlayers stable, init once from localStorage
  }, [maxPlayers])

  useEffect(() => {
    if (players.length === 0) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players))
    } catch {
      /* ignore */
    }
  }, [players])

  /** GAMES_500 #156：玩家名重複時阻擋；#157 空白與 trim；#183 不允許特殊字元，僅保留安全字元 */
  const [addPlayerError, setAddPlayerError] = useState<string | null>(null)
  const sanitizePlayerName = useCallback((raw: string) => raw.replace(/[\s\u200B-\u200D\uFEFF]+/g, ' ').replace(/[<>\"'&]/g, '').trim(), [])
  const addPlayer = useCallback(() => {
    const name = sanitizePlayerName(newPlayerName)
    setAddPlayerError(null)
    if (!name) return
    if (players.includes(name)) {
      setAddPlayerError('此暱稱已存在，請換一個')
      return
    }
    if (players.length >= maxPlayers) return
    setPlayers([...players, name])
    setNewPlayerName('')
  // eslint-disable-next-line react-hooks/exhaustive-deps -- setPlayers stable from useState
  }, [newPlayerName, players, maxPlayers, setPlayers, sanitizePlayerName])

  const removePlayer = useCallback((index: number) => {
    setPlayers(players.filter((_, i) => i !== index))
  // eslint-disable-next-line react-hooks/exhaustive-deps -- setPlayers stable from useState
  }, [players, setPlayers])

  /** P1-109：玩家拖拽排序 — 僅本地模式；移動 fromIndex 至 toIndex */
  const reorderPlayers = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= players.length || toIndex >= players.length) return
    const next = [...players]
    const [removed] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, removed)
    setLocalPlayers(next)
  }, [players])

  /** 91-95 載入上次名單：從 localStorage 讀取並填入（非房間模式） */
  const loadLastSavedList = useCallback(() => {
    if (isInRoomMode) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw || !raw.trim()) return
      const parsed = JSON.parse(raw) as string[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        setLocalPlayers(parsed.slice(0, maxPlayers))
      }
    } catch {
      /* ignore */
    }
  }, [isInRoomMode, maxPlayers])

  /** GAMES_500 #171/#144：關閉 modal 時焦點還原至觸發按鈕 */
  const playerModalTriggerRef = useRef<HTMLButtonElement>(null)
  const closePlayerModal = useCallback(() => {
    setShowPlayerModal(false)
    setTimeout(() => playerModalTriggerRef.current?.focus(), 0)
  }, [])

  useEffect(() => {
    if (!showPlayerModal) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePlayerModal() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showPlayerModal, closePlayerModal])

  useEffect(() => {
    document.documentElement.dataset.gamesFontSize = getFontSize()
    document.documentElement.dataset.gamesReduceMotion = getReduceMotion() ? '1' : '0'
  }, [])

  /** 93 遊戲進行中隱藏導航，最大化解戲區域；離開遊戲時刷新最近玩過、本週熱門與任務 23 上次進度 */
  useEffect(() => {
    navVisibility?.setHideForGame(!!activeGame)
    if (!activeGame) {
      try {
        const raw = localStorage.getItem(RECENT_GAMES_KEY)
        setRecentGameIds(raw ? (JSON.parse(raw) as string[]).slice(0, RECENT_GAMES_MAX) : [])
        setWeeklyPlayCounts(getWeeklyPlayCounts())
        setLastSession(getLastSession())
      } catch {
        /* ignore */
      }
    }
    return () => { navVisibility?.setHideForGame(false) }
  }, [activeGame, navVisibility])

  /** 任務 2：根據最近玩過預載前 2 款遊戲 chunk，點擊時減少等待 */
  useEffect(() => {
    if (recentGameIds[0]) prefetchGame(recentGameIds[0])
    if (recentGameIds[1]) prefetchGame(recentGameIds[1])
  }, [recentGameIds])

  /** GAMES_500 #171：邀請 modal 關閉時焦點還原（僅在從有變無時還原）；#158 開啟時預設展開 */
  const inviteSavedFocusRef = useRef<HTMLElement | null>(null)
  const prevCreateInviteRef = useRef(createInvite)
  useEffect(() => {
    if (prevCreateInviteRef.current && !createInvite && inviteSavedFocusRef.current) {
      const el = inviteSavedFocusRef.current
      inviteSavedFocusRef.current = null
      setTimeout(() => el.focus(), 0)
    }
    if (createInvite) setInviteBlockCollapsed(false)
    prevCreateInviteRef.current = createInvite
  }, [createInvite])

  /** 287 鍵盤快捷鍵：/ 聚焦搜尋、Esc 關閉 modal；AUDIT #30 教學 overlay Esc 關閉 */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showTutorial && (!roomSlug || joinedDisplayName)) setShowTutorial(false)
        else if (createInvite) setCreateInvite(null)
        else if (showSettingsModal) setShowSettingsModal(false)
        else if (showPlayerModal) setShowPlayerModal(false)
        return
      }
      if (e.key === '/' && !activeGame && !showPlayerModal && !showSettingsModal && !createInvite) {
        const target = e.target as HTMLElement
        if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return
        e.preventDefault()
        const el = document.getElementById('games-search') as HTMLInputElement | null
        el?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeGame, showPlayerModal, showSettingsModal, createInvite, showTutorial, roomSlug, joinedDisplayName])

  const handleRefresh = useCallback(async () => {
    window.location.reload()
  }, [])

  if (!ageVerified) {
    return <AgeGate onConfirm={() => setAgeVerified(true)} />
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} disabled={!!activeGame}>
      <div ref={mainContentRef} tabIndex={-1} className="games-content min-h-screen pt-0 pb-16 px-4 safe-area-px overflow-hidden relative" role="main" aria-label="派對遊樂場" onPointerDown={handlePreload}>
        {/* Dynamic Background；P1-120：大廳背景氛圍 — 緩慢漸變光暈 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-500/5 rounded-full blur-[150px]" />
          <motion.div
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
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: LOBBY_GAME_TRANSITION_MS / 1000 }}
            >
              {/* 任務 28：首次教學 overlay；AUDIT #47 可加「跳過」與「不再顯示」勾選 */}
              {showTutorial && (!roomSlug || joinedDisplayName) && (
                <div className="mb-6 p-5 rounded-2xl bg-primary-500/20 border border-primary-500/40 text-left" role="region" aria-label="使用教學">
                  <p className="text-white font-medium mb-2">歡迎來到派對遊樂場！</p>
                  <ul className="text-white/80 text-sm space-y-1 mb-4 list-disc list-inside">
                    <li>點選下方遊戲卡片即可開始</li>
                    <li>右上角「設定」可調音量與字級</li>
                    <li>「管理玩家」可新增名單，供轉盤等遊戲使用</li>
                  </ul>
                  <label className="flex items-center gap-2 text-white/70 text-sm mb-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tutorialDontShowAgain}
                      onChange={(e) => setTutorialDontShowAgain(e.target.checked)}
                      className="rounded border-white/30 text-primary-500 focus:ring-primary-400"
                      aria-label="不再顯示此教學"
                    />
                    不再顯示此教學
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (tutorialDontShowAgain) {
                          try { localStorage.setItem(TUTORIAL_DONE_KEY, '1') } catch { /* ignore */ }
                        }
                        setShowTutorial(false)
                      }}
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium"
                    >
                      知道了
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTutorial(false)}
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-medium"
                      aria-label="跳過教學"
                    >
                      跳過
                    </button>
                  </div>
                </div>
              )}

              {/* Header */}
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

                {/* P1-116：房間人數顯示 — 在房間內頂部顯示目前人數/上限 */}
                {roomSlug && joinedDisplayName && (
                  <p className="mb-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-2 text-white/80 text-sm" role="status" aria-label={`房間人數 ${roomPlayers.length} ／${maxPlayers} 人`}>
                    <Users className="w-4 h-4 text-primary-400" aria-hidden />
                    <span>目前 {roomPlayers.length}/{maxPlayers} 人</span>
                  </p>
                )}

                {/* Room: loading / error / join form；GAMES_500 #166 房間 loading skeleton */}
                {roomSlug && roomLoading && (
                  <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10 max-w-md mx-auto animate-pulse" role="status" aria-label="載入房間中">
                    <div className="h-5 bg-white/10 rounded w-1/3 mb-3" />
                    <div className="h-4 bg-white/10 rounded w-full mb-2" />
                    <div className="h-12 bg-white/10 rounded w-full" />
                  </div>
                )}
                {/* GAMES_500 #23 #29：房間不存在／slug 無效時友善錯誤頁 + 回首頁 CTA */}
                {roomSlug && !roomLoading && roomError && (
                  <div className="mb-4 p-4 rounded-xl bg-red-500/10 border-2 border-red-500/50 text-red-300 text-sm" role="alert" aria-live="assertive">
                    <p>{roomError}</p>
                    <p className="text-white/60 text-xs mt-1">請確認連結是否正確，或返回遊樂場使用本機名單。</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
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
                        className="min-h-[48px] min-w-[44px] px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                        aria-label="重試載入房間（約 1.5 秒後）"
                      >
                        {roomRetryCooldown ? '重試中…' : '重試'}
                      </button>
                      <button
                        type="button"
                        onClick={() => router.replace('/games')}
                        className="min-h-[48px] min-w-[44px] px-4 py-2 rounded-xl bg-white/10 text-white"
                        aria-label="回首頁或使用本機名單"
                      >
                        回首頁
                      </button>
                    </div>
                  </div>
                )}
                {/* AUDIT #6：加入房間表單與建立房間區塊視覺層級分明 */}
                {roomSlug && !roomLoading && !roomError && !joinedDisplayName && (
                  <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10 max-w-md mx-auto" role="region" aria-label="加入房間">
                    <h3 className="text-base font-semibold text-white mb-1">加入房間</h3>
                    {roomFull ? (
                      <p id="room-full-msg" className="text-amber-400 text-sm mb-2" role="status">房間已滿（{roomPlayers.length}/{maxPlayers} 人），無法加入</p>
                    ) : (
                      <p className="text-white/60 text-sm mb-2">輸入暱稱後加入</p>
                    )}
                    {/* T070 P2：遊戲可匿名或暱稱，規則清楚 */}
                    <p className="text-white/50 text-xs mb-2">可不填真實姓名，暱稱即可。</p>
                    <form
                      onSubmit={(e) => { e.preventDefault(); handleJoinRoom(); }}
                      className="flex flex-col gap-2"
                      aria-label="加入房間表單"
                    >
                      <div className="flex gap-2">
                        <label htmlFor="room-join-name" className="sr-only">加入房間暱稱（必填，最多 20 字）</label>
                        <input
                          id="room-join-name"
                          type="text"
                          value={roomJoinName}
                          onChange={(e) => { setRoomJoinName(e.target.value.slice(0, 20)); setRoomJoinError(null); }}
                          placeholder="你的暱稱"
                          maxLength={20}
                          required
                          aria-required="true"
                          aria-label="加入房間暱稱（最多 20 字）"
                          className="flex-1 min-h-[48px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/30"
                        />
                        <button
                          type="button"
                          onClick={() => setRoomJoinName(RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)] as string)}
                          className="min-h-[48px] px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium shrink-0"
                          title="隨機暱稱"
                        >
                          隨機
                        </button>
                        <button
                          type="submit"
                          disabled={!roomJoinName.trim() || roomFull}
                          className="min-h-[48px] min-w-[48px] px-6 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold"
                          aria-describedby={roomFull ? 'room-full-msg' : undefined}
                        >
                          加入
                        </button>
                        <button
                          type="button"
                          onClick={handleJoinAsSpectator}
                          disabled={!roomJoinName.trim() || roomFull}
                          className="min-h-[48px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white text-sm font-medium"
                          title="以觀戰者身份加入，僅觀看不參與"
                          aria-label="以觀戰者身份加入（僅觀看，不參與遊戲）"
                          aria-describedby={roomFull ? 'room-full-msg' : undefined}
                        >
                          觀戰
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type={showJoinPassword ? 'text' : 'password'}
                          inputMode="numeric"
                          autoComplete="off"
                          value={roomJoinPassword}
                          onChange={(e) => { setRoomJoinPassword(e.target.value.replace(/\D/g, '').slice(0, 4)); setRoomJoinError(null); }}
                          placeholder="房間密碼（若房主有設定）"
                          maxLength={4}
                          aria-label="房間密碼（若房主有設定）"
                          className="min-h-[44px] w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-2 text-white placeholder-white/30 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowJoinPassword((s) => !s)}
                          className="absolute right-2 flex items-center justify-center w-9 h-9 rounded-lg text-white/50 hover:text-white hover:bg-white/10 games-touch-target"
                          aria-label={showJoinPassword ? '隱藏密碼' : '顯示密碼'}
                        >
                          {showJoinPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </form>
                    {roomJoinError && <p className="text-red-400 text-sm mt-2">{roomJoinError}</p>}
                  </div>
                )}

                {/* AUDIT #6：建立房間 CTA 與加入房間表單視覺層級分明 — 建立房間區塊標題與邊框 */}
                <div className="flex flex-wrap gap-3 justify-center items-start" ref={createRoomSectionRef}>
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white min-h-[48px] min-w-[48px]"
                    aria-label="設定"
                  >
                    <Settings className="w-5 h-5" />
                    <span>設定</span>
                  </button>
                  <button
                    ref={playerModalTriggerRef}
                    onClick={() => setShowPlayerModal(true)}
                    className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white min-h-[48px] min-w-[48px]"
                    aria-label="管理玩家名單"
                  >
                    <Users className="w-5 h-5" />
                    <span>管理玩家 ({players.length})</span>
                    <UserPlus className="w-4 h-4 text-primary-400" />
                  </button>
                  <div className="flex flex-col gap-2 items-center p-4 rounded-xl border border-primary-500/20 bg-primary-500/5 min-w-[200px]" role="group" aria-label="建立房間">
                    {/* P1-110：創建房間三步引導 — 設置密碼 → 邀請好友 → 選擇遊戲；依狀態高亮當前步驟 */}
                    {(() => {
                      const step = !isInRoomMode ? 1 : (activeGame ? 3 : 2)
                      return (
                        <div className="flex items-center gap-1 mb-2 text-xs" role="list" aria-label="建立房間流程">
                          <span className={`flex items-center gap-1 ${step >= 1 ? 'text-primary-400' : 'text-white/40'}`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'}`}>1</span>
                            <span>設密碼</span>
                          </span>
                          <span className="w-3 h-px bg-white/20" aria-hidden />
                          <span className={`flex items-center gap-1 ${step >= 2 ? 'text-primary-400' : 'text-white/40'}`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'}`}>2</span>
                            <span>邀請好友</span>
                          </span>
                          <span className="w-3 h-px bg-white/20" aria-hidden />
                          <span className={`flex items-center gap-1 ${step >= 3 ? 'text-primary-400' : 'text-white/40'}`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 3 ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'}`}>3</span>
                            <span>選擇遊戲</span>
                          </span>
                        </div>
                      )
                    })()}
                    <span className="text-sm font-semibold text-primary-300">建立房間</span>
                    <div className="relative flex items-center w-full max-w-[200px]">
                      <input
                        type={showCreatePassword ? 'text' : 'password'}
                        inputMode="numeric"
                        autoComplete="off"
                        value={roomCreatePassword}
                        onChange={(e) => setRoomCreatePassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="4 位數密碼（選填）"
                        maxLength={4}
                        aria-label="建立房間密碼（選填）"
                        className="w-full min-h-[44px] bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-2 text-white placeholder-white/30 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePassword((s) => !s)}
                        className="absolute right-2 flex items-center justify-center w-9 h-9 rounded-lg text-white/50 hover:text-white hover:bg-white/10 games-touch-target"
                        aria-label={showCreatePassword ? '隱藏密碼' : '顯示密碼'}
                      >
                        {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {roomCreatePassword.length === 4 && (
                      <p className="text-white/50 text-xs" role="status" aria-label="密碼強度">
                        {/^(\d)\1{3}$/.test(roomCreatePassword) ? '強度：弱（建議避免同一數字）' : /^(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)$/.test(roomCreatePassword) ? '強度：中（連續數字）' : '強度：佳'}
                      </p>
                    )}
                    <button
                      onClick={handleCreateRoom}
                      disabled={creatingRoom}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-500 hover:bg-primary-600 border border-primary-500/50 text-white font-semibold min-h-[48px] min-w-[48px] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a]"
                    >
                      {creatingRoom ? '建立中…' : '建立房間'}
                    </button>
                    {createRoomError && (
                      <div className="mt-2 space-y-1">
                        <p className="text-red-400 text-sm" role="alert">{createRoomError}</p>
                        <Link href="/pricing" className="text-primary-400 hover:text-primary-300 text-xs font-medium underline underline-offset-1">
                          升級方案可開更多人
                        </Link>
                      </div>
                    )}
                    {!isInRoomMode && players.length >= maxPlayers && maxPlayers < 12 && (
                      <p className="text-amber-400/90 text-xs mt-1">目前名單已滿（{maxPlayers} 人），升級可開更多人</p>
                    )}
                  </div>
                  {isInRoomMode && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('確定要離開房間嗎？名單將不再同步。')) {
                          try {
                            const raw = localStorage.getItem(ROOM_JOINED_KEY)
                            const obj = raw && raw.trim() ? (JSON.parse(raw) as Record<string, unknown>) : {}
                            delete obj[roomSlug!]
                            localStorage.setItem(ROOM_JOINED_KEY, JSON.stringify(obj))
                          } catch { /* ignore */ }
                          /** GAMES_500 #223：觀戰者離開房間後狀態清除（localStorage + 導向 /games） */
                          router.replace('/games')
                        }
                      }}
                      className="min-h-[44px] px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm"
                      aria-label="離開房間（會清除本機加入狀態）"
                    >
                      離開房間
                    </button>
                  )}
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

              {/* E90 P2：新遊戲上線預告橫幅 — announcements.config 有 type=game 時顯示 */}
              {(!roomSlug || joinedDisplayName) && getActiveLaunchAnnouncements().filter((a) => a.type === 'game').map((a) => {
                const id = a.id
                const meta = typeof id === 'string' ? getGameMeta(id) : null
                return meta ? (
                  <div key={a.id} className="mb-4 p-4 rounded-2xl bg-accent-500/10 border border-accent-500/20" role="region" aria-label="新作上線">
                    <p className="text-accent-300 text-sm font-medium">{a.label}：{meta.name}</p>
                    <p className="text-white/60 text-xs mt-1">快去試玩</p>
                  </div>
                ) : null
              })}

              {/* 任務 23：存檔恢復橫幅 — 意外關閉後可恢復上次遊戲 */}
              {(!roomSlug || joinedDisplayName) && lastSession && showRestoreBanner && getGameMeta(lastSession.gameId) && (
                <div className="mb-4 p-4 rounded-2xl bg-primary-500/15 border border-primary-500/30 flex flex-wrap items-center justify-between gap-3" role="region" aria-label="恢復上次遊戲">
                  <p className="text-white/90 text-sm">
                    是否恢復上次的遊戲？<span className="font-medium text-primary-300">{getGameMeta(lastSession.gameId)?.name}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { clearLastSession(); setLastSession(null); setShowRestoreBanner(false); }}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium"
                    >
                      不用
                    </button>
                    <button
                      type="button"
                      onClick={() => { savedScrollYRef.current = typeof window !== 'undefined' ? window.scrollY : 0; setActiveGame(lastSession.gameId); setShowRestoreBanner(false); }}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium"
                    >
                      恢復
                    </button>
                  </div>
                </div>
              )}

              {/* Game Grid — hide when room slug but not joined yet；P0-018 懶加載 Lobby */}
              {(!roomSlug || joinedDisplayName) && (
                <Suspense fallback={<div className="min-h-[200px] flex items-center justify-center text-white/50 text-sm" aria-busy="true">載入遊戲列表中…</div>}>
                  <Lobby
                    games={gamesWithCategory}
                    recentGameIds={recentGameIds}
                    weeklyPlayCounts={weeklyPlayCounts}
                    displayFilter={lobbyDisplayFilter}
                    onDisplayFilterChange={handleLobbyTabChange}
                    onSelect={(id) => {
                      /** P0-009：訪客試玩 3 次後強制登入 */
                      if (!roomSlug && GUEST_TRIAL_GAME_IDS.includes(id) && getGuestTrialCount() >= GUEST_TRIAL_LIMIT) {
                        setShowGuestTrialLimitModal(true)
                        return
                      }
                      savedScrollYRef.current = typeof window !== 'undefined' ? window.scrollY : 0
                      setActiveGame(id)
                      saveLastSession(id)
                      incrementWeeklyPlay(id)
                      setWeeklyPlayCounts(getWeeklyPlayCounts())
                      setShowRestoreBanner(false)
                      try {
                        const raw = localStorage.getItem(RECENT_GAMES_KEY)
                        const arr = raw ? (JSON.parse(raw) as string[]) : []
                        const next = [id, ...arr.filter((x) => x !== id)].slice(0, RECENT_GAMES_MAX)
                        localStorage.setItem(RECENT_GAMES_KEY, JSON.stringify(next))
                        setRecentGameIds(next)
                      } catch {
                        /* ignore */
                      }
                    }}
                  />
                </Suspense>
              )}
            </motion.div>
          ) : activeGame && selectedGame ? (
            <GameErrorBoundary key={activeGame} gameName={selectedGame.name} onReset={() => setActiveGame(null)}>
              <GameWrapper
                title={selectedGame.name}
                description={selectedGame.description}
                onExit={() => {
                  const exitedGame = activeGame
                  const durationMs = gameStartTimeRef.current > 0 ? Date.now() - gameStartTimeRef.current : 0
                  trackGameEnd(exitedGame ?? '', durationMs, 0)
                  gameStartTimeRef.current = 0
                  setActiveGame(null)
                  /** AUDIT #20：離開遊戲後評分彈窗延遲 500ms，避免與關閉動畫重疊 */
                  if (rateModalTimeoutRef.current) clearTimeout(rateModalTimeoutRef.current)
                  rateModalTimeoutRef.current = setTimeout(() => {
                    rateModalTimeoutRef.current = null
                    setGameIdToRate(exitedGame ?? null)
                  }, 500)
                  /** P0-009 / T055：試玩結束後計數並引導登入；達 3 次後下次點試玩會彈登入 modal */
                  if (!roomSlug && exitedGame && GUEST_TRIAL_GAME_IDS.includes(exitedGame)) {
                    incrementGuestTrialCount()
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
          <div className="fixed bottom-20 right-4 z-30 md:hidden flex flex-col items-end gap-2">
            <AnimatePresence>
              {fabOpen && (
                <>
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    type="button"
                    onClick={() => { createRoomSectionRef.current?.scrollIntoView({ behavior: 'smooth' }); setFabOpen(false) }}
                    className="min-h-[48px] px-4 py-2 rounded-full bg-primary-500/90 hover:bg-primary-500 text-white text-sm font-medium shadow-lg flex items-center gap-2"
                    aria-label="捲動至建立房間"
                  >
                    <Users className="w-4 h-4" /> 創建房間
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    type="button"
                    onClick={handleRandomGame}
                    disabled={gamesWithCategory.length === 0}
                    className="min-h-[48px] px-4 py-2 rounded-full bg-white/90 hover:bg-white text-[#0a0a1a] text-sm font-medium shadow-lg flex items-center gap-2 disabled:opacity-50"
                    aria-label="隨機選一個遊戲"
                  >
                    <Shuffle className="w-4 h-4" /> 隨機來一個
                  </motion.button>
                </>
              )}
            </AnimatePresence>
            <motion.button
              type="button"
              onClick={() => setFabOpen((o) => !o)}
              className="min-h-[56px] min-w-[56px] rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg flex items-center justify-center games-focus-ring"
              aria-label={fabOpen ? '關閉快捷選單' : '開啟快捷選單'}
              aria-expanded={fabOpen}
            >
              <Plus className={`w-6 h-6 transition-transform ${fabOpen ? 'rotate-45' : ''}`} />
            </motion.button>
          </div>
        )}

        {/* Settings Modal：獨立 AnimatePresence，不與 mode="wait" 混用 */}
        <AnimatePresence>
          {showSettingsModal && (
            <SettingsModal key="settings-modal" onClose={() => setShowSettingsModal(false)} />
          )}
        </AnimatePresence>

        {/* P0-009：訪客試玩 3 次後強制登入 modal */}
        <AnimatePresence>
          {showGuestTrialLimitModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowGuestTrialLimitModal(false)}
            >
              <motion.div
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Player Management Modal */}
      <AnimatePresence>
        {showPlayerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closePlayerModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a1a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="player-modal-title"
              aria-label="管理玩家名單"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 id="player-modal-title" className="text-2xl font-bold text-white flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary-400" />
                  玩家列表
                </h2>
                <ModalCloseButton onClick={closePlayerModal} aria-label="關閉" className="rounded-full text-white/70" />
              </div>

              {!isInRoomMode && (
                <>
                  <form onSubmit={(e) => { e.preventDefault(); addPlayer(); }} className="flex gap-2 mb-2">
                    <label htmlFor="new-player-name" className="sr-only">輸入玩家暱稱（最多 20 字）</label>
                    <input
                      id="new-player-name"
                      type="text"
                      value={newPlayerName}
                      onChange={(e) => { setNewPlayerName(e.target.value); setAddPlayerError(null); }}
                      placeholder="輸入玩家暱稱..."
                      maxLength={20}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-primary-500 transition-colors"
                      aria-invalid={!!addPlayerError}
                      aria-describedby={addPlayerError ? 'add-player-error' : undefined}
                    />
                    <button type="submit" disabled={players.length >= maxPlayers} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-colors" title={players.length >= maxPlayers ? `已達人數上限（${maxPlayers} 人），升級可開更多人` : '新增玩家'}>
                      新增
                    </button>
                  </form>
                  {addPlayerError && <p id="add-player-error" className="text-red-400 text-sm mb-2" role="alert">{addPlayerError}</p>}
                  {players.length >= maxPlayers && <p className="text-amber-400/90 text-xs mb-2">已達人數上限（{maxPlayers} 人）</p>}
                  <p className="mb-4">
                    <button
                      type="button"
                      onClick={() => setNewPlayerName(RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)] ?? '')}
                      className="text-xs text-primary-400 hover:text-primary-300 hover:underline"
                      aria-label="隨機產生暱稱"
                    >
                      隨機暱稱
                    </button>
                  </p>
                  <p className="text-white/40 text-xs mb-4">
                    最多 {maxPlayers} 人（依方案：Free 4 / Basic 8 / Pro 12），用於命運轉盤等遊戲
                    {players.length >= maxPlayers && maxPlayers < 12 && (
                      <Link href="/pricing" className="ml-2 text-primary-400 hover:underline">升級可開更多人數</Link>
                    )}
                  </p>
                </>
              )}
              {isInRoomMode && (
                <p className="text-white/40 text-xs mb-4">房間名單（會自動同步）</p>
              )}

              {/* GAMES_500 #172：玩家列表空狀態「新增玩家」CTA 明顯 */}
              {!isInRoomMode && players.length === 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-white/60 text-sm">在下方輸入暱稱後按「新增」加入名單</p>
                  <button
                    type="button"
                    onClick={loadLastSavedList}
                    className="w-full min-h-[48px] px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white/70 hover:text-white hover:bg-white/15 flex items-center justify-center gap-2 text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    載入上次名單
                  </button>
                </div>
              )}
              {/* Player List；P1-117：房主標識（皇冠） */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {players.length === 0 ? (
                  <p className="text-white/30 text-center py-8">尚未新增任何玩家</p>
                ) : (
                  isInRoomMode
                    ? roomPlayers.map((p, i) => (
                        <div key={p.id ?? i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 gap-2">
                          <span className="flex items-center gap-2 text-white font-medium truncate min-w-0">
                            {p.isHost && <Crown className="w-4 h-4 shrink-0 text-secondary-400" aria-label="房主" />}
                            {/* P1-124：玩家辨識色 — 圓點頭像 */}
                            {p.playerColor && (
                              <span
                                className="w-3 h-3 shrink-0 rounded-full"
                                style={{ backgroundColor: p.playerColor }}
                                aria-hidden
                              />
                            )}
                            <span title={p.displayName} style={p.playerColor ? { color: p.playerColor } : undefined}>{p.displayName}</span>
                          </span>
                        </div>
                      ))
                    : players.map((player, i) => (
                        <div
                          key={i}
                          draggable
                          onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(i)); e.dataTransfer.effectAllowed = 'move' }}
                          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                          onDrop={(e) => {
                            e.preventDefault()
                            const from = parseInt(e.dataTransfer.getData('text/plain'), 10)
                            if (!Number.isNaN(from) && from !== i) reorderPlayers(from, i)
                          }}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 gap-2 cursor-grab active:cursor-grabbing hover:bg-white/[0.07] transition-colors group"
                          role="listitem"
                          aria-label={`玩家 ${player}，可拖拽排序`}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <GripVertical className="w-4 h-4 shrink-0 text-white/40 group-hover:text-white/60" aria-hidden />
                            <span className="text-white font-medium truncate" title={player}>{player}</span>
                          </span>
                          <button
                            onClick={() => removePlayer(i)}
                            className="p-1 hover:bg-red-500/20 rounded text-red-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label={`移除 ${player}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 任務 10：離開遊戲後彈出 1–5 星評分 */}
      <AnimatePresence>
        {gameIdToRate && getGameMeta(gameIdToRate) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setGameIdToRate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a1a] border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-2">
                {ratingVariant === 0 ? '為剛才的遊戲評分' : '喜歡剛才的遊戲嗎？給個星'}
              </h3>
              <p className="text-white/60 text-sm mb-4">{getGameMeta(gameIdToRate)?.name}</p>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => {
                      setGameRating(gameIdToRate, stars)
                      try {
                        fetch('/api/analytics', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name: 'game_rating_submit', value: stars, id: gameIdToRate ?? `variant_${ratingVariant}` }),
                        }).catch(() => {})
                      } catch { /* noop */ }
                      setGameIdToRate(null)
                    }}
                    className="p-2 rounded-full hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                    aria-label={`給 ${stars} 星`}
                  >
                    <Star className="w-8 h-8 text-secondary-400 hover:text-secondary-300 fill-secondary-500/50 hover:fill-secondary-400" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  try {
                    fetch('/api/analytics', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: 'game_rating_skip', value: 1, id: `variant_${ratingVariant}` }),
                    }).catch(() => {})
                  } catch { /* noop */ }
                  setGameIdToRate(null)
                }}
                className="w-full min-h-[44px] rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium"
              >
                略過
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Link + QR Modal (after create room) */}
      <AnimatePresence>
        {createInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setCreateInvite(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/10 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #6B0F1A 0%, #8B1530 50%, #C9A961 100%)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">邀請玩家</h2>
                <ModalCloseButton onClick={() => { setCreateInvite(null); setInviteCopyJustDone(false); setInviteBlockCollapsed(false); }} aria-label="關閉" className="rounded-full text-white/80" />
              </div>
              <p className="text-white/90 text-sm mb-1 text-center">建立成功！進入房間後即可開始選遊戲。</p>
              <p className="text-white/90 text-2xl md:text-3xl font-bold font-mono tracking-widest mb-2 text-center">
                {createInvite.slug}
              </p>
              {inviteBlockCollapsed ? (
                <>
                  <p className="text-white/70 text-sm mb-4 text-center">房間碼 · 點下方展開可複製連結或 QR</p>
                  <button
                    type="button"
                    onClick={() => setInviteBlockCollapsed(false)}
                    className="w-full min-h-[48px] mb-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                    aria-expanded="false"
                    aria-label="展開邀請連結與 QR 碼"
                  >
                    展開邀請連結
                  </button>
                </>
              ) : (
                <>
                  <p className="text-white/70 text-sm mb-2 text-center">房間碼 · 分享連結或掃描 QR 加入</p>
                  <button
                    type="button"
                    onClick={() => setInviteBlockCollapsed(true)}
                    className="mb-3 text-white/50 text-xs hover:text-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded px-2 py-1"
                    aria-expanded="true"
                    aria-label="收合邀請區塊"
                  >
                    收合
                  </button>
                  {/* GAMES_500 #181：複製與分享並存時不擁擠 — flex-wrap + gap */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
                    <input
                      readOnly
                      value={createInvite.inviteUrl}
                      aria-label="邀請連結"
                      className="flex-1 min-w-0 min-h-[44px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                    />
                    <div className="flex gap-2 w-full sm:w-auto sm:shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(createInvite.inviteUrl)
                          toast.success('連結已複製')
                          setInviteCopyJustDone(true)
                          if (inviteCopyTimeoutRef.current) clearTimeout(inviteCopyTimeoutRef.current)
                          inviteCopyTimeoutRef.current = setTimeout(() => {
                            inviteCopyTimeoutRef.current = null
                            setInviteCopyJustDone(false)
                          }, INVITE_COPY_FEEDBACK_MS)
                        } catch {
                          toast.error('複製失敗，請手動選取連結複製')
                        }
                      }}
                      aria-label={inviteCopyJustDone ? '已複製邀請連結' : '複製邀請連結'}
                      className="min-h-[48px] min-w-[120px] px-5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a] transition-colors"
                    >
                      {inviteCopyJustDone ? '已複製' : '複製連結'}
                    </button>
                    </div>
                  </div>
                  {showQR && (
                    <div className="flex justify-center mb-4">
                      <Image
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(createInvite.inviteUrl)}`}
                        alt="邀請 QR 碼"
                        width={200}
                        height={200}
                        className="rounded-xl border border-white/10"
                      />
                    </div>
                  )}
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  router.replace(`/games?room=${createInvite.slug}`)
                  setCreateInvite(null)
                  setInviteBlockCollapsed(false)
                }}
                className="w-full min-h-[48px] rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a]"
              >
                進入房間
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </PullToRefresh>
  )
}

export default function GamesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/50">載入中…</div>}>
      <GamesPageContent />
    </Suspense>
  )
}
