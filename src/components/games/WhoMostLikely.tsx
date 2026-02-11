'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, ChevronRight, RotateCcw, Share2, Copy, Smile, Laugh, Heart, Zap } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
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
]

/** 226–235：誰最可能遊戲：規則、題庫、指向、統計、229 分享、230 匿名、233 難度、234 表情 */
export default function WhoMostLikely() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [categoryFilter, setCategoryFilter] = useState<WhoMostLikelyCategory | 'all'>('all')
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

  useEffect(() => {
    return () => {
      if (startCooldownRef.current) clearTimeout(startCooldownRef.current)
      if (nextCooldownRef.current) clearTimeout(nextCooldownRef.current)
    }
  }, [])

  const questionsByCategory = useMemo(() => getQuestionsByCategory(categoryFilter), [categoryFilter])
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
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    setPool(shuffled.length > 0 ? shuffled : questions)
    setCurrentIndex(0)
    setPointedIndex(null)
  }, [questions, isStartPending])

  /** 指向某位玩家 */
  const handlePoint = useCallback((playerIndex: number) => {
    play('click')
    setPointedIndex(playerIndex)
    setPointCountByPlayer((prev) => ({
      ...prev,
      [playerIndex]: (prev[playerIndex] ?? 0) + 1,
    }))
  }, [play])

  const handleNext = useCallback(() => {
    if (isNextPending) return
    setIsNextPending(true)
    if (nextCooldownRef.current) clearTimeout(nextCooldownRef.current)
    nextCooldownRef.current = setTimeout(() => {
      nextCooldownRef.current = null
      setIsNextPending(false)
    }, 400)
    setPointedIndex(null)
    setLastReaction(null)
    if (currentIndex + 1 < pool.length) {
      setCurrentIndex((i) => i + 1)
    } else {
      const shuffled = [...questions].sort(() => Math.random() - 0.5)
      setPool(shuffled.length > 0 ? shuffled : questions)
      setCurrentIndex(0)
      setPointedIndex(null)
    }
  }, [currentIndex, pool.length, questions, isNextPending])

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

  const poolInitialized = pool.length > 0
  if (!poolInitialized) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-4 md:py-6 px-4">
        <GameRules rules="誰最可能：出題後大家同時指向認為最符合的那個人，被指最多或一致通過的人可以選擇喝一口或解釋。" rulesKey="who-most-likely.rules" />
        <div className="mt-4 w-full max-w-md space-y-4">
          <p className="text-white/60 text-sm">選擇分類</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleCategoryChange(value)}
                className={`min-h-[48px] px-4 py-2 rounded-xl text-sm font-medium ${
                  categoryFilter === value ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {label}
              </button>
            ))}
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

  return (
    <div className="h-full flex flex-col items-center py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="誰最可能">
      <GameRules rules="誰最可能：出題後大家同時指向認為最符合的那個人，被指最多或一致通過的人可以選擇喝一口或解釋。" rulesKey="who-most-likely.rules" />
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 w-full max-w-lg justify-center" role="group" aria-label="題目分類">
        {CATEGORY_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleCategoryChange(value)}
            aria-pressed={categoryFilter === value}
            aria-label={label}
            className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-lg text-xs font-medium games-focus-ring ${
              categoryFilter === value ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {label}
          </button>
        ))}
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
          <motion.div
            key={`${currentQuestion.id}-${currentIndex}`}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={reducedMotion ? { duration: 0 } : undefined}
            className="w-full max-w-lg text-center p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          >
            {/* G3D-WhoMostLikely-01/03：題目卡 3D 浮起/陰影、題目區字級/行高/留白 */}
            <p className="text-white/50 text-sm mb-2 tabular-nums">
              第 {currentIndex + 1} / {pool.length} 題
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 px-2 sm:px-4 leading-relaxed games-question">
              {currentQuestion.text}
            </h2>

            {pointedIndex === null ? (
              <>
                <p className="text-white/60 text-sm mb-4">大家同時指向一個人</p>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {players.map((name, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => handlePoint(i)}
                      className="min-h-[48px] min-w-[48px] px-4 sm:px-6 py-3 rounded-xl bg-white/10 hover:bg-primary-500/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] text-white font-medium border border-white/20 text-base md:text-lg games-focus-ring transition-shadow"
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="truncate max-w-[8rem] sm:max-w-none">{name}</span>
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              <motion.div
                initial={reducedMotion ? false : { scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 24 }}
                className="mb-6 p-4 md:p-6 rounded-2xl bg-primary-500/20 border border-primary-500/30 w-full max-w-md shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
                data-testid="who-most-likely-result"
                role="status"
                aria-live="polite"
              >
                {/* G3D-WhoMostLikely-04：結果區「被指最多」3D 強調動畫 */}
                <p className="text-white/60 text-sm mb-1">大家指向</p>
                <p className="text-xl md:text-2xl font-bold text-primary-300 tabular-nums games-result-text">{anonymousMode ? '有人被指最多' : players[pointedIndex]}</p>
              </motion.div>
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
          </motion.div>
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
    </div>
  )
}
