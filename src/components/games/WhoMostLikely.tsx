'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Users, ChevronRight, RotateCcw, Share2, Copy, Smile, Laugh, Heart, Zap, Plus, Loader2, AlertTriangle, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useTranslation } from '@/contexts/I18nContext'
import { useGameReduceMotion } from './GameWrapper'
import { useGamePersistence } from '@/hooks/useGamePersistence'
import { useSubscription } from '@/hooks/useSubscription'
import { FREE_CUSTOM_QUESTIONS_LIMIT } from '@/lib/constants'
import { useGameStore } from '@/store/useGameStore'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'
import {
  getQuestionsByCategory,
  type WhoMostLikelyCategory,
  type WhoMostLikelyQuestion,
} from '@/lib/who-most-likely'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

/** 233 難度分級 */
const LEVEL_OPTIONS = [
  { value: 'all' as const, label: '全部' },
  { value: 'mild' as const, label: '溫和' },
  { value: 'normal' as const, label: '普通' },
  { value: 'bold' as const, label: '大膽' },
]

/** 234 表情符號反應 */
const EMOJI_REACTIONS = [
  { icon: Smile, label: '微笑' },
  { icon: Laugh, label: '大笑' },
  { icon: Heart, label: '愛心' },
  { icon: Zap, label: '勁爆' },
]

const CATEGORY_OPTIONS: { value: WhoMostLikelyCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'love', label: '愛情' },
  { value: 'friendship', label: '友情' },
  { value: 'work', label: '工作' },
  { value: 'life', label: '生活' },
  { value: 'funny', label: '搞笑' },
  { value: 'adult', label: '18+ 辣味' },
]

/** 226–235：誰最可能遊戲：規則、題庫、指向、統計、229 分享、230 匿名、233 難度、234 表情 */
export default function WhoMostLikely() {
  const { t } = useTranslation()
  const { tier } = useSubscription()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  // Import useGameStore
  const { selectedMode } = useGameStore()
  const [categoryFilter, setCategoryFilter] = useState<WhoMostLikelyCategory | 'all'>('all')

  // Phase 2: React to selectedMode
  useEffect(() => {
    if (selectedMode === 'spicy') {
      setCategoryFilter('adult')
    } else if (selectedMode === 'classic') {
      setCategoryFilter('all')
    }
  }, [selectedMode])
  const [levelFilter, setLevelFilter] = useState<'all' | 'mild' | 'normal' | 'bold'>('all')
  const [anonymousMode, setAnonymousMode] = useState(false)
  const [lastReaction, setLastReaction] = useState<string | null>(null)
  const [pool, setPool] = useState<WhoMostLikelyQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [pointedIndex, setPointedIndex] = useState<number | null>(null)
  const [pointCountByPlayer, setPointCountByPlayer] = useState<Record<number, number>>({})
  const [isStartPending, setIsStartPending] = useState(false)
  const [isNextPending, setIsNextPending] = useState(false)
  const startCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nextCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // G3-043: Smart shuffle - track used question IDs
  const [usedQuestionIds, setUsedQuestionIds] = useGamePersistence<number[]>('wml_used', [])
  // G3-044: Custom questions
  const [customQuestions, setCustomQuestions] = useGamePersistence<string[]>('wml_custom', [])
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState('')
  // G3-042: Spotlight
  const [showSpotlight, setShowSpotlight] = useState(false)
  /** R2-175：匿名模式時不顯示被指的人，直到點擊揭曉 */
  const [pointRevealed, setPointRevealed] = useState(false)

  // 18+ Warning state
  const [showWarning, setShowWarning] = useState(true)

  useEffect(() => {
    return () => {
      if (startCooldownRef.current) clearTimeout(startCooldownRef.current)
      if (nextCooldownRef.current) clearTimeout(nextCooldownRef.current)
    }
  }, [])

  /* Refactor: Async data loading */
  const [questionsByCategory, setQuestionsByCategory] = useState<WhoMostLikelyQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const data = await getQuestionsByCategory(categoryFilter)
        setQuestionsByCategory(data)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [categoryFilter])
  const questions = useMemo(() => {
    if (levelFilter === 'all') return questionsByCategory
    return questionsByCategory.filter((q) => (q as { level?: string }).level === levelFilter)
  }, [questionsByCategory, levelFilter])
  const currentQuestion = pool[currentIndex] ?? null

  /** 開始一輪：打亂題目；防連點 400ms */
  const startRound = useCallback(() => {
    if (isStartPending) return
    setIsStartPending(true)
    if (startCooldownRef.current) clearTimeout(startCooldownRef.current)
    startCooldownRef.current = setTimeout(() => {
      startCooldownRef.current = null
      setIsStartPending(false)
    }, 400)
    // G3-043: Smart shuffle - prioritize unseen questions
    const allItems = [...questions]
    // G3-044: Merge custom questions
    const customItems: WhoMostLikelyQuestion[] = customQuestions.map((text, i) => ({ id: 90000 + i, text, category: 'life' as WhoMostLikelyCategory, level: 'normal' }))
    allItems.push(...customItems)
    // Prioritize questions not seen in this session
    const unseen = allItems.filter((q) => !usedQuestionIds.includes(q.id))
    const source = unseen.length > 0 ? unseen : allItems
    const shuffled = [...source].sort(() => Math.random() - 0.5)
    setPool(shuffled.length > 0 ? shuffled : allItems)
    setCurrentIndex(0)
    setPointedIndex(null)
    setShowSpotlight(false)
  }, [questions, isStartPending, customQuestions, usedQuestionIds])

  /** 指向某位玩家 */
  const handlePoint = useCallback((playerIndex: number) => {
    play('click')
    setPointedIndex(playerIndex)
    setPointRevealed(false)
    setPointCountByPlayer((prev) => ({
      ...prev,
      [playerIndex]: (prev[playerIndex] ?? 0) + 1,
    }))
    setShowSpotlight(true)
    // G3-043: Track used question
    if (currentQuestion) {
      setUsedQuestionIds((prev) => {
        if (prev.includes(currentQuestion.id)) return prev
        return [...prev, currentQuestion.id].slice(-50) // Keep last 50
      })
    }
  }, [play, currentQuestion, setUsedQuestionIds])

  const handleNext = useCallback(() => {
    if (isNextPending) return
    setIsNextPending(true)
    if (nextCooldownRef.current) clearTimeout(nextCooldownRef.current)
    nextCooldownRef.current = setTimeout(() => {
      nextCooldownRef.current = null
      setIsNextPending(false)
    }, 400)
    setPointedIndex(null)
    setPointRevealed(false)
    setLastReaction(null)
    setShowSpotlight(false)
    if (currentIndex + 1 < pool.length) {
      setCurrentIndex((i) => i + 1)
    } else {
      const allItems = [...questions]
      const customItems: WhoMostLikelyQuestion[] = customQuestions.map((text, i) => ({ id: 90000 + i, text, category: 'life' as WhoMostLikelyCategory, level: 'normal' }))
      allItems.push(...customItems)
      const shuffled = [...allItems].sort(() => Math.random() - 0.5)
      setPool(shuffled.length > 0 ? shuffled : allItems)
      setCurrentIndex(0)
      setPointedIndex(null)
    }
  }, [currentIndex, pool.length, questions, isNextPending, customQuestions])

  // G3-044: Add custom question
  const addCustomQuestion = useCallback(() => {
    const trimmed = newQuestionText.trim()
    if (!trimmed || trimmed.length < 4) {
      toast.error('題目至少需要 4 個字')
      return
    }
    /** R2-195：免費方案自訂題目數量上限 */
    if (tier === 'free' && customQuestions.length >= FREE_CUSTOM_QUESTIONS_LIMIT) {
      toast.error(`免費方案最多 ${FREE_CUSTOM_QUESTIONS_LIMIT} 題自訂題目，升級 Pro 解鎖更多`)
      return
    }
    setCustomQuestions((prev) => [...prev, trimmed])
    setNewQuestionText('')
    setShowAddQuestion(false)
    toast.success('已新增自訂題目')
  }, [newQuestionText, setCustomQuestions, customQuestions.length, tier])

  const handleCategoryChange = useCallback((value: WhoMostLikelyCategory | 'all') => {
    setCategoryFilter(value)
    setPool([])
    setCurrentIndex(0)
    setPointedIndex(null)
  }, [])

  const handleLevelChange = useCallback((value: 'all' | 'mild' | 'normal' | 'bold') => {
    setLevelFilter(value)
    setPool([])
    setCurrentIndex(0)
    setPointedIndex(null)
  }, [])

  const getShareText = useCallback(() => {
    if (pointedIndex === null || !currentQuestion) return ''
    const who = anonymousMode ? '某人' : players[pointedIndex]
    return `誰最可能：${currentQuestion.text}\n→ ${who} 被指最多！`
  }, [currentQuestion, pointedIndex, players, anonymousMode])

  const hasQuestions = questions.length > 0
  if (!hasQuestions) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-4 md:py-6 px-4">
        <GameRules rules="誰最可能：出題後大家同時指向認為最符合的那個人，被指最多或一致通過的人可以選擇喝一口或解釋。" rulesKey="who-most-likely.rules" />
        <p className="text-white/60 text-sm sm:text-base mt-4 max-w-sm text-center px-2" role="status">目前沒有符合條件的題目，請試試其他分類或難度。</p>
      </div>
    )
  }

  // Move useState to top


  const poolInitialized = pool.length > 0
  if (!poolInitialized) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-4 md:py-6 px-4">
        <GameRules rules="誰最可能：出題後大家同時指向認為最符合的那個人，被指最多或一致通過的人可以選擇喝一口或解釋。" rulesKey="who-most-likely.rules" />
        <div className="mt-4 w-full max-w-md space-y-4">
          <p className="text-white/60 text-sm">選擇分類</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map(({ value, label }) => {
              const locked = value === 'adult' && tier === 'free'
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    if (locked) {
                      toast('升級 Pro 解鎖 18+ 題目 🔥', { icon: '👑' })
                      return
                    }
                    handleCategoryChange(value)
                  }}
                  className={`min-h-[48px] px-4 py-2 rounded-xl text-sm font-medium ${locked ? 'bg-white/5 text-white/30 cursor-not-allowed' : categoryFilter === value ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {label}
                    {locked && <Lock className="w-3 h-3" aria-hidden />}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-white/60 text-sm">難度</p>
          <div className="flex flex-wrap gap-2">
            {LEVEL_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleLevelChange(value)}
                aria-pressed={levelFilter === value}
                aria-label={`難度 ${label}`}
                className={`min-h-[48px] min-w-[48px] px-3 py-2 rounded-xl text-sm ${levelFilter === value ? 'bg-secondary-500/40 text-white' : 'bg-white/10 text-white/70'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAnonymousMode((a) => !a)}
            className={`min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl text-sm w-full ${anonymousMode ? 'bg-accent-500/40 text-white' : 'bg-white/10 text-white/70'}`}
          >
            {anonymousMode ? '匿名模式：開' : '匿名模式：關'}
          </button>
          <button type="button" onClick={startRound} disabled={isStartPending} className="btn-primary w-full py-4 min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed games-focus-ring" data-testid="who-most-likely-start" aria-label="開始遊戲">
            <Users className="w-5 h-5" />
            開始遊戲
          </button>
        </div>
      </div>
    )
  }



  // 18+ Warning for spicy mode or adult category
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
            被最多人指的人要喝酒！
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
    <div className="h-full flex flex-col items-center py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="誰最可能">
      <GameRules rules="誰最可能：出題後大家同時指向認為最符合的那個人，被指最多或一致通過的人可以選擇喝一口或解釋。" rulesKey="who-most-likely.rules" />
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin mb-4" />
          <p className="text-white/50 text-sm">載入題目中...</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 w-full max-w-lg justify-center" role="group" aria-label="題目分類">
            {(!selectedMode || selectedMode === 'classic') &&
              CATEGORY_OPTIONS.map(({ value, label }) => {
                const locked = value === 'adult' && tier === 'free'
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      if (locked) {
                        toast('升級 Pro 解鎖 18+ 題目 🔥', { icon: '👑' })
                        return
                      }
                      handleCategoryChange(value)
                    }}
                    aria-pressed={categoryFilter === value}
                    aria-label={locked ? `${label}（需升級 Pro）` : label}
                    className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-xs font-medium games-focus-ring ${locked ? 'bg-white/5 text-white/30 cursor-not-allowed' : categoryFilter === value ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      {locked && <Lock className="w-3 h-3" aria-hidden />}
                    </span>
                  </button>
                )
              })
            }
            {selectedMode && selectedMode !== 'classic' && (
              <div className="text-center w-full">
                <Badge variant="accent" className="text-lg px-4 py-1 mb-2">
                  {selectedMode === 'spicy' ? '18+ 辣味' : selectedMode}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 items-center w-full max-w-lg justify-center">
            {LEVEL_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleLevelChange(value)}
                aria-pressed={levelFilter === value}
                aria-label={`難度 ${label}`}
                className={`min-h-[48px] min-w-[48px] px-2.5 py-1 rounded-lg text-xs games-focus-ring ${levelFilter === value ? 'bg-secondary-500/40 text-white' : 'bg-white/5 text-white/50'}`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAnonymousMode((a) => !a)}
              className={`min-h-[48px] min-w-[48px] px-2.5 py-1 rounded-lg text-xs games-focus-ring ${anonymousMode ? 'bg-accent-500/40 text-white' : 'bg-white/5 text-white/50'}`}
              aria-pressed={anonymousMode}
              aria-label={anonymousMode ? '匿名模式開' : '匿名模式關'}
            >
              匿名
            </button>
          </div>

          <AnimatePresence mode="wait">
            {currentQuestion && (
              <m.div
                key={`${currentQuestion.id}-${currentIndex}`}
                initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
                transition={reducedMotion ? { duration: 0 } : undefined}
                className="w-full max-w-lg text-center p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              >
                {/* G3D-WhoMostLikely-01/03：題目卡 3D 浮起/陰影、題目區字級/行高/留白 */}
                <p className="text-white/50 text-sm mb-2 tabular-nums">
                  {t('common.questionProgress', { current: currentIndex + 1, total: pool.length })}
                </p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 px-2 sm:px-4 leading-relaxed games-question">
                  {currentQuestion.text}
                </h2>

                {pointedIndex === null ? (
                  <>
                    <p className="text-white/60 text-sm mb-4">大家同時指向一個人</p>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                      {players.map((name, i) => (
                        <m.button
                          key={i}
                          type="button"
                          onClick={() => handlePoint(i)}
                          className="min-h-[48px] min-w-[48px] px-4 sm:px-6 py-3 rounded-xl bg-white/10 hover:bg-primary-500/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] text-white font-medium border border-white/20 text-base md:text-lg games-focus-ring transition-shadow"
                          // G3-041: Voting avatar animation
                          whileHover={{ scale: 1.05, y: -4 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="truncate max-w-[8rem] sm:max-w-none">{name}</span>
                        </m.button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {/* G3-042: Spotlight overlay */}
                    {showSpotlight && (
                      <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/60 z-30 pointer-events-none"
                        exit={{ opacity: 0 }}
                      />
                    )}
                    <m.div
                      initial={reducedMotion ? false : { scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 24 }}
                      className={`mb-6 p-4 md:p-6 rounded-2xl bg-primary-500/20 border border-primary-500/30 w-full max-w-md shadow-[0_8px_24px_rgba(0,0,0,0.2)] ${showSpotlight ? 'relative z-40' : ''}`}
                      data-testid="who-most-likely-result"
                      role="status"
                      aria-live="polite"
                    >
                      <p className="text-white/60 text-sm mb-1">大家指向</p>
                      {/* R2-175: 匿名模式揭曉前不顯示被指的人 */}
                      {(anonymousMode && !pointRevealed) ? (
                        <>
                          <m.p
                            className="text-xl md:text-2xl font-bold text-primary-300 tabular-nums games-result-text"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                          >
                            ??? 被指到
                          </m.p>
                          <button
                            type="button"
                            onClick={() => setPointRevealed(true)}
                            className="mt-3 min-h-[48px] px-6 py-2 rounded-xl bg-primary-500 text-white font-medium games-focus-ring"
                          >
                            揭曉
                          </button>
                        </>
                      ) : (
                        <m.p
                          className="text-xl md:text-2xl font-bold text-primary-300 tabular-nums games-result-text"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                        >
                          {players[pointedIndex]}
                        </m.p>
                      )}
                    </m.div>
                  </>
                )}

                {pointedIndex !== null && (
                  <>
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-3">
                      <CopyResultButton text={getShareText()} label="複製結果" className="games-focus-ring" />
                      <button
                        type="button"
                        onClick={() => {
                          const p = navigator.share?.({ title: '誰最可能', text: getShareText() })
                          if (p) p.catch((err: unknown) => { logger.error('[WhoMostLikely] share failed', { err: err instanceof Error ? err.message : String(err) }) })
                        }}
                        className="min-h-[48px] px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white/90 text-sm font-medium inline-flex items-center gap-2 games-focus-ring"
                      >
                        <Share2 className="w-4 h-4 shrink-0" />
                        <span>分享</span>
                      </button>
                      {EMOJI_REACTIONS.map(({ icon: Icon, label: l }) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setLastReaction(l)}
                          className={`min-h-[48px] min-w-[48px] p-2 rounded-xl games-focus-ring ${lastReaction === l ? 'bg-primary-500/50' : 'bg-white/10'} hover:bg-white/20`}
                          title={l}
                          aria-label={l}
                        >
                          <Icon className="w-5 h-5 text-white shrink-0" />
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={isNextPending}
                      className="mt-4 min-h-[48px] px-6 sm:px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 hover:scale-[1.02] active:scale-[0.98] text-white font-bold inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-base md:text-lg games-focus-ring transition-transform"
                      data-testid="who-most-likely-next"
                      aria-label="下一題"
                    >
                      下一題
                      <ChevronRight className="w-5 h-5 shrink-0" />
                    </button>
                  </>
                )}
              </m.div>
            )}
          </AnimatePresence>

          {/* G3D-WhoMostLikely-07：本輪被指次數區數字/名字排版 */}
          {Object.keys(pointCountByPlayer).length > 0 && (
            <div className="mt-6 w-full max-w-md p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <p className="text-white/50 text-xs sm:text-sm mb-2">本輪被指次數</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {players.map((name, i) => {
                  const count = pointCountByPlayer[i] ?? 0
                  if (count === 0) return null
                  return (
                    <span key={i} className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 text-white/80 text-xs sm:text-sm tabular-nums border border-white/5">
                      <span className="truncate max-w-[6rem] sm:max-w-none inline-block align-middle">{name}</span> {count} 次
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* G3D-WhoMostLikely-14：下一題/洗牌按鈕 3D hover */}
          <button
            type="button"
            onClick={startRound}
            disabled={isStartPending}
            className="mt-4 min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 text-white/60 text-sm inline-flex items-center gap-2 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed games-focus-ring transition-transform"
            aria-label="重新洗牌"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>重新洗牌</span>
          </button>
          {/* G3-044: Add custom question button */}
          <button
            type="button"
            onClick={() => setShowAddQuestion(true)}
            className="mt-2 min-h-[48px] px-4 py-2 rounded-xl bg-white/10 text-white/60 text-sm inline-flex items-center gap-2 hover:bg-white/20 games-focus-ring"
          >
            <Plus className="w-4 h-4" />
            新增自訂題目
          </button>
          {/* G3-044: Custom question modal */}
          <AnimatePresence>
            {showAddQuestion && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                onClick={() => setShowAddQuestion(false)}
              >
                <m.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="glass-card p-6 rounded-2xl w-full max-w-md"
                >
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary-400" />
                    新增自訂題目
                  </h3>
                  <p className="text-white/60 text-sm mb-3">輸入「誰最可能…」後面的內容：</p>
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addCustomQuestion() }}
                    placeholder="例如：喝醉後打電話給前任"
                    className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-primary-500 focus:outline-none mb-4"
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button type="button" onClick={addCustomQuestion} className="btn-primary flex-1 min-h-[48px]">新增</button>
                    <button type="button" onClick={() => setShowAddQuestion(false)} className="btn-secondary min-h-[48px]">關閉</button>
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
