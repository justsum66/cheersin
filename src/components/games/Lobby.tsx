'use client'

import { useState, useRef, useCallback, useMemo, useDeferredValue, useTransition, useEffect, type ReactNode } from 'react'
import { Search, Users, Swords, Shuffle, LayoutGrid, Flame, Heart, ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react'
import FeatureIcon from '@/components/ui/FeatureIcon'
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
import type { GameDifficulty, GameCategory } from '@/config/games.config'
import { GUEST_TRIAL_GAME_IDS } from '@/config/games.config'

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
  onSelect: (id: string) => void
  /** P1-122：篩選狀態保持 — 由 URL 或父層傳入，有則為受控模式 */
  displayFilter?: DisplayCategory
  onDisplayFilterChange?: (cat: DisplayCategory) => void
}

export default function Lobby({ games, recentGameIds = [], weeklyPlayCounts = {}, onSelect, displayFilter: controlledFilter, onDisplayFilterChange }: LobbyProps) {
  /** T051：預設「經典派對」= 熱門類型；P1-122 受控時用 props，否則用內部 state */
  const [internalFilter, setInternalFilter] = useState<DisplayCategory>('classic')
  const displayFilter = controlledFilter ?? internalFilter
  const setDisplayFilter = useCallback((cat: DisplayCategory) => {
    if (onDisplayFilterChange) {
      onDisplayFilterChange(cat)
    } else {
      setInternalFilter(cat)
    }
  }, [onDisplayFilterChange])
  /** 任務 4：收藏 ID 列表，用於頂置與心形狀態 */
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteGameIds())
  /** 任務 10：遊戲評分，用於卡片顯示與更新 */
  const [ratings, setRatings] = useState<Record<string, number>>(() => getGameRatings())
  /** 最近玩過：依 recentGameIds 順序取對應遊戲；AUDIT #4 最多 3 款減少選擇疲勞 */
  const recentGames = useMemo(
    () => recentGameIds.slice(0, 3).map((id) => games.find((g) => g.id === id)).filter(Boolean) as GameOption[],
    [games, recentGameIds]
  )
  /** 79 搜尋遊戲：依名稱或描述篩選；useDeferredValue 取代手動 debounce */
  const [searchQuery, setSearchQuery] = useState('')
  const deferredQuery = useDeferredValue(searchQuery)
  const [isPending, startTransition] = useTransition()
  const buttonRefs = useRef<(HTMLDivElement | null)[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const categoryTabListRef = useRef<HTMLDivElement>(null)

  /** useMemo：複雜 filter 邏輯；T072「2 人」兩人友善；P0-003「情侶模式」兩人友善且 adult 或 party */
  const filteredByCategory = useMemo(
    () => {
      if (displayFilter === 'all') return games
      if (displayFilter === 'couple') return games.filter((g) => g.twoPlayerFriendly === true && (g.category === 'adult' || g.category === 'party'))
      if (displayFilter === 'two') return games.filter((g) => g.twoPlayerFriendly === true)
      const allowed = DISPLAY_TO_INTERNAL[displayFilter]
      return games.filter((g) => {
        const internal = g.category ?? 'other'
        return allowed?.includes(internal) ?? false
      })
    },
    [games, displayFilter]
  )

  /** 任務 5：搜尋匹配名稱、描述或拼音/關鍵字 searchKeys；AUDIT #16 min length 再送 filter 減少運算 */
  const filteredGames = useMemo(
    () => {
      const q = deferredQuery.trim().toLowerCase()
      if (!q || q.length < 2) return filteredByCategory
      return filteredByCategory.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          (g.searchKeys != null && g.searchKeys.toLowerCase().includes(q))
      )
    },
    [filteredByCategory, deferredQuery]
  )

  /** 任務 4：收藏頂置，收藏的遊戲排在最前 */
  const sortedGames = useMemo(
    () => [...filteredGames].sort((a, b) => (favoriteIds.includes(b.id) ? 1 : 0) - (favoriteIds.includes(a.id) ? 1 : 0)),
    [filteredGames, favoriteIds]
  )

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
    searchInputRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [])

  /** GAMES_500 #71：分類 tab 變更時當前項自動 scroll into view */
  useEffect(() => {
    const i = CATEGORY_LIST.indexOf(displayFilter)
    categoryTabRefs.current[i]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [displayFilter])

  /** GAMES_500 #83：篩選變更時捲動至列表頂部（可選） */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [displayFilter, deferredQuery])

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
        next = Math.min(index + 1, sortedGames.length - 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        next = Math.max(index - 1, 0)
      }
      if (next >= 0 && buttonRefs.current[next]) {
        buttonRefs.current[next]?.focus()
      }
    },
    [sortedGames.length]
  )

  /** GAMES_500 #72：區塊順序可 A/B；variant_b 時本週熱門置前 */
  const blockOrder: Array<'recent' | 'weekly' | 'recommended'> =
    LOBBY_BLOCK_ORDER === 'variant_b' ? ['weekly', 'recent', 'recommended'] : ['recent', 'weekly', 'recommended']

  return (
    <div role="region" aria-label="遊戲大廳" className="lobby-region space-y-6" dir={GAMES_RTL ? 'rtl' : undefined}>
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

      {/* GAMES_500 #46 #47 #48 #70 #78 #88 #92：搜尋 placeholder/aria、min 2 字提示、搜尋中、Esc 清除、autocomplete、清除按鈕、i18n key */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-center">
        <div className="relative w-full flex-1 sm:max-w-sm rounded-xl border border-white/10 overflow-hidden">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" aria-hidden />
          <input
            ref={searchInputRef}
            id="games-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
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
      {/* GAMES_500 #51 #52 #53 #79 #89：分類 tab 鍵盤 Home/End、aria-selected/tabIndex、icon 色盲友善、aria-describedby、scrollbar-hide */}
      <div
        ref={categoryTabListRef}
        className="flex overflow-x-auto gap-0 mb-4 justify-start sm:justify-center scrollbar-hide pb-1 -mx-1 px-1"
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
              className={`shrink-0 inline-flex items-center gap-2 min-h-[48px] px-4 py-2 rounded-t-xl text-sm font-medium transition-colors border-b-2 ${isActive ? 'bg-white/15 text-white border-primary-500' : 'bg-transparent text-white/60 hover:text-white border-transparent hover:bg-white/5'}`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden />
              <span data-i18n-key={DISPLAY_I18N_KEYS[cat]}>{DISPLAY_LABELS[cat]}</span>
            </button>
          )
        })}
      </div>
      {/* GAMES_500 #55 #77 #79：總遊戲數固定顯示；篩選時加註當前數量；P1-114 隨機選一個 */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p id="lobby-game-count" className="text-sm text-white/50" aria-live="polite">
          共 {games.length} 款遊戲{sortedGames.length !== games.length ? `（當前 ${sortedGames.length} 款）` : ''}
        </p>
        {sortedGames.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const idx = Math.floor(Math.random() * sortedGames.length)
              onSelect(sortedGames[idx].id)
            }}
            className="min-h-[44px] px-3 py-1.5 rounded-xl bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 text-sm font-medium flex items-center gap-1.5 games-focus-ring"
            aria-label="隨機選一個遊戲"
          >
            <Shuffle className="w-4 h-4 shrink-0" aria-hidden />
            隨機來一個
          </button>
        )}
      </div>
      {/* GAMES_500 #49 #63 #64 #87：空狀態建議關鍵字／清除搜尋；建立房間為同頁區塊 */}
      {sortedGames.length === 0 && (
        <div className="text-center py-8 px-4" role="status" aria-live="polite">
          <Search className="w-10 h-10 text-white/30 mx-auto mb-3" aria-hidden />
          <p className="text-white/50 text-sm mb-1">沒有符合的遊戲，試試其他分類或搜尋關鍵字</p>
          <p className="text-white/40 text-xs mb-2">試試關鍵字：</p>
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {['派對', '轉盤', '骰子', '真心話'].map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => setSearchQuery(kw)}
                className="min-h-[44px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                aria-label={`搜尋 ${kw}`}
              >
                {kw}
              </button>
            ))}
          </div>
          <p className="text-white/40 text-xs mb-4">或向下捲動建立房間，邀請好友一起玩</p>
          {deferredQuery.trim().length >= 2 && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            >
              清除搜尋
            </button>
          )}
        </div>
      )}
      {/* GAMES_500 #54 #66 #67 #69：列表 aria-busy(isPending)、grid 斷點、role list/listitem、篩選中 opacity；P3-50：未來若列表增長可考慮虛擬捲動或分頁 */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 card-grid-gap ${isPending ? 'opacity-70 transition-opacity duration-200' : ''}`} role="list" aria-label="遊戲列表" aria-busy={isPending}>
      {sortedGames.map((game, index) => (
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
            }}
            index={index}
            onSelect={handleSelect}
            onKeyDown={handleKeyDown}
            buttonRef={(el) => { buttonRefs.current[index] = el }}
            displayLabel={game.category ? (DISPLAY_TO_INTERNAL.classic?.includes(game.category) ? DISPLAY_LABELS.classic : DISPLAY_TO_INTERNAL.vs?.includes(game.category) ? DISPLAY_LABELS.vs : DISPLAY_LABELS.random) : undefined}
          />
        </PrefetchOnVisible>
      ))}
      </div>
    </div>
  )
}
