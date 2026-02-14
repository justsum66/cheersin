'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { ThumbsUp, ThumbsDown, Copy, Hand, EyeOff, Trophy, Heart, Plus, Timer, Play, Pause, Loader2, AlertTriangle } from 'lucide-react'
import GameRules from './GameRules'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { fireFullscreenConfetti } from '@/lib/celebration'
import { useTranslation } from '@/contexts/I18nContext'
import { useGameReduceMotion } from './GameWrapper'
import { logger } from '@/lib/logger'
import { getStatementsByCategory, CATEGORY_LABEL, type NeverHaveIEverCategory } from '@/lib/never-have-i-ever'
import { useGamePersistence } from '@/hooks/useGamePersistence'
import { useSubscription } from '@/hooks/useSubscription'
import { FREE_CUSTOM_QUESTIONS_LIMIT } from '@/lib/constants'
import { useGameStore } from '@/store/useGameStore'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/Badge'

/** 266–270 題庫分類：愛情/職場/生活/黑歷史/18+（直接使用 data/neverHaveIEver.json） */
const CATEGORY_OPTIONS: { value: NeverHaveIEverCategory | 'all' | 'favorites'; label: string; icon?: React.ReactNode }[] = [
  { value: 'all', label: '全部' },
  { value: 'love', label: CATEGORY_LABEL.love },
  { value: 'work', label: CATEGORY_LABEL.work },
  { value: 'life', label: CATEGORY_LABEL.life },
  { value: 'dark', label: CATEGORY_LABEL.dark },
  { value: 'adult', label: CATEGORY_LABEL.adult },
  { value: 'favorites', label: '收藏', icon: <Heart className="w-3 h-3 fill-current" /> },
]

/** G3-012: Particle emojis for "I Have" */
const PARTY_EMOJIS = ['🍺', '🥂', '🍻', '🎉', '🔥', '😈', '💀', '😂', '🤭', '👀']

/** G3-014: Auto-play intervals */
const AUTO_PLAY_INTERVALS = [
  { value: 5, label: '5s' },
  { value: 8, label: '8s' },
  { value: 12, label: '12s' },
]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

export default function NeverHaveIEver() {
  const { t } = useTranslation()
  const { tier } = useSubscription()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const { selectedMode } = useGameStore()
  const [categoryFilter, setCategoryFilter] = useState<NeverHaveIEverCategory | 'all' | 'favorites'>('all')

  // Phase 2: React to selectedMode
  useEffect(() => {
    if (selectedMode === 'spicy') {
      setCategoryFilter('adult')
    } else if (selectedMode === 'classic') {
      setCategoryFilter('all')
    }
  }, [selectedMode])

  const [pool, setPool] = useState<{ text: string; category: NeverHaveIEverCategory }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [roundTotal, setRoundTotal] = useState(pool.length)
  const [usedInRound, setUsedInRound] = useState(0)
  const [copyToast, setCopyToast] = useState(false)
  /** 48 每人「做過」次數 */
  const [doneCountByPlayer, setDoneCountByPlayer] = useState<Record<number, number>>(() => ({}))
  /** 當前輪到誰回答（每題輪換） */
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  /** 47 舉手動畫觸發 */
  const [handRaise, setHandRaise] = useState(false)
  const handRaiseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const copyToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isNewRoundPending, setIsNewRoundPending] = useState(false)
  const newRoundCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** 50 匿名模式 */
  const [anonymousMode, setAnonymousMode] = useState(false)
  /** 本題做過人數（匿名時顯示） */
  const [doneCountCurrentCard, setDoneCountCurrentCard] = useState(0)
  /** R2-132：本題點過「我做過」的玩家索引，揭曉時顯示頭像 */
  const [didItPlayerIndicesForCard, setDidItPlayerIndicesForCard] = useState<number[]>([])
  /** 是否已揭曉本題（顯示「做過的人」與下一題按鈕） */
  const [showDidItReveal, setShowDidItReveal] = useState(false)

  // G3-011: Favorites persistence
  const [favorites, setFavorites] = useGamePersistence<string[]>('nhie_favorites', [])
  // G3-013: Custom questions persistence
  const [customQuestions, setCustomQuestions] = useGamePersistence<string[]>('nhie_custom', [])
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState('')
  // G3-012: Floating particles
  const [particles, setParticles] = useState<{ id: number; emoji: string; x: number; y: number }[]>([])
  const particleIdRef = useRef(0)
  // G3-014: Auto-play
  const [autoPlay, setAutoPlay] = useState(false)
  const [autoPlayInterval, setAutoPlayInterval] = useState(8)
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(0)
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const current = pool[currentIndex]

  const nextCard = useCallback(
    (hasDone: boolean) => {
      play(hasDone ? 'correct' : 'click')
      setDirection(hasDone ? 1 : -1)
      setUsedInRound((u) => u + 1)
      if (hasDone) {
        setDoneCountByPlayer((prev) => ({
          ...prev,
          [currentPlayerIndex]: (prev[currentPlayerIndex] ?? 0) + 1,
        }))
        setDoneCountCurrentCard((c) => c + 1)
        spawnParticles()
      }
      setPool((prev) => prev.filter((_, i) => i !== currentIndex))
      setCurrentIndex(0)
      setCurrentPlayerIndex((i) => (i + 1) % players.length)
      setDoneCountCurrentCard(0)
      setDidItPlayerIndicesForCard([])
      setShowDidItReveal(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentIndex, currentPlayerIndex, players.length, play]
  )

  /** R2-132：揭曉後點「下一題」時呼叫；依本題是否有人做過決定 nextCard(true/false) */
  const goNextCard = useCallback(() => {
    const hasDone = didItPlayerIndicesForCard.length > 0
    nextCard(hasDone)
  }, [didItPlayerIndicesForCard.length, nextCard])

  const handleNoIDidNot = useCallback(() => {
    if (current) setShowDidItReveal(true)
  }, [current])

  // G3-012: Particle spawner
  const spawnParticles = useCallback(() => {
    if (reducedMotion) return
    const newParticles = Array.from({ length: 6 }, () => {
      const id = ++particleIdRef.current
      return {
        id,
        emoji: PARTY_EMOJIS[Math.floor(Math.random() * PARTY_EMOJIS.length)],
        x: Math.random() * 200 - 100,
        y: -(Math.random() * 120 + 40),
      }
    })
    setParticles((prev) => [...prev, ...newParticles])
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)))
    }, 1200)
  }, [reducedMotion])

  // G3-011: Toggle favorite
  const toggleFavorite = useCallback(() => {
    if (!current) return
    const text = current.text
    setFavorites((prev) => {
      if (prev.includes(text)) return prev.filter((t) => t !== text)
      return [...prev, text]
    })
    play('click')
  }, [current, play, setFavorites])

  const isFavorited = current ? favorites.includes(current.text) : false

  // G3-013: Add custom question
  const addCustomQuestion = useCallback(() => {
    const trimmed = newQuestionText.trim()
    if (!trimmed || trimmed.length < 2) {
      toast.error('題目至少需要 2 個字')
      return
    }
    /** R2-195：免費方案自訂題目數量上限 */
    if (tier === 'free' && customQuestions.length >= FREE_CUSTOM_QUESTIONS_LIMIT) {
      toast.error(`免費方案最多 ${FREE_CUSTOM_QUESTIONS_LIMIT} 題自訂題目，升級 Pro 解鎖更多`)
      return
    }
    if (customQuestions.includes(trimmed)) {
      toast.error('這題已經存在了')
      return
    }
    setCustomQuestions((prev) => [...prev, trimmed])
    setNewQuestionText('')
    setShowAddQuestion(false)
    toast.success('已新增自訂題目')
  }, [newQuestionText, customQuestions, setCustomQuestions, tier])

  const startNewRound = useCallback(async () => {
    if (isNewRoundPending) return
    setIsNewRoundPending(true)
    if (newRoundCooldownRef.current) clearTimeout(newRoundCooldownRef.current)
    newRoundCooldownRef.current = setTimeout(() => {
      newRoundCooldownRef.current = null
      setIsNewRoundPending(false)
    }, 400)

    setIsLoading(true)
    try {
      let items: { text: string; category: NeverHaveIEverCategory }[]
      if (categoryFilter === 'favorites') {
        // G3-011: Favorites filter
        items = favorites.map((text) => ({ text, category: 'life' as NeverHaveIEverCategory }))
      } else {
        items = await getStatementsByCategory(categoryFilter)
        // G3-013: Merge custom questions
        const customItems = customQuestions.map((text) => ({ text, category: 'life' as NeverHaveIEverCategory }))
        items = [...items, ...customItems]
      }
      const shuffled = [...items].sort(() => Math.random() - 0.5)
      setPool(shuffled)
      setRoundTotal(shuffled.length)
      setUsedInRound(0)
      setCurrentIndex(0)
      setDoneCountCurrentCard(0)
    } finally {
      setIsLoading(false)
      setIsNewRoundPending(false)
    }
  }, [categoryFilter, isNewRoundPending, favorites, customQuestions])

  // Initial load
  useEffect(() => {
    startNewRound()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** R2-132：我做過 — 加入本題做過名單、更新排行榜、舉手動畫，然後進入揭曉（顯示做過的人頭像 + 下一題） */
  const handleIDidIt = useCallback(() => {
    if (!current) return
    if (handRaiseTimeoutRef.current) clearTimeout(handRaiseTimeoutRef.current)
    setHandRaise(true)
    setDidItPlayerIndicesForCard((prev) => (prev.includes(currentPlayerIndex) ? prev : [...prev, currentPlayerIndex]))
    setDoneCountCurrentCard((c) => c + 1)
    setDoneCountByPlayer((prev) => ({
      ...prev,
      [currentPlayerIndex]: (prev[currentPlayerIndex] ?? 0) + 1,
    }))
    handRaiseTimeoutRef.current = setTimeout(() => {
      handRaiseTimeoutRef.current = null
      setHandRaise(false)
      setShowDidItReveal(true)
    }, 600)
  }, [current, currentPlayerIndex])

  /** 49 老司機：最高次數者 */
  const leaderboard = Object.entries(doneCountByPlayer)
    .map(([i, count]) => ({ index: Number(i), name: players[Number(i)] ?? `玩家 ${Number(i) + 1}`, count }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
  const topPlayer = leaderboard[0]

  useEffect(() => {
    async function updateRoundTotal() {
      if (categoryFilter === 'favorites') {
        setRoundTotal(favorites.length)
      } else {
        const filtered = await getStatementsByCategory(categoryFilter)
        setRoundTotal(filtered.length + (categoryFilter === 'all' ? customQuestions.length : 0))
      }
    }
    updateRoundTotal()
  }, [categoryFilter, favorites.length, customQuestions.length])

  const copyCurrentStatement = useCallback(async () => {
    if (!current) return
    const text = `我從來沒有：${current.text}`
    try {
      await navigator.clipboard.writeText(text)
      if (copyToastTimeoutRef.current) clearTimeout(copyToastTimeoutRef.current)
      setCopyToast(true)
      copyToastTimeoutRef.current = setTimeout(() => {
        copyToastTimeoutRef.current = null
        setCopyToast(false)
      }, 2000)
    } catch (err) {
      logger.error('[NeverHaveIEver] clipboard write failed', { err: err instanceof Error ? err.message : String(err) })
    }
  }, [current])

  // G3-014: Auto-play timer
  useEffect(() => {
    if (!autoPlay || !current) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current)
      autoPlayTimerRef.current = null
      setAutoPlayCountdown(0)
      return
    }
    setAutoPlayCountdown(autoPlayInterval)
    autoPlayTimerRef.current = setInterval(() => {
      setAutoPlayCountdown((prev) => {
        if (prev <= 1) {
          // Auto-advance: treat as "not done"
          handleNoIDidNot()
          return autoPlayInterval
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current)
      autoPlayTimerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, autoPlayInterval, current?.text])

  useEffect(() => {
    return () => {
      if (handRaiseTimeoutRef.current) {
        clearTimeout(handRaiseTimeoutRef.current)
        handRaiseTimeoutRef.current = null
      }
      if (copyToastTimeoutRef.current) {
        clearTimeout(copyToastTimeoutRef.current)
        copyToastTimeoutRef.current = null
      }
      if (newRoundCooldownRef.current) {
        clearTimeout(newRoundCooldownRef.current)
        newRoundCooldownRef.current = null
      }
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
    }
  }, [])

  const exhausted = pool.length === 0 && usedInRound > 0
  const displayProgress = current ? `${usedInRound + 1} / ${roundTotal}` : (exhausted ? `已出完 ${roundTotal} 題` : '—')

  /** GAME-014：本局題目出完時 confetti 慶祝（reducedMotion 時不播） */
  const exhaustedFiredRef = useRef(false)
  useEffect(() => {
    if (exhausted && !exhaustedFiredRef.current && !reducedMotion) {
      exhaustedFiredRef.current = true
      fireFullscreenConfetti().catch(() => { })
    }
    if (!exhausted) exhaustedFiredRef.current = false
  }, [exhausted, reducedMotion])

  // Phase 2: 18+ Warning
  const [showWarning, setShowWarning] = useState(true)

  if ((selectedMode === 'spicy' || categoryFilter === 'adult') && showWarning) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px">
        <m.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6 max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">18+ 成人內容警告</h2>
          <p className="text-white/70">
            此遊戲包含成人向內容，僅限 18 歲以上玩家參與。
            做過的人要喝！
          </p>
          <button
            type="button"
            onClick={() => setShowWarning(false)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold games-focus-ring"
          >
            我已滿 18 歲，繼續
          </button>
        </m.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="我從來沒有">
      <GameRules rules={`輪流出題「我從來沒有…」，做過該事的人喝。\n可選分類：愛情／職場／生活／黑歷史／18+；本局不重複已出題。匿名模式不顯示誰做過。`} rulesKey="never-have-i-ever.rules" />
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-2 w-full max-w-lg justify-center" role="group" aria-label="題目分類">
        {(!selectedMode || selectedMode === 'classic') && (
          <>
            {CATEGORY_OPTIONS.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setCategoryFilter(value); startNewRound(); }}
                aria-pressed={categoryFilter === value}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors min-h-[48px] min-w-[48px] games-focus-ring flex items-center gap-1 ${categoryFilter === value ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'} ${value === 'favorites' && favorites.length === 0 ? 'opacity-50' : ''}`}
              >
                {icon}{label}{value === 'favorites' ? ` (${favorites.length})` : ''}
              </button>
            ))}
          </>
        )}
        {selectedMode && selectedMode !== 'classic' && (
          <div className="text-center w-full">
            <Badge variant="accent" className="text-lg px-4 py-1 mb-2">
              {selectedMode === 'spicy' ? '18+ 辣味' : selectedMode}
            </Badge>
          </div>
        )}
        {/* G3-013: Add custom question button */}
        <button
          type="button"
          onClick={() => setShowAddQuestion(true)}
          className="px-3 py-1 rounded-lg text-xs font-medium transition-colors min-h-[48px] min-w-[48px] games-focus-ring flex items-center gap-1 bg-white/10 text-white/70 hover:bg-white/20"
          aria-label="新增自訂題目"
        >
          <Plus className="w-3 h-3" />自訂
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin mb-4" />
          <p className="text-white/50 text-sm">載入題目中...</p>
        </div>
      ) : (
        <>
          {/* G3D-NeverHaveIEver-05/06：分類區標籤/開關排版；匿名/進度區數字與標籤排版 */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 w-full max-w-lg justify-center">
            <p className="text-white/40 text-sm tabular-nums games-helper" aria-live="polite">{t('common.questionOrdinal', { n: displayProgress })}</p>
            <button
              type="button"
              onClick={() => setAnonymousMode((v) => !v)}
              className={`min-h-[48px] min-w-[48px] px-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors games-focus-ring ${anonymousMode ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              aria-pressed={anonymousMode}
              aria-label={anonymousMode ? '匿名模式已開' : '匿名模式已關'}
              title="匿名模式：不顯示誰做過"
            >
              <EyeOff className="w-3 h-3" />
              {anonymousMode ? '匿名' : '顯示'}
            </button>
            {/* G3-014: Auto-play toggle */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAutoPlay((v) => !v)}
                className={`min-h-[48px] min-w-[48px] px-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors games-focus-ring ${autoPlay ? 'bg-green-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                aria-pressed={autoPlay}
                aria-label={autoPlay ? '自動播放已開' : '自動播放已關'}
              >
                {autoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {autoPlay ? '暫停' : '自動'}
              </button>
              {autoPlay && (
                <select
                  value={autoPlayInterval}
                  onChange={(e) => setAutoPlayInterval(Number(e.target.value))}
                  className="bg-white/10 border border-white/20 rounded-lg text-xs text-white/80 px-1 py-0.5 min-h-[32px] games-focus-ring"
                  aria-label="自動播放間隔"
                >
                  {AUTO_PLAY_INTERVALS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          {/* G3-014: Auto-play countdown bar */}
          {autoPlay && current && (
            <div className="w-full max-w-md mb-2">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <m.div
                  className="h-full bg-green-400 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(autoPlayCountdown / autoPlayInterval) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-white/30 text-xs text-center mt-0.5 tabular-nums">{autoPlayCountdown}s</p>
            </div>
          )}
          {current && !anonymousMode && (
            <p className="text-white/50 text-sm mb-2">輪到 {players[currentPlayerIndex]} 回答</p>
          )}
          {current && anonymousMode && doneCountCurrentCard > 0 && (
            <p className="text-white/50 text-sm mb-2" role="status" aria-live="polite">本題 {doneCountCurrentCard} 人做過</p>
          )}
          {!current && !exhausted ? (
            <p className="text-white/50 mb-8 text-center max-w-sm px-2">點下方「再來一輪」開始</p>
          ) : exhausted ? (
            <p className="text-white/70 mb-6 text-center max-w-sm px-2" role="status">本局題目已全部出完，點下方「再來一輪」繼續</p>
          ) : (
            <div className="relative min-h-[16rem] h-64 sm:h-72 md:h-80 w-full max-w-md mb-6 md:mb-8">
              <AnimatePresence mode="wait">
                {/* G3D-NeverHaveIEver-01/03：題目卡 3D 浮起/邊框、題目區精緻排版 */}
                {/* P1-127：卡片從牌堆飛出 — 滑入 + 微縮放 */}
                <m.div
                  key={current.text + currentIndex}
                  initial={reducedMotion ? false : { x: direction * 200, y: 40, scale: 0.85, opacity: 0 }}
                  animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  exit={reducedMotion ? undefined : { x: -direction * 200, scale: 0.95, opacity: 0 }}
                  transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-secondary-900/40 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 flex items-center justify-center border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl"
                  data-testid="never-have-i-ever-card"
                >
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center leading-relaxed px-2 games-question" role="status" aria-live="polite">
                    我從來沒有...
                    <br />
                    <span className="text-primary-300">{current.text}</span>
                  </h2>
                  {/* G3-011: Favorite button + Copy button */}
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button
                      type="button"
                      onClick={toggleFavorite}
                      className={`p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center games-focus-ring shrink-0 ${isFavorited ? 'bg-pink-500/30 text-pink-400' : 'bg-white/10 hover:bg-white/20 text-white/80'}`}
                      aria-label={isFavorited ? '取消收藏' : '加入收藏'}
                      aria-pressed={isFavorited}
                    >
                      <Heart className={`w-5 h-5 shrink-0 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={copyCurrentStatement}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center games-focus-ring shrink-0"
                      aria-label="複製題目"
                    >
                      <Copy className="w-5 h-5 shrink-0" />
                    </button>
                  </div>
                </m.div>
              </AnimatePresence>
            </div>
          )}

          {/* R2-132：揭曉區 — 顯示「也做過」的玩家頭像與下一題按鈕 */}
          {current && showDidItReveal && (
            <m.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 mb-6 w-full max-w-md"
              role="region"
              aria-label="本題做過的人"
            >
              <p className="text-white/70 text-sm">
                {didItPlayerIndicesForCard.length > 0 ? '做過的人：' : '本題沒有人做過'}
              </p>
              {didItPlayerIndicesForCard.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {didItPlayerIndicesForCard.map((idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/10 border border-white/20"
                      title={players[idx]}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-500/30 border-2 border-primary-400 flex items-center justify-center text-white font-bold text-sm">
                        {(players[idx] ?? '').slice(0, 1).toUpperCase() || '?'}
                      </div>
                      <span className="text-white/80 text-xs truncate max-w-[4rem]">{players[idx]}</span>
                    </div>
                  ))}
                </div>
              )}
              <m.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={goNextCard}
                className="min-h-[48px] min-w-[48px] px-6 py-2.5 rounded-xl bg-primary-500 text-white font-medium games-focus-ring"
                aria-label="下一題"
              >
                下一題
              </m.button>
            </m.div>
          )}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
            {/* G3D-NeverHaveIEver-02：沒做過/做過按鈕；R2-132 揭曉後隱藏 */}
            {current && !showDidItReveal && (
              <>
                <m.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNoIDidNot()}
                  className="min-h-[48px] min-w-[48px] w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center hover:bg-red-500/40 hover:shadow-[0_4px_16px_rgba(220,38,38,0.3)] transition-colors transition-shadow games-focus-ring"
                  aria-label="沒做過"
                >
                  <ThumbsDown className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
                </m.button>

                <m.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleIDidIt()}
                  className="relative min-h-[48px] min-w-[48px] w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center hover:bg-green-500/40 hover:shadow-[0_4px_16px_rgba(34,197,94,0.3)] transition-colors transition-shadow overflow-visible games-focus-ring"
                  aria-label="做過"
                >
                  {/* Phase 1 C4.3: 舉手動畫增強 */}
                  <AnimatePresence>
                    {handRaise && (
                      <>
                        {/* 舉手手勢 */}
                        {/* P1-148：手指彎曲動畫 — 舉手後微彎曲，模擬真實遊戲場景 */}
                        <m.div
                          key="hand"
                          initial={reducedMotion ? false : { y: 20, scale: 0.3, opacity: 0, rotate: -30 }}
                          animate={{
                            y: [-20, -40, -35, -38],
                            scale: [0.3, 1.4, 1.2, 1.15],
                            opacity: 1,
                            rotate: [-30, 0, -5, 8]
                          }}
                          exit={reducedMotion ? undefined : { y: -60, opacity: 0, scale: 0.8 }}
                          transition={reducedMotion ? { duration: 0 } : {
                            duration: 0.6,
                            times: [0, 0.5, 0.75, 1],
                            ease: [0.68, -0.55, 0.265, 1.55]
                          }}
                          className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10"
                        >
                          <Hand className="w-14 h-14 text-green-400 fill-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                        </m.div>
                        {/* 光暈效果 */}
                        <m.div
                          key="glow"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: [0, 2, 3],
                            opacity: [0.6, 0.3, 0]
                          }}
                          transition={{ duration: 0.6 }}
                          className="absolute inset-0 rounded-full bg-green-400 blur-xl pointer-events-none"
                        />
                      </>
                    )}
                  </AnimatePresence>
                  <ThumbsUp className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
                  {/* G3-012: Floating emoji particles */}
                  <AnimatePresence>
                    {particles.map((p) => (
                      <m.span
                        key={p.id}
                        initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                        animate={{ opacity: 0, x: p.x, y: p.y, scale: 1.2, rotate: Math.random() * 360 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="absolute text-2xl pointer-events-none"
                        aria-hidden="true"
                      >
                        {p.emoji}
                      </m.span>
                    ))}
                  </AnimatePresence>
                </m.button>
              </>
            )}
          </div>
          {/* G3-015: Dynamic Scoreboard with bar chart visualization */}
          {!anonymousMode && leaderboard.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 w-full max-w-sm max-h-48 overflow-y-auto shadow-[0_4px_16px_rgba(0,0,0,0.15)]" role="region" aria-label="做過次數排行榜" aria-live="polite">
              <p className="text-white/60 text-xs mb-3 flex items-center gap-1 sticky top-0 bg-black/20 -m-1 p-1 rounded z-10">
                <Trophy className="w-3 h-3 shrink-0" /> 做過次數排行
              </p>
              <ul className="space-y-2 text-sm">
                {leaderboard.map((entry, i) => {
                  const maxCount = leaderboard[0]?.count || 1
                  const percent = Math.max(8, (entry.count / maxCount) * 100)
                  return (
                    <li key={entry.index} className="relative">
                      <div className="flex items-center justify-between text-white/80 py-1.5 px-2 rounded-lg relative z-10">
                        <span className="flex items-center gap-1.5">
                          {i === 0 && entry.count > 0 ? (
                            <span className="text-lg" aria-hidden="true">👑</span>
                          ) : (
                            <span className="text-white/30 font-mono text-xs w-5 text-center">{i + 1}</span>
                          )}
                          <span className={i === 0 ? 'text-amber-300 font-bold' : ''}>{entry.name}</span>
                        </span>
                        <span className="text-white/60 font-mono tabular-nums">{entry.count}</span>
                      </div>
                      {/* G3-015: Animated bar */}
                      <m.div
                        className={`absolute inset-y-0 left-0 rounded-lg ${i === 0 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-white/5 border border-white/5'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                      />
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          {/* G3D-NeverHaveIEver-09/10：空題庫/exhausted CTA 精緻化；再來一輪按鈕 3D 風格 */}
          {(exhausted || (!current && pool.length === 0)) && (
            <button type="button" onClick={startNewRound} disabled={isNewRoundPending} className="mt-4 btn-primary min-h-[48px] min-w-[48px] px-6 py-3 disabled:opacity-60 disabled:cursor-not-allowed games-focus-ring hover:scale-[1.02] active:scale-[0.98] transition-transform" data-testid="never-have-i-ever-new-round" aria-label="再來一輪">再來一輪</button>
          )}
          {/* G3D-NeverHaveIEver-11：複製 toast 位置與樣式精緻化 */}
          {copyToast && (
            <p className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl bg-green-500/90 text-white text-sm z-50 max-w-[calc(100vw-2rem)] safe-area-px shadow-lg border border-green-400/30" role="status" aria-live="polite">
              已複製到剪貼簿
            </p>
          )}

          <p className="text-white/40 mt-8 text-center text-sm">
            做過就喝一口，沒做過就安全過關！
          </p>

          {/* G3-013: Add custom question modal */}
          <AnimatePresence>
            {showAddQuestion && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 safe-area-px"
                onClick={() => setShowAddQuestion(false)}
              >
                <m.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="glass-card p-6 rounded-2xl w-full max-w-md mx-4"
                >
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary-400" />
                    新增自訂題目
                  </h3>
                  <p className="text-white/60 text-sm mb-3">輸入「我從來沒有…」後面的內容：</p>
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addCustomQuestion() }}
                    placeholder="例如：在公共場合唱歌"
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-primary-500 focus:outline-none mb-4"
                    autoFocus
                  />
                  {customQuestions.length > 0 && (
                    <div className="mb-4 max-h-32 overflow-y-auto space-y-1">
                      <p className="text-white/40 text-xs mb-1">已新增 ({customQuestions.length})：</p>
                      {customQuestions.map((q, i) => (
                        <div key={i} className="flex items-center justify-between text-sm text-white/70 bg-white/5 rounded-lg px-3 py-1.5">
                          <span className="truncate">{q}</span>
                          <button
                            type="button"
                            onClick={() => setCustomQuestions((prev) => prev.filter((_, idx) => idx !== i))}
                            className="text-red-400 hover:text-red-300 text-xs ml-2 shrink-0"
                            aria-label={`刪除「${q}」`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={addCustomQuestion}
                      className="btn-primary flex-1 min-h-[48px] games-focus-ring"
                    >
                      新增
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddQuestion(false)}
                      className="btn-secondary min-h-[48px] games-focus-ring"
                    >
                      關閉
                    </button>
                  </div>
                </m.div>
              </m.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
