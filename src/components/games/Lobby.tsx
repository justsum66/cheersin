'use client'

import { useState, useRef, useCallback, useMemo, useDeferredValue, useTransition, useEffect, type ReactNode } from 'react'
import { m, LayoutGroup, useReducedMotion } from 'framer-motion'
import { Search, Users, Swords, Shuffle, LayoutGrid, Flame, Heart, ChevronDown, ChevronUp, Clock, type LucideIcon } from 'lucide-react'
import { FeatureIcon } from '@/components/ui/FeatureIcon'
import { Modal } from '@/components/ui/Modal'
import { GameCard } from './GameCard'
import { prefetchGame } from './GameLazyMap'
import { getFavoriteGameIds, toggleFavorite, getGameRatings, setGameRating } from '@/lib/games-favorites'
import {
  GAMES_RTL,
  GAMES_LOBBY_WEEKLY_PLAYS_I18N_KEY,
  LOBBY_BLOCK_ORDER,
  GAMES_LOBBY_SEARCH_PLACEHOLDER_I18N_KEY,
  GAMES_LOBBY_RECENT_I18N_KEY,
  GAMES_LOBBY_WEEKLY_I18N_KEY,
  GAMES_LOBBY_RECOMMENDED_I18N_KEY,
  GAMES_LOBBY_CATEGORY_ALL_I18N_KEY,
  GAMES_LOBBY_CATEGORY_CLASSIC_I18N_KEY,
  GAMES_LOBBY_CATEGORY_VS_I18N_KEY,
  GAMES_LOBBY_CATEGORY_RANDOM_I18N_KEY,
  GAMES_LOBBY_CATEGORY_TWO_I18N_KEY,
} from '@/lib/games-ui-constants'
import { useTranslation } from '@/contexts/I18nContext'
import { NowPlayingCount } from './NowPlayingCount'
import RandomBrewery from './RandomBrewery'
import type { GameDifficulty, GameCategory } from '@/config/games.config'
import { getGameMeta, GUEST_TRIAL_GAME_IDS } from '@/config/games.config'
import { createPlaylistId, type GamePlaylist } from '@/lib/games-playlists'
import type { GameId } from '@/config/games.config'
import { List, Play, Trash2, Plus } from 'lucide-react'

export type { GameCategory }

/** GAMES_500 #68：卡片進入視窗時 prefetch，rootMargin 可配置 */
function PrefetchOnVisible({ gameId, rootMargin = '100px', children }: { gameId: string; rootMargin?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) prefetchGame(gameId)
      },
      { rootMargin, threshold: 0.01 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [gameId, rootMargin])
  return <div ref={ref}>{children}</div>
}

interface GameOption {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  players: string
  category?: GameCategory
  popular?: boolean
  difficulty?: GameDifficulty
  estimatedMinutes?: number
  /** 任務 5：搜尋用拼音/關鍵字 */
  searchKeys?: string
  /** T072 P2：兩人遊戲入口 */
  twoPlayerFriendly?: boolean
  /** GAMES_500 #127：卡片 hover 規則摘要 */
  rulesSummary?: string
  /** P1-195：付費遊戲角標 */
  isPremium?: boolean
  /** Phase 1 Task 11: 遊戲模式 */
  modes?: { id: string; label: string; isPremium?: boolean }[]
  /** Task 26: 標記已廢棄遊戲 */
  deprecated?: boolean
}

/** GAMES_500 #61：猜你喜歡區塊「依你的遊玩與評分」可摺疊說明 */
function RecommendedDescriptionToggle() {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="text-white/40 text-xs inline-flex items-center gap-1 hover:text-white/60 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a] rounded games-touch-target"
        aria-expanded={expanded}
        aria-label={expanded ? '收合說明' : '展開說明：依你的遊玩與評分'}
      >
        {expanded ? <ChevronUp className="w-4 h-4" aria-hidden /> : <ChevronDown className="w-4 h-4" aria-hidden />}
      </button>
      {expanded && (
        <p className="text-white/30 text-xs w-full mt-1" aria-hidden>依你的遊玩與評分 · 初次來可試試這些</p>
      )}
    </>
  )
}

const CATEGORY_LABELS: Record<GameCategory, string> = {
  party: '派對',
  reaction: '反應',
  guess: '猜數字',
  draw: '抽籤',
  other: '其他',
  facetoface: '同桌對視',
  adult: '18+辣味',
}

/** 76 遊戲分類標籤：P0-003 情侶模式 / 經典派對 / 競技對決 / 隨機選人 / T072 2 人（兩人友善） */
/** Grace 色盲友善：分類加 icon，不單靠顏色區分 */
export type DisplayCategory = 'couple' | 'all' | 'classic' | 'vs' | 'random' | 'two'
/** GAMES_500 #51：穩定引用供鍵盤與 map 使用；P0-003 情侶模式置頂 */
const CATEGORY_LIST: readonly DisplayCategory[] = ['couple', 'all', 'classic', 'vs', 'random', 'two']
const DISPLAY_LABELS: Record<DisplayCategory, string> = {
  couple: '情侶模式',
  all: '全部',
  classic: '經典派對',
  vs: '競技對決',
  random: '隨機選人',
  two: '2 人',
}
const DISPLAY_ICONS: Record<DisplayCategory, LucideIcon> = {
  couple: Heart,
  all: LayoutGrid,
  classic: Users,
  vs: Swords,
  random: Shuffle,
  two: Users,
}
/** P1-106：解析 players 字串取得 min/max 人數 */
function parsePlayersRange(players: string): { min: number; max: number } {
  const match = players.match(/(\d+)\s*[-~–]\s*(\d+)/)
  if (match) return { min: parseInt(match[1], 10), max: parseInt(match[2], 10) }
  const single = players.match(/(\d+)\s*人/)
  if (single) {
    const n = parseInt(single[1], 10)
    return { min: n, max: n }
  }
  if (/無限|1\+\s*人|1\+人/.test(players)) return { min: 1, max: 999 }
  return { min: 1, max: 999 }
}

type PlayerCountFilter = 'all' | '2' | '2-4' | '4-8' | '8+'
type DurationFilter = 'all' | 'short' | 'medium' | 'long'
const PLAYER_COUNT_OPTIONS: { value: PlayerCountFilter; label: string }[] = [
  { value: 'all', label: '不限人數' },
  { value: '2', label: '2 人' },
  { value: '2-4', label: '2–4 人' },
  { value: '4-8', label: '4–8 人' },
  { value: '8+', label: '8+ 人' },
]
const DURATION_OPTIONS: { value: DurationFilter; label: string }[] = [
  { value: 'all', label: '不限時長' },
  { value: 'short', label: '5 分內' },
  { value: 'medium', label: '5–10 分' },
  { value: 'long', label: '10 分+' },
]

const DISPLAY_TO_INTERNAL: Record<DisplayCategory, GameCategory[] | null> = {
  couple: null,
  all: null,
  classic: ['party', 'facetoface'],
  vs: ['reaction', 'guess'],
  random: ['draw', 'other'],
  two: null,
}

/** GAMES_500 #92：分類 tab 對應 i18n key；P0-003 情侶模式無 i18n 則用 label */
const DISPLAY_I18N_KEYS: Record<DisplayCategory, string> = {
  couple: 'lobby.category.couple',
  all: GAMES_LOBBY_CATEGORY_ALL_I18N_KEY,
  classic: GAMES_LOBBY_CATEGORY_CLASSIC_I18N_KEY,
  vs: GAMES_LOBBY_CATEGORY_VS_I18N_KEY,
  random: GAMES_LOBBY_CATEGORY_RANDOM_I18N_KEY,
  two: GAMES_LOBBY_CATEGORY_TWO_I18N_KEY,
}

interface LobbyProps {
  games: GameOption[]
  recentGameIds?: string[]
  /** 任務 7：本週各遊戲遊玩次數，用於「本週熱門」區塊 */
  weeklyPlayCounts?: Record<string, number>
  /** R2-191：本週限時免費的付費遊戲 ID，用於顯示「本週免費」標籤 */
  weeklyFreeGameIds?: string[]
  onSelect: (id: string) => void
  /** P1-122：篩選狀態保持 — 由 URL 或父層傳入，有則為受控模式 */
  displayFilter?: DisplayCategory
  onDisplayFilterChange?: (cat: DisplayCategory) => void
  /** R2-134：自訂播放列表 — 可依序啟動 */
  playlists?: GamePlaylist[]
  onStartPlaylist?: (queue: GameId[]) => void
  onSavePlaylists?: (next: GamePlaylist[]) => void
  /** R2-288：404 搜尋後導向 /games?q= 時預填搜尋框 */
  initialSearchQuery?: string
}

export default function Lobby({ games, recentGameIds = [], weeklyPlayCounts = {}, weeklyFreeGameIds = [], onSelect, displayFilter: controlledFilter, onDisplayFilterChange, playlists = [], onStartPlaylist, onSavePlaylists, initialSearchQuery = '' }: LobbyProps) {
  const { t } = useTranslation()
  const reducedMotion = useReducedMotion()
  /** T051：預設「經典派對」= 熱門類型；P1-122 受控時用 props，否則用內部 state */
  const [internalFilter, setInternalFilter] = useState<DisplayCategory>('classic')
  const displayFilter = controlledFilter ?? internalFilter
  const [isPending, startTransition] = useTransition()
  /** P2-279：篩選切換以 startTransition 標記為低優先級，避免阻塞輸入 */
  const setDisplayFilter = useCallback((cat: DisplayCategory) => {
    if (onDisplayFilterChange) {
      onDisplayFilterChange(cat)
    } else {
      startTransition(() => setInternalFilter(cat))
    }
  }, [onDisplayFilterChange, startTransition])
  /** P1-106：適合人數與遊戲時長篩選 */
  const [playerCountFilter, setPlayerCountFilter] = useState<PlayerCountFilter>('all')
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all')
  /** 任務 4：收藏 ID 列表，用於頂置與心形狀態 */
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteGameIds())
  /** 任務 10：遊戲評分，用於卡片顯示與更新 */
  const [ratings, setRatings] = useState<Record<string, number>>(() => getGameRatings())
  /** 最近玩過：依 recentGameIds 順序取對應遊戲；AUDIT #4 最多 3 款減少選擇疲勞 */
  const recentGames = useMemo(
    () => recentGameIds.slice(0, 3).map((id) => games.find((g) => g.id === id)).filter(Boolean) as GameOption[],
    [games, recentGameIds]
  )
  /** 79 搜尋遊戲：依名稱或描述篩選；useDeferredValue 取代手動 debounce；R2-288 支援 initialSearchQuery */
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [searchFocused, setSearchFocused] = useState(false)
  const deferredQuery = useDeferredValue(searchQuery)
  const buttonRefs = useRef<(HTMLDivElement | null)[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const categoryTabListRef = useRef<HTMLDivElement>(null)
  /** P1-118：遊戲規則快速預覽 Modal */
  const [rulesModal, setRulesModal] = useState<{ name: string; rules: string } | null>(null)
  /** PERF-006：長列表分頁，預設顯示筆數，載入更多展開 */
  const INITIAL_VISIBLE = 24
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)
  /** R2-134：新增播放列表 modal */
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistIds, setNewPlaylistIds] = useState<string[]>([])

  /** useMemo：複雜 filter 邏輯；T072「2 人」兩人友善；P0-003「情侶模式」兩人友善且 adult 或 party */
  const filteredByCategory = useMemo(
    () => {
      if (displayFilter === 'all') return games.filter(g => !g.deprecated)
      if (displayFilter === 'couple') return games.filter((g) => !g.deprecated && g.twoPlayerFriendly === true && (g.category === 'adult' || g.category === 'party'))
      if (displayFilter === 'two') return games.filter((g) => !g.deprecated && g.twoPlayerFriendly === true)
      const allowed = DISPLAY_TO_INTERNAL[displayFilter]
      return games.filter((g) => {
        if (g.deprecated) return false
        const internal = g.category ?? 'other'
        return allowed?.includes(internal) ?? false
      })
    },
    [games, displayFilter]
  )

  /** P1-106：適合人數與時長篩選；人數解析 players 字串、時長依 estimatedMinutes */
  const filteredBySecondary = useMemo(() => {
    return filteredByCategory.filter((g) => {
      if (playerCountFilter !== 'all') {
        const { min, max } = parsePlayersRange(g.players)
        const wantMin = playerCountFilter === '2' ? 2 : playerCountFilter === '2-4' ? 2 : playerCountFilter === '4-8' ? 4 : 8
        const wantMax = playerCountFilter === '2' ? 2 : playerCountFilter === '2-4' ? 4 : playerCountFilter === '4-8' ? 8 : 999
        if (max < wantMin || min > wantMax) return false
      }
      if (durationFilter !== 'all') {
        const mins = g.estimatedMinutes ?? 10
        if (durationFilter === 'short' && mins > 5) return false
        if (durationFilter === 'medium' && (mins <= 5 || mins > 10)) return false
        if (durationFilter === 'long' && mins <= 10) return false
      }
      return true
    })
  }, [filteredByCategory, playerCountFilter, durationFilter])

  /** 任務 5：搜尋匹配名稱、描述或拼音/關鍵字 searchKeys；AUDIT #16 min length 再送 filter 減少運算 */
  const filteredGames = useMemo(
    () => {
      const q = deferredQuery.trim().toLowerCase()
      if (!q || q.length < 2) return filteredBySecondary
      return filteredBySecondary.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          (g.searchKeys != null && g.searchKeys.toLowerCase().includes(q))
      )
    },
    [filteredBySecondary, deferredQuery]
  )

  /** 任務 4：收藏頂置，收藏的遊戲排在最前 */
  const sortedGames = useMemo(
    () => [...filteredGames].sort((a, b) => (favoriteIds.includes(b.id) ? 1 : 0) - (favoriteIds.includes(a.id) ? 1 : 0)),
    [filteredGames, favoriteIds]
  )
  /** PERF-006：僅渲染可見筆數，減少初始 DOM */
  const visibleGames = useMemo(() => sortedGames.slice(0, visibleCount), [sortedGames, visibleCount])
  const hasMoreGames = sortedGames.length > visibleCount

  /** GAMES_500 #133：收藏樂觀更新，先更新 UI 再寫入 localStorage 減少閃爍 */
  const handleToggleFavorite = useCallback((gameId: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId].slice(-50)
      toggleFavorite(gameId)
      return next
    })
  }, [])

  /** GAMES_500 #147：評分樂觀更新，先更新 UI 再持久化 */
  const handleRate = useCallback((gameId: string, stars: number) => {
    setRatings((prev) => ({ ...prev, [gameId]: stars }))
    setGameRating(gameId, stars)
  }, [])

  /** 任務 7：本週熱門 = 依本週遊玩次數排序取前 5 款（至少玩過 1 次） */
  const weeklyHotGames = useMemo(() => {
    const entries = Object.entries(weeklyPlayCounts).filter(([, n]) => n > 0)
    if (entries.length === 0) return []
    entries.sort((a, b) => b[1] - a[1])
    return entries.slice(0, 5).map(([id]) => games.find((g) => g.id === id)).filter(Boolean) as GameOption[]
  }, [games, weeklyPlayCounts])

  /** 任務 6：推薦 = 高評分(≥4) + 最近玩過前 2 + 熱門，去重取最多 5 個 */
  const recommendedGames = useMemo(() => {
    const seen = new Set<string>()
    const list: GameOption[] = []
    const add = (g: GameOption) => {
      if (g && !seen.has(g.id)) {
        seen.add(g.id)
        list.push(g)
      }
    }
    const highRated = games
      .filter((g) => (ratings[g.id] ?? 0) >= 4)
      .sort((a, b) => (ratings[b.id] ?? 0) - (ratings[a.id] ?? 0))
      .slice(0, 2)
    highRated.forEach(add)
    recentGameIds.slice(0, 2).forEach((id) => {
      const g = games.find((x) => x.id === id)
      if (g) add(g)
    })
    games.filter((g) => g.popular).slice(0, 3).forEach(add)
    return list.slice(0, 5)
  }, [games, ratings, recentGameIds])

  const handleSelect = useCallback((id: string) => onSelect(id), [onSelect])

  const handleFilterChange = useCallback((cat: DisplayCategory) => {
    startTransition(() => setDisplayFilter(cat))
  }, [setDisplayFilter])

  /** GAMES_500 #51：分類 tab 鍵盤 Home/End 切換 */
  const categoryTabRefs = useRef<(HTMLButtonElement | null)[]>([])

  /** GAMES_500 #50：搜尋框 focus 時捲入視窗（移動端鍵盤不遮擋） */
  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true)
    searchInputRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [])
  const handleSearchBlur = useCallback(() => { setSearchFocused(false) }, [])

  /** GAMES_500 #71：分類 tab 變更時當前項自動 scroll into view */
  useEffect(() => {
    const i = CATEGORY_LIST.indexOf(displayFilter)
    categoryTabRefs.current[i]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [displayFilter])

  /** GAMES_500 #83：篩選變更時捲動至列表頂部（可選）；P1-106 含人數與時長 */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [displayFilter, deferredQuery, playerCountFilter, durationFilter])

  /** GAMES_500 #81：按 / 聚焦搜尋時不觸發遊戲選擇 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement
      if (target.closest('input') || target.closest('textarea') || target.isContentEditable) return
      if (document.querySelector('[role="region"][aria-label="遊戲大廳"]')?.contains(target)) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleCategoryKeyDown = useCallback((e: React.KeyboardEvent, cat: DisplayCategory) => {
    const i = CATEGORY_LIST.indexOf(cat)
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.min(i + 1, CATEGORY_LIST.length - 1)
      setDisplayFilter(CATEGORY_LIST[next])
      categoryTabRefs.current[next]?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.max(i - 1, 0)
      setDisplayFilter(CATEGORY_LIST[next])
      categoryTabRefs.current[next]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      setDisplayFilter('all')
      categoryTabRefs.current[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      setDisplayFilter('two')
      categoryTabRefs.current[CATEGORY_LIST.length - 1]?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- CATEGORY_LIST 為模組級常數，穩定引用無需依賴
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let next = -1
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        next = Math.min(index + 1, visibleGames.length - 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        next = Math.max(index - 1, 0)
      }
      if (next >= 0 && buttonRefs.current[next]) {
        buttonRefs.current[next]?.focus()
      }
    },
    [visibleGames.length]
  )

  /** PERF-006：篩選/搜尋變更時重置可見筆數 */
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE)
  }, [displayFilter, deferredQuery, playerCountFilter, durationFilter])

  /** GAMES_500 #72：區塊順序可 A/B；variant_b 時本週熱門置前 */
  const blockOrder: Array<'recent' | 'weekly' | 'recommended'> =
    LOBBY_BLOCK_ORDER === 'variant_b' ? ['weekly', 'recent', 'recommended'] : ['recent', 'weekly', 'recommended']

  return (
    <div role="region" aria-label="遊戲大廳" className="lobby-region space-y-6" dir={GAMES_RTL ? 'rtl' : undefined}>
      <div className="flex justify-end">
        <NowPlayingCount />
      </div>
      {/* R2-134：自訂播放列表 — 依序啟動 */}
      {onStartPlaylist && onSavePlaylists && (
        <div className="mb-6" role="region" aria-label="我的播放列表">
          <p className="text-white/50 text-sm mb-2 font-medium flex items-center gap-2">
            <List className="w-4 h-4" aria-hidden /> 我的播放列表
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {playlists.map((pl) => {
              const validIds = pl.gameIds.filter((id) => games.some((g) => g.id === id))
              return (
                <div key={pl.id} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-white text-sm truncate max-w-[120px]">{pl.name}</span>
                  <span className="text-white/40 text-xs">({validIds.length} 款)</span>
                  <button type="button" onClick={() => onStartPlaylist(validIds)} className="p-1.5 rounded-lg bg-primary-500/30 text-primary-300 hover:bg-primary-500/50 games-focus-ring" aria-label={`依序播放 ${pl.name}`} disabled={validIds.length === 0}>
                    <Play className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => onSavePlaylists(playlists.filter((p) => p.id !== pl.id))} className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 games-focus-ring" aria-label={`刪除 ${pl.name}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
            <button type="button" onClick={() => { setNewPlaylistName(''); setNewPlaylistIds([]); setPlaylistModalOpen(true) }} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-white/20 text-white/60 hover:border-white/40 hover:text-white/80 text-sm games-focus-ring">
              <Plus className="w-4 h-4" /> 新增播放列表
            </button>
          </div>
        </div>
      )}

      {/* R2-134：新增播放列表 Modal */}
      {playlistModalOpen && onSavePlaylists && (
        <Modal open={playlistModalOpen} onClose={() => setPlaylistModalOpen(false)} title="新增播放列表">
          <div className="space-y-4">
            <label className="block">
              <span className="text-white/70 text-sm block mb-1">名稱</span>
              <input type="text" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="例如：今晚派對" className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 games-focus-ring" />
            </label>
            <div>
              <span className="text-white/70 text-sm block mb-2">選擇遊戲（依序播放）</span>
              <div className="max-h-[240px] overflow-y-auto space-y-1 pr-2">
                {games.slice(0, 40).map((g) => (
                  <label key={g.id} className="flex items-center gap-2 py-1 cursor-pointer text-white/90 hover:text-white">
                    <input type="checkbox" checked={newPlaylistIds.includes(g.id)} onChange={(e) => setNewPlaylistIds((prev) => e.target.checked ? [...prev, g.id] : prev.filter((id) => id !== g.id))} className="rounded border-white/30 text-primary-500" />
                    <span className="text-sm truncate">{g.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setPlaylistModalOpen(false)} className="px-4 py-2 rounded-lg bg-white/10 text-white games-focus-ring">取消</button>
              <button type="button" onClick={() => { if (newPlaylistName.trim() && newPlaylistIds.length > 0) { onSavePlaylists([...playlists, { id: createPlaylistId(), name: newPlaylistName.trim(), gameIds: newPlaylistIds as GameId[] }]); setPlaylistModalOpen(false) } }} className="px-4 py-2 rounded-lg bg-primary-500 text-white games-focus-ring" disabled={!newPlaylistName.trim() || newPlaylistIds.length === 0}>建立</button>
            </div>
          </div>
        </Modal>
      )}

      {/* GAMES_500 #56 #74 #72：最近玩過僅有資料時顯示；區塊順序依 LOBBY_BLOCK_ORDER */}
      {blockOrder.map((block) => {
        if (block === 'recent' && recentGames.length > 0)
          return (
            <div key="recent" className="mb-6" role="region" aria-label="最近玩過">
              <p className="text-white/50 text-sm mb-2 font-medium" data-i18n-key={GAMES_LOBBY_RECENT_I18N_KEY}>最近玩過</p>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                {recentGames.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => handleSelect(game.id)}
                    className="shrink-0 w-[160px] min-h-[100px] min-w-[44px] rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left hover:bg-white/[0.08] hover:border-white/20 transition-colors flex flex-col gap-1 games-focus-ring"
                  >
                    <FeatureIcon icon={game.icon} size="sm" color={game.color as 'primary' | 'secondary' | 'accent' | 'white'} />
                    <span className="text-white text-sm font-medium truncate">{game.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        if (block === 'weekly' && weeklyHotGames.length > 0)
          return (
            <div key="weekly" className="mb-6" role="region" aria-label="本週熱門">
              <p className="text-white/50 text-sm mb-2 font-medium flex items-center gap-2" data-i18n-key={GAMES_LOBBY_WEEKLY_I18N_KEY}>
                <Flame className="w-4 h-4 text-secondary-400 shrink-0" aria-hidden />
                本週熱門
              </p>
              <p className="text-white/30 text-xs mb-2" aria-hidden>本週你玩最多次的遊戲</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                {weeklyHotGames.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => handleSelect(game.id)}
                    className="shrink-0 w-[140px] min-h-[90px] rounded-2xl border border-secondary-500/30 bg-secondary-500/10 p-3 text-left hover:bg-secondary-500/20 transition-colors flex flex-col gap-1 games-focus-ring"
                  >
                    <FeatureIcon icon={game.icon} size="sm" color={game.color as 'primary' | 'secondary' | 'accent' | 'white'} />
                    <span className="text-white text-sm font-medium truncate">{game.name}</span>
                    <span className="text-secondary-400 text-xs tabular-nums" data-i18n-key={GAMES_LOBBY_WEEKLY_PLAYS_I18N_KEY}>{weeklyPlayCounts[game.id]} 次</span>
                  </button>
                ))}
              </div>
            </div>
          )
        if (block === 'recommended' && recommendedGames.length > 0)
          return (
            <div key="recommended" className="mb-6" role="region" aria-label="猜你喜歡：熱門遊戲快速入口">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <p className="text-white/50 text-sm font-medium" data-i18n-key={GAMES_LOBBY_RECOMMENDED_I18N_KEY}>猜你喜歡</p>
                <RecommendedDescriptionToggle />
              </div>
              <div className="flex flex-wrap gap-2">
                {recommendedGames.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => handleSelect(game.id)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary-500/20 border border-primary-500/40 text-primary-300 hover:bg-primary-500/30 transition-colors text-sm font-medium games-touch-target games-focus-ring"
                  >
                    <FeatureIcon icon={game.icon} size="sm" color={game.color as 'primary' | 'secondary' | 'accent' | 'white'} />
                    {game.name}
                  </button>
                ))}
              </div>
            </div>
          )
        return null
      })}

      {/* GAMES_500 #46 #47 #48 #70 #78 #88 #92：搜尋 placeholder/aria、min 2 字提示、搜尋中、Esc 清除、autocomplete、清除按鈕、i18n key；R2-101 搜尋框 focus 時寬度過渡 */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-center">
        <div
          className={`relative w-full flex-1 rounded-xl border border-white/10 overflow-hidden transition-[max-width] duration-300 ease-out ${searchFocused ? 'sm:max-w-md' : 'sm:max-w-sm'}`}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" aria-hidden />
          <input
            ref={searchInputRef}
            id="games-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.currentTarget.blur()
                setSearchQuery('')
              }
            }}
            aria-busy={isPending}
            aria-label="搜尋遊戲名稱"
            placeholder="搜尋遊戲名稱"
            data-i18n-key={GAMES_LOBBY_SEARCH_PLACEHOLDER_I18N_KEY}
            autoComplete="off"
            className="input-glass games-focus-ring w-full games-touch-target pl-11 pr-10"
          />
          {isPending && (
            <span className="absolute right-10 top-1/2 -translate-y-1/2 text-white/40 text-xs" aria-live="polite">搜尋中…</span>
          )}
          {searchQuery.trim().length === 1 && (
            <span className="absolute right-10 top-1/2 -translate-y-1/2 text-white/40 text-xs" aria-live="polite">至少輸入 2 字</span>
          )}
          {searchQuery.length >= 2 && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-2 rounded games-touch-target games-focus-ring"
              aria-label="清除搜尋"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          )}
        </div>
      </div>
      {/* GAMES_500 #51 #52 #53 #79 #89：分類 tab；R2-047 LayoutGroup 讓選中底線/背景平滑切換 */}
      <LayoutGroup>
        <div
          ref={categoryTabListRef}
          className="flex overflow-x-auto gap-0 mb-4 justify-start sm:justify-center scrollbar-hide pb-1 -mx-1 px-1 relative"
          role="tablist"
          aria-label="遊戲分類篩選"
          aria-describedby="lobby-game-count"
        >
          {CATEGORY_LIST.map((cat, idx) => {
            const Icon = DISPLAY_ICONS[cat]
            const isActive = displayFilter === cat
            return (
              <button
                key={cat}
                ref={(el) => { categoryTabRefs.current[idx] = el }}
                type="button"
                role="tab"
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleFilterChange(cat)}
                onKeyDown={(e) => handleCategoryKeyDown(e, cat)}
                aria-selected={isActive}
                aria-expanded={isActive}
                className={`relative shrink-0 inline-flex items-center gap-2 min-h-[48px] px-4 py-2 rounded-t-xl text-sm font-medium transition-colors border-b-2 ${isActive ? 'text-white border-transparent' : 'bg-transparent text-white/60 hover:text-white border-transparent hover:bg-white/5'}`}
              >
                {isActive && (
                  <m.span
                    layoutId="lobby-category-pill"
                    className="absolute inset-0 rounded-t-xl bg-white/15 border-b-2 border-primary-500"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4 shrink-0" aria-hidden />
                  <span data-i18n-key={DISPLAY_I18N_KEYS[cat]}>{cat === 'all' ? t('games.filterAll') : DISPLAY_LABELS[cat]}</span>
                </span>
              </button>
            )
          })}
        </div>
      </LayoutGroup>
      {/* P1-106：適合人數與遊戲時長篩選 chip */}
      <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="人數與時長篩選">
        <div className="flex flex-wrap gap-1.5 items-center">
          <Users className="w-4 h-4 text-white/50 shrink-0" aria-hidden />
          {PLAYER_COUNT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPlayerCountFilter(value)}
              className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-colors games-focus-ring ${playerCountFilter === value ? 'bg-primary-500/30 text-primary-200 border border-primary-500/50' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'}`}
              aria-pressed={playerCountFilter === value}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <Clock className="w-4 h-4 text-white/50 shrink-0" aria-hidden />
          {DURATION_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setDurationFilter(value)}
              className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-colors games-focus-ring ${durationFilter === value ? 'bg-primary-500/30 text-primary-200 border border-primary-500/50' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'}`}
              aria-pressed={durationFilter === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {/* GAMES_500 #55 #77 #79：總遊戲數固定顯示；篩選時加註當前數量；P1-114 隨機選一個；I18N-05 */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p id="lobby-game-count" className="text-sm text-white/50" aria-live="polite">
          {(t('games.gameCountTemplate') ?? '').replace(/\{\{total\}\}/g, String(games.length))}{sortedGames.length !== games.length ? (t('games.gameCountFilteredTemplate') ?? '').replace(/\{\{count\}\}/g, String(sortedGames.length)) : ''}
        </p>
        {sortedGames.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const idx = Math.floor(Math.random() * sortedGames.length)
              onSelect(sortedGames[idx].id)
            }}
            className="min-h-[44px] px-3 py-1.5 rounded-xl bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 text-sm font-medium flex items-center gap-1.5 games-focus-ring"
            aria-label={t('games.randomPickAria') ?? undefined}
          >
            <Shuffle className="w-4 h-4 shrink-0" aria-hidden />
            {t('games.randomPick')}
          </button>
        )}
      </div>
      {/* GAMES_500 #49 #63 #64 #87：空狀態建議關鍵字／清除搜尋；建立房間為同頁區塊；I18N-05 */}
      {sortedGames.length === 0 && (
        <div className="text-center py-8 px-4" role="status" aria-live="polite">
          <Search className="w-10 h-10 text-white/30 mx-auto mb-3" aria-hidden />
          <p className="text-white/50 text-sm mb-1">{t('games.noMatch')}</p>
          <p className="text-white/40 text-xs mb-2">{t('games.tryKeywords')}</p>
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {[
              { key: 'party', labelKey: 'games.keywordParty' as const },
              { key: 'roulette', labelKey: 'games.keywordRoulette' as const },
              { key: 'dice', labelKey: 'games.keywordDice' as const },
              { key: 'truthOrDare', labelKey: 'games.keywordTruthOrDare' as const },
            ].map(({ key, labelKey }) => {
              const label = t(labelKey) ?? ''
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSearchQuery(label)}
                  className="min-h-[44px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                  aria-label={(t('games.searchKeywordAria') ?? '').replace(/\{\{keyword\}\}/g, label)}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <p className="text-white/40 text-xs mb-4">{t('games.scrollToCreate')}</p>
          {deferredQuery.trim().length >= 2 && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            >
              {t('games.clearSearch')}
            </button>
          )}
        </div>
      )}
      {/* R2-061：分類切換時遊戲列表淡入；GAMES_500 #54 #66 #67 #69：列表 aria-busy、grid、role list/listitem；PERF-006 分頁顯示 */}
      <m.div
        key={displayFilter}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 card-grid-gap ${isPending ? 'opacity-70 transition-opacity duration-200' : ''}`}
        role="list"
        aria-label="遊戲列表"
        aria-busy={isPending}
      >
        {visibleGames.map((game, index) => (
          <PrefetchOnVisible key={game.id} gameId={game.id}>
            <GameCard
              game={{
                ...game,
                isFavorite: favoriteIds.includes(game.id),
                onToggleFavorite: handleToggleFavorite,
                rating: ratings[game.id],
                onRate: handleRate,
                isGuestTrial: GUEST_TRIAL_GAME_IDS.includes(game.id),
                twoPlayerFriendly: game.twoPlayerFriendly,
                onShowRules: (g) => setRulesModal({ name: g.name, rules: g.rulesSummary ?? (t('games.rulesSummaryFallback') ?? '') }),
                /** R2-199：付費遊戲皇冠圖標 — 有 requiredTier 且非 free 即顯示 */
                isPremium: game.isPremium ?? (() => { const tier = getGameMeta(game.id)?.requiredTier; return tier != null && tier !== 'free'; })(),
                /** R2-191：本週限時免費標籤 */
                isWeeklyFree: weeklyFreeGameIds.includes(game.id),
                /** Task 15: 18+ 標籤 */
                hasAdultContent: game.category === 'adult' || game.modes?.some(m => m.id.includes('spicy') || m.id === 'adult'),
              }}
              index={index}
              onSelect={handleSelect}
              onKeyDown={handleKeyDown}
              buttonRef={(el) => { buttonRefs.current[index] = el }}
              displayLabel={game.category ? (DISPLAY_TO_INTERNAL.classic?.includes(game.category) ? DISPLAY_LABELS.classic : DISPLAY_TO_INTERNAL.vs?.includes(game.category) ? DISPLAY_LABELS.vs : DISPLAY_LABELS.random) : undefined}
            />
          </PrefetchOnVisible>
        ))}
      </m.div>
      {hasMoreGames && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => Math.min(c + INITIAL_VISIBLE, sortedGames.length))}
            className="min-h-[48px] px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium games-focus-ring"
            aria-label={t('games.loadMoreAria') ?? `載入更多遊戲（目前 ${visibleGames.length} / ${sortedGames.length}）`}
          >
            {t('games.loadMore') ?? `載入更多（${sortedGames.length - visibleCount}）`}
          </button>
        </div>
      )}

      {/* Open Brewery DB 整合：隨機酒廠卡片 */}
      <div className="mt-6 max-w-sm">
        <RandomBrewery />
      </div>

      {/* P1-118：遊戲規則快速預覽 Modal；I18N-05 */}
      <Modal
        open={rulesModal != null}
        onClose={() => setRulesModal(null)}
        title={rulesModal ? (t('games.rulesTitle') ?? '').replace(/\{\{name\}\}/g, rulesModal.name) : undefined}
      >
        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{rulesModal?.rules ?? ''}</p>
      </Modal>
    </div>
  )
}
