'use client'

import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { m, AnimatePresence } from 'framer-motion'
import { scaleIn, slideUp, staggerContainer, buttonHover, buttonTap } from '@/lib/animations'
import { Heart, Flame, SkipForward, RotateCcw, Star, Plus, Trash2, Loader2, Crown, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { getTruthPool, getDarePool, fetchExternalTruthDare, type TruthDareItem, type TruthDareLevel } from '@/lib/truth-or-dare'
import { usePunishment } from './Punishments/PunishmentContext'
import { LIGHT_PUNISHMENTS } from './Punishments/presets'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { logger } from '@/lib/logger'
import { useGameReduceMotion } from './GameWrapper'
import { useGameStore } from '@/store/useGameStore'
import { useTranslation } from '@/contexts/I18nContext'
import { useSubscription } from '@/hooks/useSubscription'
import { FREE_CUSTOM_QUESTIONS_LIMIT } from '@/lib/constants'
import { fireFullscreenConfetti } from '@/lib/celebration'
import { Badge } from '@/components/ui/Badge'

const STORAGE_KEY = 'cheersin_truth_dare_custom'
const TIMER_SECONDS = 30
const DRINK_ONE = LIGHT_PUNISHMENTS[0]
/** R2-131: 每局跳過點數，消耗 1 點可跳過不喝酒；用完則跳過需喝一口 */
const SKIP_POINTS_PER_GAME = 3

/** 從 localStorage 讀取自訂題目 */
function loadCustomPools(): { truth: TruthDareItem[]; dare: TruthDareItem[] } {
  if (typeof window === 'undefined') return { truth: [], dare: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw?.trim()) return { truth: [], dare: [] }
    const parsed = JSON.parse(raw) as { truth: TruthDareItem[]; dare: TruthDareItem[] }
    return {
      truth: Array.isArray(parsed.truth) ? parsed.truth : [],
      dare: Array.isArray(parsed.dare) ? parsed.dare : [],
    }
  } catch (err) {
    logger.error('[TruthOrDare] loadCustomPools parse failed', { err: err instanceof Error ? err.message : String(err) })
    return { truth: [], dare: [] }
  }
}

/** 本局不重複；可依難度與星等篩選 */
function pickFromPool(
  pool: TruthDareItem[],
  used: Set<string>,
  levelFilter: TruthDareLevel | 'all',
  maxStars: number
): TruthDareItem {
  const byLevel = levelFilter === 'all' ? pool : pool.filter((x) => x.level === levelFilter)
  const byStars = byLevel.filter((x) => (x.stars ?? 5) <= maxStars)
  const filtered = byStars.length > 0 ? byStars : byLevel
  const available = filtered.filter((x) => !used.has(x.text))
  const pickPool = available.length > 0 ? available : filtered.length > 0 ? filtered : pool
  return pickPool[Math.floor(Math.random() * pickPool.length)]
}

/** GAME-OPT-001：親友/辣味可選 — level filter 依 i18n 顯示 */
function getLevelFilterOptions(t: (k: string) => string): { value: TruthDareLevel | 'all'; label: string; isPremium?: boolean }[] {
  return [
    { value: 'all', label: t('truthOrDare.levelAll') },
    { value: 'mild', label: t('truthOrDare.levelMild') },
    { value: 'spicy', label: t('truthOrDare.levelSpicy'), isPremium: true },
    { value: 'adult', label: t('truthOrDare.levelAdult'), isPremium: true },
  ]
}

/** Phase 1 Tasks 8-9：免費用戶只能用 mild 等級 */
function isPremiumLevel(level: TruthDareLevel | 'all'): boolean {
  return level === 'spicy' || level === 'adult'
}

export default function TruthOrDare() {
  const { t } = useTranslation()
  const { tier } = useSubscription()
  const levelFilterOptions = useMemo(() => getLevelFilterOptions(t), [t])
  const questionRef = useRef<HTMLHeadingElement>(null)
  const { play } = useGameSound()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const punishment = usePunishment()
  const { setStats, selectedMode } = useGameStore()
  // const gameStats = { setStats } // REMOVED: Causes infinite loop due to unstable reference
  const players = useGamesPlayers()
  const reducedMotion = useGameReduceMotion()

  /* State Declarations */
  const [mode, setMode] = useState<'menu' | 'truth' | 'dare'>('menu')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

  // Pools & Tracking
  const [truthPool, setTruthPool] = useState<TruthDareItem[]>([])
  const [darePool, setDarePool] = useState<TruthDareItem[]>([])
  const [usedTruth, setUsedTruth] = useState<Set<string>>(new Set())
  const [usedDare, setUsedDare] = useState<Set<string>>(new Set())

  // Skip logic (R2-131: skip with points or drink)
  const [skipCount, setSkipCount] = useState(0)
  const [skipPoints, setSkipPoints] = useState(SKIP_POINTS_PER_GAME)
  const [isSkipPending, setIsSkipPending] = useState(false)

  // Custom Questions
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customTruth, setCustomTruth] = useState<TruthDareItem[]>([])
  const [customDare, setCustomDare] = useState<TruthDareItem[]>([])
  const [customInput, setCustomInput] = useState({ truth: '', dare: '' })

  // Filters
  const [levelFilter, setLevelFilter] = useState<TruthDareLevel | 'all'>('all')
  const [maxStars, setMaxStars] = useState(5)

  // Phase 2: React to selectedMode
  useEffect(() => {
    if (selectedMode === 'spicy') {
      setLevelFilter('adult')
    } else if (selectedMode === 'couples') {
      setLevelFilter('spicy')
    } else if (selectedMode === 'classic') {
      setLevelFilter('all')
    }
  }, [selectedMode])

  // Load Initial Data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const tPool = await getTruthPool()
        const dPool = await getDarePool()
        setTruthPool(tPool)
        setDarePool(dPool)

        // Load custom
        const saved = loadCustomPools()
        setCustomTruth(saved.truth)
        setCustomDare(saved.dare)

        // Optional: fetch external for both types
        Promise.all([
          fetchExternalTruthDare('truth'),
          fetchExternalTruthDare('dare')
        ]).then(([tExt, dExt]) => {
          if (tExt.length > 0) setTruthPool((prev) => [...prev, ...tExt])
          if (dExt.length > 0) setDarePool((prev) => [...prev, ...dExt])
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Save Custom Data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ truth: customTruth, dare: customDare }))
    }
  }, [customTruth, customDare])

  /** P1-139：懲罰歷史變動時同步趣味統計「本局懲罰王」至設定面板。僅依 primitive 依賴，且僅在值變更時 setStats 避免無限迴圈 */
  const lastFunFactsRef = useRef<string>('')
  useEffect(() => {
    if (!punishment) return
    const lb = punishment.getLeaderboard()
    const nextValue = lb.length > 0 && lb[0].count > 0
      ? `${lb[0].playerName}|${lb[0].count}`
      : ''
    if (lastFunFactsRef.current === nextValue) return
    lastFunFactsRef.current = nextValue
    if (nextValue) {
      const [playerName] = nextValue.split('|')
      setStats({ funFacts: [{ label: '本局懲罰王', value: playerName }] })
    } else {
      setStats({ funFacts: [] })
    }
  }, [punishment, setStats])

  /** 45 計時器：出題後 30 秒倒數；R2-135 最後 5 秒播時間壓力音效（countdown tick） */
  useEffect(() => {
    if (content && mode !== 'menu') {
      setSecondsLeft(TIMER_SECONDS)
      timerRef.current = setInterval(() => {
        let expired = false
        let newSec: number | null = null
        flushSync(() => {
          setSecondsLeft((s) => {
            if (s === null || s <= 1) {
              expired = true
              if (timerRef.current) clearInterval(timerRef.current)
              timerRef.current = null
              return null
            }
            newSec = s - 1
            return newSec
          })
        })
        if (newSec !== null && newSec <= 5 && newSec >= 1) play('countdown')
        if (expired) {
          play('wrong')
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200)
          toast('時間到！')
        }
      }, 1000)
    } else {
      setSecondsLeft(null)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [content, mode, play])

  /** 69 焦點回歸：出題後 focus 至題目標題 questionRef（useLayoutEffect 確保 DOM 已掛載） */
  useLayoutEffect(() => {
    if (content) questionRef.current?.focus()
  }, [content])

  useEffect(() => {
    return () => {
      if (skipCooldownRef.current) clearTimeout(skipCooldownRef.current)
    }
  }, [])

  /** Esc：自訂題目表單關閉；或出題後計時器跳過（61 計時器 Esc） */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (showCustomForm) {
        setShowCustomForm(false)
        return
      }
      if (content && mode !== 'menu' && secondsLeft !== null) {
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        setSecondsLeft(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showCustomForm, content, mode, secondsLeft])

  const pick = useCallback(
    (type: 'truth' | 'dare') => {
      play('click')
      setMode(type)
      const pool = type === 'truth' ? truthPool : darePool
      const used = type === 'truth' ? usedTruth : usedDare
      const setUsed = type === 'truth' ? setUsedTruth : setUsedDare
      const item = pickFromPool(pool, used, levelFilter, maxStars)
      setContent(item.text)
      setUsed((prev: Set<string>) => new Set(prev).add(item.text))
    },
    [truthPool, darePool, usedTruth, usedDare, levelFilter, maxStars, play]
  )

  const skipCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** R2-131：跳過可消耗 1 點數（不喝酒）或無點數時喝一口 */
  const skip = useCallback(() => {
    if (isSkipPending) return
    setIsSkipPending(true)
    if (skipCooldownRef.current) clearTimeout(skipCooldownRef.current)
    const usePoint = skipPoints > 0
    if (usePoint) {
      setSkipPoints((p) => p - 1)
      play('click')
    } else {
      play('wrong')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
      if (punishment && players.length > 0) {
        const playerIndex = skipCount % players.length
        punishment.recordPunishment(playerIndex, players[playerIndex], DRINK_ONE)
      } else {
        toast(t('truthOrDare.skipDrink'))
      }
    }
    const nextCount = skipCount + 1
    setSkipCount((c) => c + 1)
    setStats({ punishmentCount: nextCount })
    if (mode === 'truth') pick('truth')
    else if (mode === 'dare') pick('dare')
    skipCooldownRef.current = setTimeout(() => {
      skipCooldownRef.current = null
      setIsSkipPending(false)
    }, 400)
  }, [mode, pick, punishment, setStats, players, skipCount, skipPoints, play, isSkipPending, t])

  const backToMenu = useCallback(() => {
    if (!reducedMotion) fireFullscreenConfetti()
    setMode('menu')
    setContent('')
    setSkipCount(0)
    setSkipPoints(SKIP_POINTS_PER_GAME)
    setUsedTruth(new Set())
    setUsedDare(new Set())
    setSecondsLeft(null)
    setStats({ punishmentCount: 0, funFacts: [] })
  }, [setStats, reducedMotion])

  const addCustom = useCallback(
    (type: 'truth' | 'dare') => {
      const text = type === 'truth' ? customInput.truth.trim() : customInput.dare.trim()
      if (!text) {
        toast(type === 'truth' ? t('games.enterTruthTopic') : t('games.enterDareTopic'))
        return
      }
      /** R2-195：免費方案自訂題目數量上限（真心話+大冒險合計） */
      const totalCustom = customTruth.length + customDare.length
      if (tier === 'free' && totalCustom >= FREE_CUSTOM_QUESTIONS_LIMIT) {
        toast.error(`免費方案最多 ${FREE_CUSTOM_QUESTIONS_LIMIT} 題自訂題目，升級 Pro 解鎖更多`)
        return
      }
      const item: TruthDareItem = { text, level: 'mild', stars: 3 }
      if (type === 'truth') {
        setCustomTruth((prev) => [...prev, item])
        setCustomInput((prev) => ({ ...prev, truth: '' }))
      } else {
        setCustomDare((prev) => [...prev, item])
        setCustomInput((prev) => ({ ...prev, dare: '' }))
      }
    },
    [customInput, customTruth.length, customDare.length, tier, t]
  )

  const removeCustom = useCallback((type: 'truth' | 'dare', index: number) => {
    if (type === 'truth') setCustomTruth((prev) => prev.filter((_, i) => i !== index))
    else setCustomDare((prev) => prev.filter((_, i) => i !== index))
  }, [])

  return (
    <m.div
      className="h-full flex flex-col items-center justify-center py-4 md:py-6 px-4 safe-area-px"
      role="main"
      aria-label="真心話大冒險"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <GameRules rules={`選「真心話」回答問題，選「大冒險」完成指定動作。\n可選難度：輕鬆／刺激／限制級；本局不重複已出題。不做或拒答可跳過。`} rulesKey="truth-or-dare.rules" />
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin mb-4" />
          <p className="text-white/50 text-sm">載入題目中...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {mode === 'menu' ? (
            <m.div
              key="menu"
              variants={staggerContainer}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
              transition={reducedMotion ? { duration: 0 } : undefined}
              className="w-full max-w-2xl flex flex-col items-center gap-4 md:gap-6"
            >
              <div className="w-full" role="group" aria-label="題目難度">
                {(!selectedMode || selectedMode === 'classic') && (
                  <>
                    <p className="text-white/60 text-sm mb-2">難度分類</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {levelFilterOptions.map(({ value, label, isPremium: isLevelPremium }) => {
                        const locked = isLevelPremium && tier === 'free'
                        return (
                          <m.button
                            key={value}
                            type="button"
                            whileHover={locked ? undefined : buttonHover}
                            whileTap={locked ? undefined : buttonTap}
                            onClick={() => {
                              if (locked) {
                                toast('升級 Pro 解鎖辣味題目 🔥', { icon: '👑' })
                                return
                              }
                              setLevelFilter(value)
                            }}
                            aria-pressed={levelFilter === value}
                            aria-label={locked ? `${label}（需升級 Pro）` : label}
                            className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-xl text-sm font-medium transition-colors games-focus-ring ${locked ? 'bg-white/5 text-white/30 cursor-not-allowed' : levelFilter === value ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
                          >
                            <span className="inline-flex items-center gap-1">
                              {label}
                              {locked && <Lock className="w-3 h-3" aria-hidden />}
                            </span>
                          </m.button>)
                      })}
                    </div>
                    {tier === 'free' && (
                      <p className="text-white/40 text-xs mt-2 text-center">辣味 & 成人題目為 Pro 專屬 <a href="/pricing" className="text-primary-400 hover:underline">升級解鎖</a></p>
                    )}
                  </>
                )}
                {selectedMode && selectedMode !== 'classic' && (
                  <div className="text-center py-2">
                    <p className="text-white/60 text-sm mb-1">當前模式</p>
                    <Badge variant="accent" className="text-lg px-4 py-1">
                      {selectedMode === 'spicy' ? '18+ 辣味' : selectedMode === 'couples' ? '情侶模式' : selectedMode}
                    </Badge>
                    <p className="text-white/40 text-xs mt-2">
                      (已自動套用{selectedMode === 'spicy' ? '成人' : '勁爆'}難度)
                    </p>
                  </div>
                )}
              </div>
              <div className="w-full" role="group" aria-label="題目難度星等">
                <p className="text-white/60 text-sm mb-2">難度上限（1–5 星）</p>
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-white/50 text-sm" aria-hidden>1</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={maxStars}
                    onChange={(e) => setMaxStars(Number(e.target.value))}
                    className="flex-1 max-w-[200px] h-2 rounded-full appearance-none bg-white/20 accent-primary-500"
                    aria-label="難度星等"
                    aria-valuenow={maxStars}
                    aria-valuemin={1}
                    aria-valuemax={5}
                  />
                  <span className="text-white/50 text-sm">5</span>
                  <m.span className="flex items-center gap-0.5 text-primary-400 text-sm" aria-live="polite" key={maxStars} initial={reducedMotion ? false : { scale: 1.2 }} animate={{ scale: 1 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}>
                    {maxStars}
                    <Star className="w-4 h-4 fill-current" aria-hidden />
                  </m.span>
                </div>
              </div>
              <div className="w-full">
                <m.button
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  type="button"
                  onClick={() => setShowCustomForm((v) => !v)}
                  className="min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-xl text-sm font-medium bg-white/10 text-white/80 hover:bg-white/20 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  自訂題目
                </m.button>
                {showCustomForm && (
                  <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 space-y-2" role="region" aria-label="自訂題目">
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={customInput.truth}
                        onChange={(e) => setCustomInput((p) => ({ ...p, truth: e.target.value }))}
                        placeholder="新增真心話..."
                        className="flex-1 min-w-0 min-h-[48px] px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm games-focus-ring"
                        aria-label="真心話題目"
                      />
                      <m.button whileHover={buttonHover} whileTap={buttonTap} type="button" onClick={() => addCustom('truth')} className="min-h-[48px] min-w-[48px] px-3 rounded-lg bg-primary-500 text-white text-sm font-medium games-focus-ring" aria-label="新增真心話">新增</m.button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={customInput.dare}
                        onChange={(e) => setCustomInput((p) => ({ ...p, dare: e.target.value }))}
                        placeholder="新增大冒險..."
                        className="flex-1 min-w-0 min-h-[48px] px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm games-focus-ring"
                        aria-label="大冒險題目"
                      />
                      <m.button whileHover={buttonHover} whileTap={buttonTap} type="button" onClick={() => addCustom('dare')} className="min-h-[48px] min-w-[48px] px-3 rounded-lg bg-primary-500 text-white text-sm font-medium games-focus-ring" aria-label="新增大冒險">新增</m.button>
                    </div>
                    {(customTruth.length > 0 || customDare.length > 0) && (
                      <div className="text-white/50 text-xs space-y-1 max-h-24 overflow-y-auto">
                        {customTruth.map((t, i) => (
                          <div key={`t-${i}`} className="flex items-center gap-2">
                            <span className="truncate flex-1">真心話：{t.text}</span>
                            <button type="button" onClick={() => removeCustom('truth', i)} aria-label="刪除" className="min-h-[48px] min-w-[48px] p-2 flex items-center justify-center text-red-400"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                        {customDare.map((t, i) => (
                          <div key={`d-${i}`} className="flex items-center gap-2">
                            <span className="truncate flex-1">大冒險：{t.text}</span>
                            <button type="button" onClick={() => removeCustom('dare', i)} aria-label="刪除" className="min-h-[48px] min-w-[48px] p-2 flex items-center justify-center text-red-400"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* G3D-501/502：選項 3D 微互動；reduced-motion 時關閉 whileHover */}
              {/* Phase 1 C1.2: 增強按鈕 3D 傾斜效果 */}
              {/* Phase 1 C2.2: 遊戲選項按鈕動畫增強 - 光暈 + 彈跳 */}
              <div className="grid grid-cols-2 gap-8 w-full">
                <m.button
                  type="button"
                  onClick={() => pick('truth')}
                  whileHover={reducedMotion ? undefined : {
                    scale: 1.08,
                    rotateY: 8,
                    boxShadow: '0 20px 40px -10px rgba(236, 72, 153, 0.4), 0 0 60px -10px rgba(236, 72, 153, 0.3)'
                  }}
                  whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="aspect-square min-h-[48px] min-w-[48px] rounded-3xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 border border-pink-500/30 flex flex-col items-center justify-center gap-3 md:gap-4 hover:border-pink-500/80 transition-all group games-focus-ring"
                  aria-label="選擇真心話"
                  data-testid="truth-or-dare-pick-truth"
                >
                  <m.div
                    className="p-4 md:p-6 rounded-full bg-pink-500/20 group-hover:bg-pink-500/40 transition-colors"
                    whileHover={reducedMotion ? undefined : { scale: 1.1, rotate: 5 }}
                  >
                    <Heart className="w-12 h-12 md:w-16 md:h-16 text-pink-500" />
                  </m.div>
                  <span className="text-2xl md:text-3xl font-display font-bold text-white tracking-widest">真心話</span>
                  <span className="text-pink-300/50 text-xs md:text-sm uppercase tracking-widest">Truth</span>
                </m.button>

                <m.button
                  type="button"
                  onClick={() => pick('dare')}
                  whileHover={reducedMotion ? undefined : {
                    scale: 1.08,
                    rotateY: -8,
                    boxShadow: '0 20px 40px -10px rgba(249, 115, 22, 0.4), 0 0 60px -10px rgba(249, 115, 22, 0.3)'
                  }}
                  whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="aspect-square min-h-[48px] min-w-[48px] rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 flex flex-col items-center justify-center gap-3 md:gap-4 hover:border-orange-500/80 transition-all group games-focus-ring"
                  aria-label="選擇大冒險"
                  data-testid="truth-or-dare-pick-dare"
                >
                  <m.div
                    className="p-4 md:p-6 rounded-full bg-orange-500/20 group-hover:bg-orange-500/40 transition-colors"
                    whileHover={reducedMotion ? undefined : { scale: 1.1, rotate: -5 }}
                  >
                    <Flame className="w-12 h-12 md:w-16 md:h-16 text-orange-500" />
                  </m.div>
                  <span className="text-2xl md:text-3xl font-display font-bold text-white tracking-widest">大冒險</span>
                  <span className="text-orange-300/50 text-xs md:text-sm uppercase tracking-widest">Dare</span>
                </m.button>
              </div>
            </m.div>
          ) : (
            <m.div
              key="card"
              initial={reducedMotion ? false : { y: 80, scale: 0.5, rotateY: 90, opacity: 0 }}
              animate={{ y: 0, scale: 1, rotateY: 0, opacity: 1 }}
              exit={reducedMotion ? undefined : { y: 40, scale: 0.9, rotateY: -15, opacity: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
              style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
              className="text-center max-w-2xl relative touch-none"
              data-testid="truth-or-dare-result"
              drag="x"
              dragConstraints={{ left: -120, right: 120 }}
              dragElastic={0.2}
              onDragEnd={(_e, info) => {
                const { offset, velocity } = info
                if (offset.x > 80 || velocity.x > 400) pick('truth')
                else if (offset.x < -80 || velocity.x < -400) pick('dare')
              }}
            >
              {/* G-TruthOrDare-75：結果區 padding、safe-area */}
              <div className={`p-4 md:p-6 lg:p-10 rounded-2xl md:rounded-[2rem] border backdrop-blur-3xl shadow-2xl relative overflow-hidden cursor-grab active:cursor-grabbing safe-area-px ${mode === 'truth' ? 'bg-pink-900/20 border-pink-500/30' : 'bg-orange-900/20 border-orange-500/30'
                }`}>
                {/* Background Decor */}
                <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-40 ${mode === 'truth' ? 'bg-pink-500' : 'bg-orange-500'
                  }`} />

                <div className="flex items-center justify-between gap-4 mb-4 md:mb-6">
                  <span className={`text-xs md:text-sm font-mono tracking-[0.3em] uppercase ${mode === 'truth' ? 'text-pink-400' : 'text-orange-400'}`}>
                    {mode === 'truth' ? 'Honest Answer' : 'Challenge Accepted'}
                  </span>
                  {secondsLeft !== null && (
                    <span className={`text-base sm:text-lg md:text-xl font-mono font-bold tabular-nums whitespace-nowrap ${secondsLeft <= 5 ? 'text-red-400' : 'text-primary-400'}`} role="timer" aria-live="polite">
                      {secondsLeft} 秒
                    </span>
                  )}
                </div>

                {/* G-TruthOrDare-71：題目字級 RWD 避免小螢幕溢出 */}
                <h2
                  ref={questionRef}
                  tabIndex={-1}
                  className="games-question text-lg md:text-2xl font-bold text-white leading-relaxed mb-4 md:mb-6 outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-inset rounded-lg games-focus-ring max-w-full"
                  role="status"
                  aria-live="polite"
                >
                  {content}
                </h2>
                <CopyResultButton
                  text={`真心話大冒險（${mode === 'truth' ? '真心話' : '大冒險'}）：${content}`}
                  label="複製這題"
                  className="mb-4"
                />
                <p className="sr-only" role="status" aria-live="polite">
                  本局已出 {mode === 'truth' ? usedTruth.size : usedDare.size} 題，不重複
                </p>
                {skipCount > 0 && (
                  <p className="text-white/40 text-sm mb-3" aria-live="polite">本局跳過 {skipCount} 次</p>
                )}
                <div className="flex gap-3 sm:gap-4 w-full max-w-lg flex-wrap sm:flex-nowrap">
                  <m.button whileHover={buttonHover} whileTap={buttonTap} type="button" onClick={skip} disabled={isSkipPending} className="flex-1 min-h-[48px] min-w-[48px] inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed games-focus-ring" aria-label={skipPoints > 0 ? t('truthOrDare.skipWithPointAria') : t('truthOrDare.skipWithDrinkAria')} data-testid="truth-or-dare-skip">
                    <SkipForward className="w-4 h-4 shrink-0" />
                    <span className="truncate">{isSkipPending ? '…' : (skipPoints > 0 ? t('truthOrDare.skipWithPoint', { count: skipPoints }) : t('truthOrDare.skipWithDrink'))}</span>
                  </m.button>
                  <m.button whileHover={buttonHover} whileTap={buttonTap} type="button" onClick={backToMenu} className="flex-1 min-h-[48px] min-w-[48px] btn-primary inline-flex items-center justify-center gap-2 games-focus-ring" data-testid="truth-or-dare-next-round">
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    <span className="truncate">完成 / 下一輪</span>
                  </m.button>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      )}
    </m.div>
  )
}
