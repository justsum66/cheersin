'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThumbsUp, ThumbsDown, Copy, Hand, EyeOff, Trophy } from 'lucide-react'
import GameRules from './GameRules'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import { logger } from '@/lib/logger'
import { getStatementsByCategory, CATEGORY_LABEL, type NeverHaveIEverCategory } from '@/lib/never-have-i-ever'

/** 266–270 題庫分類：愛情/職場/生活/黑歷史/18+（直接使用 data/neverHaveIEver.json） */
const CATEGORY_OPTIONS: { value: NeverHaveIEverCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'love', label: CATEGORY_LABEL.love },
  { value: 'work', label: CATEGORY_LABEL.work },
  { value: 'life', label: CATEGORY_LABEL.life },
  { value: 'dark', label: CATEGORY_LABEL.dark },
  { value: 'adult', label: CATEGORY_LABEL.adult },
]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

export default function NeverHaveIEver() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const [categoryFilter, setCategoryFilter] = useState<NeverHaveIEverCategory | 'all'>('all')
  const [pool, setPool] = useState<{ text: string; category: NeverHaveIEverCategory }[]>(() => {
    const filtered = getStatementsByCategory('all')
    return [...filtered].sort(() => Math.random() - 0.5)
  })
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
      }
      setPool((prev) => prev.filter((_, i) => i !== currentIndex))
      setCurrentIndex(0)
      setCurrentPlayerIndex((i) => (i + 1) % players.length)
      setDoneCountCurrentCard(0)
    },
    [currentIndex, currentPlayerIndex, players.length, play]
  )

  const handleNoIDidNot = useCallback(() => {
    if (current) nextCard(false)
  }, [current, nextCard])

  const startNewRound = useCallback(() => {
    if (isNewRoundPending) return
    setIsNewRoundPending(true)
    if (newRoundCooldownRef.current) clearTimeout(newRoundCooldownRef.current)
    newRoundCooldownRef.current = setTimeout(() => {
      newRoundCooldownRef.current = null
      setIsNewRoundPending(false)
    }, 400)
    const filtered = getStatementsByCategory(categoryFilter)
    const shuffled = [...filtered].sort(() => Math.random() - 0.5)
    setPool(shuffled)
    setRoundTotal(shuffled.length)
    setUsedInRound(0)
    setCurrentIndex(0)
    setDoneCountCurrentCard(0)
  }, [categoryFilter, isNewRoundPending])

  /** 47 我做過：舉手動畫後下一題 */
  const handleIDidIt = useCallback(() => {
    if (!current) return
    if (handRaiseTimeoutRef.current) clearTimeout(handRaiseTimeoutRef.current)
    setHandRaise(true)
    handRaiseTimeoutRef.current = setTimeout(() => {
      handRaiseTimeoutRef.current = null
      setHandRaise(false)
      nextCard(true)
    }, 600)
  }, [current, nextCard])

  /** 49 老司機：最高次數者 */
  const leaderboard = Object.entries(doneCountByPlayer)
    .map(([i, count]) => ({ index: Number(i), name: players[Number(i)] ?? `玩家 ${Number(i) + 1}`, count }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
  const topPlayer = leaderboard[0]

  useEffect(() => {
    const filtered = getStatementsByCategory(categoryFilter)
    setRoundTotal(filtered.length)
  }, [categoryFilter])

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
    }
  }, [])

  const exhausted = pool.length === 0 && usedInRound > 0
  const displayProgress = current ? `${usedInRound + 1} / ${roundTotal}` : (exhausted ? `已出完 ${roundTotal} 題` : '—')

    return (
        <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="我從來沒有">
            <GameRules rules={`輪流出題「我從來沒有…」，做過該事的人喝。\n可選分類：愛情／職場／生活／黑歷史／18+；本局不重複已出題。匿名模式不顯示誰做過。`} rulesKey="never-have-i-ever.rules" />
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-2 w-full max-w-lg justify-center" role="group" aria-label="題目分類">
                {CATEGORY_OPTIONS.map(({ value, label }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => { setCategoryFilter(value); startNewRound(); }}
                        aria-pressed={categoryFilter === value}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors min-h-[48px] min-w-[48px] games-focus-ring ${categoryFilter === value ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            {/* G3D-NeverHaveIEver-05/06：分類區標籤/開關排版；匿名/進度區數字與標籤排版 */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 w-full max-w-lg justify-center">
              <p className="text-white/40 text-sm tabular-nums games-helper" aria-live="polite">第 {displayProgress} 題</p>
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
            </div>
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
                    <motion.div
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
                        {/* G3D-NeverHaveIEver-12：題目卡右上複製鈕不遮字、圖示 */}
                        <button
                            type="button"
                            onClick={copyCurrentStatement}
                            className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center games-focus-ring shrink-0"
                            aria-label="複製題目"
                        >
                            <Copy className="w-5 h-5 shrink-0" />
                        </button>
                    </motion.div>
                </AnimatePresence>
            </div>
            )}

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
                {/* G3D-NeverHaveIEver-02：沒做過/做過按鈕 3D 立體、按壓回饋 */}
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => current && handleNoIDidNot()}
                    disabled={!current}
                    className="min-h-[48px] min-w-[48px] w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center hover:bg-red-500/40 hover:shadow-[0_4px_16px_rgba(220,38,38,0.3)] transition-colors transition-shadow disabled:opacity-50 games-focus-ring"
                    aria-label="沒做過"
                >
                    <ThumbsDown className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
                </motion.button>

                <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => current && handleIDidIt()}
                    disabled={!current}
                    className="relative min-h-[48px] min-w-[48px] w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center hover:bg-green-500/40 hover:shadow-[0_4px_16px_rgba(34,197,94,0.3)] transition-colors transition-shadow disabled:opacity-50 overflow-visible games-focus-ring"
                    aria-label="做過"
                >
                    {/* Phase 1 C4.3: 舉手動畫增強 */}
                    <AnimatePresence>
                      {handRaise && (
                        <>
                          {/* 舉手手勢 */}
                          {/* P1-148：手指彎曲動畫 — 舉手後微彎曲，模擬真實遊戲場景 */}
                          <motion.div
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
                          </motion.div>
                          {/* 光暈效果 */}
                          <motion.div
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
                </motion.button>
            </div>
            {/* G3D-NeverHaveIEver-04：排行榜列表 3D 卡片或層次感 */}
            {!anonymousMode && leaderboard.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 w-full max-w-xs max-h-40 overflow-y-auto shadow-[0_4px_16px_rgba(0,0,0,0.15)]" role="region" aria-label="做過次數排行榜" aria-live="polite">
                <p className="text-white/60 text-xs mb-2 flex items-center gap-1 sticky top-0 bg-black/20 -m-1 p-1 rounded">
                  <Trophy className="w-3 h-3 shrink-0" /> 做過次數
                </p>
                <ul className="space-y-2 text-sm">
                  {leaderboard.map((entry, i) => (
                    <li key={entry.index} className="flex items-center justify-between text-white/80 py-1.5 px-2 rounded-lg bg-white/5 border border-white/5 tabular-nums">
                      <span>
                        {i === 0 && entry.count > 0 ? (
                          <span className="text-amber-400 font-medium">老司機 </span>
                        ) : null}
                        {entry.name}
                      </span>
                      <span className="text-white/50">{entry.count} 次</span>
                    </li>
                  ))}
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
        </div>
    )
}
